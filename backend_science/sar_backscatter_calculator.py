#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sar_backscatter_calculator.py — TerraTwin
2026 NASA Space Apps Challenge

Synthetic Aperture Radar (SAR) Backscatter & Polarimetry Processor
Directly implements algorithms from the Canadian Space Agency (CSA) SAR Tutorial
and NASA LRO Mini-RF / RADARSAT Constellation Mission (RCM) physics.
"""

import math
import argparse
import json
from typing import Dict, Any


def linear_to_db(linear_val: float) -> float:
    """Converts linear radar power to decibels (dB): σ⁰(dB) = 10 * log10(σ⁰_linear)."""
    if linear_val <= 0:
        return -99.0
    return round(10.0 * math.log10(linear_val), 2)


def db_to_linear(db_val: float) -> float:
    """Converts decibels to linear power: σ⁰_linear = 10^(σ⁰_dB / 10)."""
    return round(10.0 ** (db_val / 10.0), 6)


def compute_cpr(sigma0_sc_db: float, sigma0_oc_db: float) -> float:
    """
    Computes Circular Polarization Ratio (CPR):
    CPR = σ⁰_SC / σ⁰_OC (Same-Sense Circular / Opposite-Sense Circular).
    A hallmark of LRO Mini-RF and CSA RADARSAT planetary radar:
    - CPR < 0.4: Smooth regolith or dust plains (specular reflection dominant).
    - 0.4 <= CPR <= 1.0: Rough blocky boulder fields (multiple surface scattering).
    - CPR > 1.0: Volumetric scattering within pure water ice or highly fractured glass.
    """
    p_sc = db_to_linear(sigma0_sc_db)
    p_oc = db_to_linear(sigma0_oc_db)
    if p_oc <= 0:
        return 0.0
    return round(p_sc / p_oc, 3)


def rayleigh_roughness_criterion(wavelength_cm: float, incidence_angle_deg: float) -> Dict[str, float]:
    """
    Evaluates Rayleigh criterion for radar smoothness vs. roughness:
    h_smooth < λ / (8 * cos(θ))
    h_rough  > λ / (4.4 * cos(θ))
    """
    rad = math.radians(incidence_angle_deg)
    cos_theta = math.cos(rad)
    if cos_theta <= 0:
        cos_theta = 0.001

    h_smooth_cm = wavelength_cm / (8.0 * cos_theta)
    h_rough_cm = wavelength_cm / (4.4 * cos_theta)

    return {
        "wavelength_cm": wavelength_cm,
        "incidence_angle_deg": incidence_angle_deg,
        "smooth_threshold_rms_cm": round(h_smooth_cm, 2),
        "rough_threshold_rms_cm": round(h_rough_cm, 2),
    }


def analyze_radar_signature(
    sigma0_hh_db: float,
    sigma0_hv_db: float,
    frequency_band: str = "C-band",
    incidence_angle_deg: float = 35.0,
) -> Dict[str, Any]:
    """
    Analyzes dual-polarization SAR backscatter (CSA RADARSAT-1/RCM & Sentinel-1).
    Evaluates depolarization ratio and classifies geological surface texture.
    """
    wavelengths = {
        "X-band": 3.1,   # ~9.6 GHz
        "C-band": 5.6,   # ~5.4 GHz (RADARSAT / Sentinel-1)
        "S-band": 12.6,  # ~2.4 GHz (LRO Mini-RF)
        "L-band": 23.5,  # ~1.2 GHz (ALOS PALSAR)
    }
    wl = wavelengths.get(frequency_band, 5.6)
    rayleigh = rayleigh_roughness_criterion(wl, incidence_angle_deg)

    # Cross-pol to Co-pol depolarization ratio
    depol_ratio_db = round(sigma0_hv_db - sigma0_hh_db, 2)
    diff_linear = db_to_linear(sigma0_hv_db) / max(1e-9, db_to_linear(sigma0_hh_db))

    # Geomorphological classification based on CSA and LRO empirical thresholds
    if sigma0_hh_db > -7.0:
        terrain_type = "Blocky Impact Ejecta / Rugged Bedrock Scree (Severe Rover Hazard)"
        hazard_level = "HIGH"
    elif sigma0_hh_db > -13.0:
        terrain_type = "Medium-Rough Regolith / Fractured Basalt Floor (Optimal Traction)"
        hazard_level = "LOW"
    elif sigma0_hh_db > -18.0:
        terrain_type = "Smooth Volcanic Ash Plains / Aeolian Sand Sheet"
        hazard_level = "MODERATE (Sinkage Risk)"
    else:
        terrain_type = "Hyper-Smooth Dust Basin / Specular Playa Surface"
        hazard_level = "ELEVATED (Low Friction)"

    return {
        "band": frequency_band,
        "wavelength_cm": wl,
        "sigma0_hh_db": sigma0_hh_db,
        "sigma0_hv_db": sigma0_hv_db,
        "depolarization_ratio_db": depol_ratio_db,
        "terrain_classification": terrain_type,
        "rover_hazard_level": hazard_level,
        "rayleigh_criteria": rayleigh,
    }


def compare_planetary_sar(target_sigma0: float, earth_sigma0: float) -> Dict[str, Any]:
    """Computes backscatter fidelity match percentage between Target and Earth site."""
    diff_db = abs(target_sigma0 - earth_sigma0)
    match_pct = max(0.0, round(100.0 * (1.0 - diff_db / 15.0), 1))
    return {
        "target_sigma0_db": target_sigma0,
        "earth_sigma0_db": earth_sigma0,
        "decibel_difference": round(diff_db, 2),
        "sar_roughness_match_pct": match_pct,
        "interpretation": "High-Fidelity Dielectric & Texture Twin" if match_pct >= 85.0 else "Moderate Geotechnical Analog",
    }


def main():
    parser = argparse.ArgumentParser(
        description="TerraTwin — CSA RADARSAT & LRO Mini-RF SAR Backscatter Calculator"
    )
    parser.add_argument("--hh", type=float, default=-7.2, help="HH backscatter in dB (default: -7.2)")
    parser.add_argument("--hv", type=float, default=-14.5, help="HV cross-polarization backscatter in dB")
    parser.add_argument("--band", default="C-band", choices=["X-band", "C-band", "S-band", "L-band"], help="Radar band")
    parser.add_argument("--angle", type=float, default=35.0, help="Incidence angle in degrees")
    parser.add_argument("--sc", type=float, help="Same-sense circular dB (for CPR calculation)")
    parser.add_argument("--oc", type=float, help="Opposite-sense circular dB (for CPR calculation)")
    parser.add_argument("--compare-target", type=float, help="Planetary target sigma0 dB to compare against")

    args = parser.parse_args()

    print(f"\n{'='*75}")
    print(f"🛰️ CSA Synthetic Aperture Radar (SAR) Processor — TerraTwin 2026")
    print(f"{'='*75}")
    print(f"Frequency Band:    {args.band}")
    print(f"Incidence Angle:   {args.angle}°")
    print(f"Input Backscatter: σ⁰_HH = {args.hh} dB, σ⁰_HV = {args.hv} dB\n")

    res = analyze_radar_signature(args.hh, args.hv, frequency_band=args.band, incidence_angle_deg=args.angle)

    print(f"📊 Radar Texture Analysis:")
    print(f"  • Terrain Type:        {res['terrain_classification']}")
    print(f"  • Depolarization Ratio: {res['depolarization_ratio_db']} dB")
    print(f"  • Rover Hazard Level:  {res['rover_hazard_level']}")
    print(f"  • Rayleigh Smooth Max: < {res['rayleigh_criteria']['smooth_threshold_rms_cm']} cm RMS")
    print(f"  • Rayleigh Rough Min:  > {res['rayleigh_criteria']['rough_threshold_rms_cm']} cm RMS\n")

    if args.sc is not None and args.oc is not None:
        cpr = compute_cpr(args.sc, args.oc)
        print(f"🔬 Polarimetric CPR Analysis (LRO Mini-RF / RADARSAT):")
        print(f"  • Circular Polarization Ratio (CPR): {cpr}")
        if cpr > 1.0:
            print(f"  • Anomaly Flag: VOLUMETRIC ICE SCATTERING (High CPR > 1.0)")
        elif cpr >= 0.4:
            print(f"  • Anomaly Flag: Surface Rock Scattering (0.4 - 1.0)")
        else:
            print(f"  • Anomaly Flag: Specular Dust/Plains (< 0.4)")
        print()

    if args.compare_target is not None:
        comp = compare_planetary_sar(args.compare_target, args.hh)
        print(f"🎯 Target Radar Matching:")
        print(f"  • Target: {comp['target_sigma0_db']} dB vs Earth: {comp['earth_sigma0_db']} dB")
        print(f"  • Match Score: {comp['sar_roughness_match_pct']}% ({comp['interpretation']})\n")


if __name__ == "__main__":
    main()
