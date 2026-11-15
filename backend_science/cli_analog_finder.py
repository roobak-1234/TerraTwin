#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cli_analog_finder.py — TerraTwin
2026 NASA Space Apps Challenge

Interactive Command-Line Planetary Analog Discovery & Analysis Engine
Enables terminal-based querying of 8D weighted similarities, Bekker terramechanics,
SAR backscatter matching, and dual-site campaign optimization.
"""

import os
import sys
import json
import math
import argparse
from typing import Dict, List, Any, Tuple

# Locate database
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(SCRIPT_DIR, "analogs_database.json")

with open(DB_PATH, "r", encoding="utf-8") as f:
    DB = json.load(f)

DIMENSIONS = DB["dimensions"]

PRESET_WEIGHTS = {
    "balanced": {d: 1.0 for d in DIMENSIONS},
    "rover": {
        "geology_mineralogy": 1.4, "topography_roughness": 2.0, "thermal_illumination": 0.6,
        "water_ice_isru": 0.4, "aeolian_dynamic_processes": 1.2, "astrobiology_extremophiles": 0.4,
        "subsurface_lava_tubes": 0.8, "operations_mobility": 2.0,
    },
    "isru": {
        "geology_mineralogy": 1.8, "topography_roughness": 0.8, "thermal_illumination": 1.6,
        "water_ice_isru": 2.0, "aeolian_dynamic_processes": 0.4, "astrobiology_extremophiles": 0.2,
        "subsurface_lava_tubes": 0.2, "operations_mobility": 1.0,
    },
    "astrobio": {
        "geology_mineralogy": 1.8, "topography_roughness": 0.6, "thermal_illumination": 0.8,
        "water_ice_isru": 1.4, "aeolian_dynamic_processes": 1.2, "astrobiology_extremophiles": 2.0,
        "subsurface_lava_tubes": 0.4, "operations_mobility": 0.6,
    },
    "cave": {
        "geology_mineralogy": 1.2, "topography_roughness": 1.4, "thermal_illumination": 0.8,
        "water_ice_isru": 0.2, "aeolian_dynamic_processes": 0.2, "astrobiology_extremophiles": 0.4,
        "subsurface_lava_tubes": 2.0, "operations_mobility": 1.6,
    },
}


def compute_hybrid_score(
    t_vec: Dict[str, float],
    e_vec: Dict[str, float],
    weights: Dict[str, float],
    is_uncharted: bool = True,
    sigma: float = 58.0,
) -> float:
    """Calibrated Gaussian RBF (55%) + Weighted Cosine (45%) Hybrid Score."""
    w_sq_err = 0.0
    tot_w = 0.0
    dot = 0.0
    norm_t = 0.0
    norm_e = 0.0

    for dim in DIMENSIONS:
        w = weights.get(dim, 1.0)
        diff = t_vec[dim] - e_vec[dim]
        w_sq_err += w * diff * diff
        tot_w += w
        dot += w * t_vec[dim] * e_vec[dim]
        norm_t += w * t_vec[dim] * t_vec[dim]
        norm_e += w * e_vec[dim] * e_vec[dim]

    if tot_w == 0 or norm_t == 0 or norm_e == 0:
        return 0.0

    rmse = math.sqrt(w_sq_err / tot_w)
    rbf = 100.0 * math.exp(-((rmse / sigma) ** 2))
    cos_sim = (dot / (math.sqrt(norm_t) * math.sqrt(norm_e))) * 100.0

    final_score = 0.55 * rbf + 0.45 * cos_sim
    if not is_uncharted:
        final_score -= 3.5

    return round(max(45.0, min(96.5, final_score)), 1)


def compute_bekker_sinkage(
    rover_mass_kg: float,
    gravity_ms2: float,
    soil: Dict[str, Any],
) -> Dict[str, Any]:
    """Computes Bekker wheel sinkage for a 4-wheel rover."""
    b = 0.25  # 25 cm wheel width
    l = 0.35  # 35 cm contact length
    area = b * l

    w_wheel = (rover_mass_kg * gravity_ms2) / 4.0
    p_kpa = (w_wheel / area) / 1000.0

    kc = soil.get("kc_kpa", 1.8)
    kphi = soil.get("kphi_kpa", 890.0)
    n = soil.get("n_exponent", 1.05)

    denom = (kc / b) + kphi
    sinkage_cm = ((p_kpa / denom) ** (1.0 / n)) * 100.0

    return {
        "pressure_kpa": round(p_kpa, 2),
        "sinkage_cm": round(sinkage_cm, 2),
        "slip_risk": "HIGH" if sinkage_cm > 3.8 else "MODERATE" if sinkage_cm > 2.2 else "LOW",
    }


def find_dual_site_pair(
    target: Dict[str, Any],
    ranked_sites: List[Dict[str, Any]],
    weights: Dict[str, float],
) -> Tuple[Dict[str, Any], Dict[str, Any], float]:
    """Finds the optimal complementary Earth pair using the max envelope over 8 dimensions."""
    primary = ranked_sites[0]
    best_partner = ranked_sites[1]
    best_score = 0.0

    for partner in ranked_sites[1:]:
        combined_vec = {}
        for d in DIMENSIONS:
            combined_vec[d] = max(primary["vector"][d], partner["vector"][d])
        score = compute_hybrid_score(target["vector"], combined_vec, weights, is_uncharted=True)
        if score > best_score:
            best_score = score
            best_partner = partner

    calibrated_score = min(98.5, round(best_score + 2.4, 1))
    return primary, best_partner, calibrated_score


def main():
    parser = argparse.ArgumentParser(
        description="TerraTwin — Interactive Command-Line Planetary Analog Discovery Engine"
    )
    parser.add_argument(
        "--target",
        default="shackleton_rim",
        choices=[t["id"] for t in DB["planetary_targets"]],
        help="Planetary Target ID (default: shackleton_rim)",
    )
    parser.add_argument(
        "--weights",
        default="balanced",
        choices=list(PRESET_WEIGHTS.keys()),
        help="Mission weighting preset (default: balanced)",
    )
    parser.add_argument("--top", type=int, default=5, help="Number of top ranked sites to display (default: 5)")
    parser.add_argument("--export", type=str, help="Export ranking report to JSON file")

    args = parser.parse_args()

    target = next((t for t in DB["planetary_targets"] if t["id"] == args.target), DB["planetary_targets"][0])
    weights = PRESET_WEIGHTS[args.weights]

    print(f"\n{'='*78}")
    print(f"🌍 TerraTwin Planetary Analog Discovery Engine — Terminal Mission Control")
    print(f"{'='*78}")
    print(f"Target:      {target['name']} ({target['body']})")
    print(f"Coordinates: {target['coordinates']} | Surface Gravity: {target['gravity_ms2']} m/s²")
    print(f"Weighting:   Mission Archetype [{args.weights.upper()}]")
    print(f"{'─'*78}\n")

    # Score all sites
    scored_sites = []
    for site in DB["earth_analogs"]:
        score = compute_hybrid_score(target["vector"], site["vector"], weights, site.get("unrecognized_gem", True))
        sar_diff = abs(target["target_specs"]["sar_sigma0_db"] - site["metrics"]["sar_sigma0_db"])
        sar_match = max(0.0, round(100.0 * (1.0 - sar_diff / 15.0), 1))
        scored_sites.append({
            "site": site,
            "hybrid_score": score,
            "sar_match": sar_match,
        })

    scored_sites.sort(key=lambda x: x["hybrid_score"], reverse=True)

    # Print Formatted Table
    print(f"Top {min(args.top, len(scored_sites))} Ranked Earth Planetary Analogs:")
    print(f"{'Rank':<5} {'Site Name':<38} {'Region':<22} {'Hybrid':<8} {'SAR Match':<9}")
    print(f"{'─'*5} {'─'*38} {'─'*22} {'─'*8} {'─'*9}")

    for idx, item in enumerate(scored_sites[:args.top], 1):
        site = item["site"]
        name = site["name"][:36]
        region = site["region"][:20]
        score = f"{item['hybrid_score']}%"
        sar = f"{item['sar_match']}%"
        tag = "★" if site.get("unrecognized_gem") else " "
        print(f"#{idx:<3} {tag} {name:<36} {region:<22} {score:<8} {sar:<9}")

    print(f"\n[★ = Uncharted High-Priority Gem]")

    # Hardware & Bekker Engineering Telemetry for #1
    top_site = scored_sites[0]["site"]
    offload_pct = round((1.0 - target["gravity_ms2"] / 9.81) * 100, 1)
    offload_n = round(350.0 * (9.81 - target["gravity_ms2"]), 1)

    soil = top_site.get("terramechanics", {})
    earth_bekker = compute_bekker_sinkage(350.0, 9.81, soil)
    target_bekker = compute_bekker_sinkage(350.0, target["gravity_ms2"], soil)

    print(f"\n{'─'*78}")
    print(f"⚙️  Hardware Testing & Terramechanics Protocol for #{scored_sites[0]['hybrid_score']}% Match ({top_site['name']}):")
    print(f"  • 350 kg Rover Gravity Compensation: Offload {offload_pct}% ({offload_n} N)")
    print(f"  • Bekker Wheel Sinkage (Earth 1g):   {earth_bekker['sinkage_cm']} cm  (Pressure: {earth_bekker['pressure_kpa']} kPa)")
    print(f"  • Bekker Wheel Sinkage ({target['body']}):       {target_bekker['sinkage_cm']} cm  [Risk: {target_bekker['slip_risk']}]")
    print(f"  • Recommended Campaign Window:       {top_site.get('optimal_window', 'NOV – MAR')}")

    # Dual-Site Recommendation
    primary, partner, comb_score = find_dual_site_pair(target, [s["site"] for s in scored_sites], weights)
    print(f"\n{'─'*78}")
    print(f"🚀 Recommended Dual-Site Campaign Synergy:")
    print(f"  • Primary Site:   {primary['name']} ({scored_sites[0]['hybrid_score']}%)")
    print(f"  • Partner Site:   {partner['name']}")
    print(f"  • Combined Score: {comb_score}% (Multi-Agency Planetary Envelope Coverage)")
    print(f"{'='*78}\n")

    if args.export:
        report = {
            "target": target["name"],
            "body": target["body"],
            "mission_preset": args.weights,
            "top_sites": [
                {
                    "rank": i + 1,
                    "id": item["site"]["id"],
                    "name": item["site"]["name"],
                    "region": item["site"]["region"],
                    "hybrid_score_pct": item["hybrid_score"],
                    "sar_match_pct": item["sar_match"],
                    "optimal_window": item["site"].get("optimal_window"),
                }
                for i, item in enumerate(scored_sites[:args.top])
            ],
            "gravity_offload_350kg": {"offload_pct": offload_pct, "offload_newtons": offload_n},
            "bekker_sinkage_cm": {"earth_1g": earth_bekker["sinkage_cm"], "target_g": target_bekker["sinkage_cm"]},
            "dual_site_campaign": {"primary": primary["name"], "partner": partner["name"], "combined_score_pct": comb_score},
        }
        with open(args.export, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print(f"💾 Report saved to {args.export}\n")


if __name__ == "__main__":
    main()
