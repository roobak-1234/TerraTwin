import json
import math
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor

# Load the Multi-Agency Planetary & Earth Analog Database
with open("analogs_database.json", "r", encoding="utf-8") as f:
    DB = json.load(f)

DIMENSIONS = DB["dimensions"]


# ─── Legacy & Scientific Similarity Functions ────────────────────────────────

def weighted_cosine_similarity(
    target_vec: dict,
    earth_vec: dict,
    weights: dict
) -> float:
    """
    Original 8-Dimensional Weighted Cosine Similarity.
    Pure directional match.
    """
    dot_product = 0.0
    norm_target = 0.0
    norm_earth = 0.0
    for dim in DIMENSIONS:
        w = weights.get(dim, 1.0)
        vt = target_vec[dim]
        ve = earth_vec[dim]
        dot_product += w * vt * ve
        norm_target += w * (vt ** 2)
        norm_earth += w * (ve ** 2)
    if norm_target == 0 or norm_earth == 0:
        return 0.0
    return round((dot_product / (math.sqrt(norm_target) * math.sqrt(norm_earth))) * 100, 2)


def rbf_cosine_hybrid_similarity(
    target_vec: dict,
    earth_vec: dict,
    weights: dict,
    is_uncharted: bool = True,
    sigma: float = 58.0
) -> float:
    """
    Hybrid RBF-Kernel + Cosine Similarity (matches the upgraded frontend metric).
    - RBF Kernel (55%): Gaussian distance penalty — captures MAGNITUDE accuracy (sigma = 58.0).
    - Cosine Similarity (45%): Directional profile shape.
    - Novelty Penalty (-3.5 pts) for over-studied classic benchmarks.
    Result clamped to [12, 98.5]%.
    """
    weighted_sq_error = 0.0
    total_weight = 0.0
    dot = 0.0
    norm_t = 0.0
    norm_e = 0.0

    for dim in DIMENSIONS:
        w = weights.get(dim, 1.0)
        diff = target_vec[dim] - earth_vec[dim]
        weighted_sq_error += w * diff * diff
        total_weight += w
        dot += w * target_vec[dim] * earth_vec[dim]
        norm_t += w * target_vec[dim] ** 2
        norm_e += w * earth_vec[dim] ** 2

    if total_weight == 0 or norm_t == 0 or norm_e == 0:
        return 0.0

    rmse = math.sqrt(weighted_sq_error / total_weight)
    rbf_score = 100.0 * math.exp(-((rmse / sigma) ** 2))
    cos_score = (dot / (math.sqrt(norm_t) * math.sqrt(norm_e))) * 100.0
    hybrid = 0.55 * rbf_score + 0.45 * cos_score

    if not is_uncharted:
        hybrid -= 3.5

    return round(max(12.0, min(98.5, hybrid)), 1)


def csa_sar_roughness_similarity(target_sigma0_db: float, earth_sigma0_db: float) -> float:
    """CSA RADARSAT-1/RCM & LRO Mini-RF SAR backscatter comparison."""
    diff_db = abs(target_sigma0_db - earth_sigma0_db)
    return round(max(0.0, 100.0 * (1.0 - diff_db / 15.0)), 1)


def compute_gravity_compensation(rover_mass_kg: float, target_g: float) -> dict:
    """Mechanical offloading for Earth field tests (9.81 m/s² → target gravity)."""
    earth_g = 9.81
    earth_weight_n = rover_mass_kg * earth_g
    target_weight_n = rover_mass_kg * target_g
    offload_n = earth_weight_n - target_weight_n
    return {
        "earth_weight_N": round(earth_weight_n, 1),
        "target_weight_N": round(target_weight_n, 1),
        "counterweight_offload_N": round(offload_n, 1),
        "offload_percentage": round((offload_n / earth_weight_n) * 100.0, 1),
    }


def compute_bekker_sinkage(
    rover_mass_kg: float,
    target_g: float,
    site_terramechanics: dict = None,
    b: float = 0.25,
    l: float = 0.20
) -> dict:
    """
    Bekker Regolith Wheel Sinkage (z0 in cm):
    p = (kc / b + kphi) * z0^n
    Computes Earth uncompensated sinkage vs target simulated sinkage.
    """
    earth_g = 9.81
    tm = site_terramechanics or {"kc_kpa": 1.8, "kphi_kpa": 890.0, "n_exponent": 1.0}
    kc = tm.get("kc_kpa", 1.8)
    kphi = tm.get("kphi_kpa", 890.0)
    n = tm.get("n_exponent", 1.0)

    # 4-wheel rover distribution
    w_earth_per_wheel = (rover_mass_kg * earth_g) / 4.0
    w_target_per_wheel = (rover_mass_kg * target_g) / 4.0
    contact_area = b * l
    modulus = (kc / b) + kphi

    # Convert modulus from kPa to Pa: modulus * 1000
    denom = contact_area * modulus * 1000.0
    z_earth_cm = (((w_earth_per_wheel / denom) ** (1.0 / n)) * 100.0) if denom > 0 else 0.0
    z_target_cm = (((w_target_per_wheel / denom) ** (1.0 / n)) * 100.0) if denom > 0 else 0.0

    slip_risk = (
        "LOW (Optimal Regolith Traction)" if z_target_cm < 2.0 else
        ("MODERATE (Nominal Grouser Bite)" if z_target_cm <= 4.0 else "HIGH SLIP RISK (Grouser Excavation Warning)")
    )
    return {
        "z_earth_cm": round(z_earth_cm, 2),
        "z_target_cm": round(z_target_cm, 2),
        "slip_risk": slip_risk,
    }


def compute_solar_attenuation(target_flux_wm2: float, earth_flux_wm2: float = 1040.0) -> dict:
    """
    Solar Array & Dust Attenuation Simulator (W/m²):
    Compares target planetary flux vs Earth field flux.
    """
    if target_flux_wm2 <= 0.0:
        return {
            "target_flux_wm2": 0.0,
            "earth_flux_wm2": earth_flux_wm2,
            "attenuation_pct": 100.0,
            "compensation": "100% Dark Shroud (Zero Natural Sunlight in Lava Tube Cave)",
        }
    att_pct = max(0.0, round((1.0 - (target_flux_wm2 / earth_flux_wm2)) * 100.0, 1))
    return {
        "target_flux_wm2": target_flux_wm2,
        "earth_flux_wm2": earth_flux_wm2,
        "attenuation_pct": att_pct,
        "compensation": f"Apply {att_pct}% Neutral-Density Optical Filter on Rover PV Array",
    }


# ─── Machine Learning Pipeline (PCA + K-Means + Random Forest) ──────────────

def run_ml_analog_discovery():
    targets = DB["planetary_targets"]
    earth_sites = DB["earth_analogs"]

    # 1. Build 8D Feature Matrix X (Planetary Targets + Earth Sites combined)
    all_items = targets + earth_sites
    X_raw = np.array(
        [[item["vector"][d] for d in DIMENSIONS] for item in all_items],
        dtype=float
    )

    # 2. Z-Score Standardisation (StandardScaler)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)

    # 3. Unsupervised PCA (8D → 2D Latent Space)
    pca = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    explained_var = float(np.sum(pca.explained_variance_ratio_) * 100)

    # 4. Unsupervised K-Means Clustering → 4 Geophysical Archetypes
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)

    cluster_names = {
        0: "Archetype A: Fluvial-Sulfate & Lacustrine Biosignature Basins",
        1: "Archetype B: Cryogenic Periglacial & Polar Volatile Traps",
        2: "Archetype C: High-Slope Basaltic/Anorthositic Impact Rims",
        3: "Archetype D: Subterranean Flood Basalt Lava Tubes",
    }

    print(f"=== TERRATWIN ML ENGINE (scikit-learn PCA Variance Captured: {explained_var:.1f}%) ===\n")

    X_targets = X_raw[: len(targets)]
    X_earth = X_raw[len(targets) :]

    default_weights = {d: 1.0 for d in DIMENSIONS}
    ml_output = {
        "pca_explained_variance_pct": round(explained_var, 2),
        "scaler_mean": [round(float(m), 2) for m in scaler.mean_],
        "scaler_std": [round(float(s), 2) for s in scaler.scale_],
        "pca_components": [[round(float(c), 4) for c in comp] for comp in pca.components_],
        "targets": [],
    }

    for t_idx, target in enumerate(targets):
        t_vec_dict = target["vector"]
        t_vec_arr = X_targets[t_idx]
        t_cluster = int(clusters[t_idx])
        target_solar = target.get("solar_flux_wm2", 150.0)

        print(
            f"TARGET: {target['name']} ({target['body']})\n"
            f"  ML Cluster → {cluster_names.get(t_cluster, 'Unknown')}\n"
            f"  PCA Latent Coords → [{X_pca[t_idx][0]:.2f}, {X_pca[t_idx][1]:.2f}]"
        )

        # 5. RBF Kernel Similarity per Earth site
        scores = []
        for e_idx, site in enumerate(earth_sites):
            rmse = float(np.sqrt(np.mean((t_vec_arr - X_earth[e_idx]) ** 2)))
            rbf_sim = 100.0 * np.exp(-((rmse / 38.0) ** 2))
            if not site["unrecognized_gem"]:
                rbf_sim -= 4.5  # Novelty penalty for Atacama benchmark
            rbf_sim = max(0.0, rbf_sim)

            hybrid_sim = rbf_cosine_hybrid_similarity(
                t_vec_dict, site["vector"], default_weights, site["unrecognized_gem"]
            )
            e_cluster = int(clusters[len(targets) + e_idx])
            pca_coords = [round(float(c), 2) for c in X_pca[len(targets) + e_idx]]
            scores.append((round(float(rbf_sim), 1), hybrid_sim, e_cluster, pca_coords, site))

        scores.sort(key=lambda x: x[0], reverse=True)

        # 6. Random Forest → top driving dimension for this target
        y_rf = [
            100.0 * np.exp(-((np.sqrt(np.mean((t_vec_arr - X_earth[e]) ** 2)) / 38.0) ** 2))
            for e in range(len(earth_sites))
        ]
        rf = RandomForestRegressor(n_estimators=50, random_state=42)
        rf.fit(X_earth, y_rf)
        top_dim_idx = int(np.argmax(rf.feature_importances_))
        feature_importances = {DIMENSIONS[i]: round(float(v), 4) for i, v in enumerate(rf.feature_importances_)}

        for rank, (rbf_s, hybrid_s, c_id, pca_c, site) in enumerate(scores[:3], 1):
            tag = "UNCHARTED GEM" if site["unrecognized_gem"] else "BENCHMARK"
            opt_win = site.get("optimal_window", "JAN – MAY")
            print(
                f"  #{rank} {site['name']} [{tag}]\n"
                f"       RBF-ML: {rbf_s}%  |  Hybrid (Frontend): {hybrid_s}%\n"
                f"       PCA Coords: {pca_c}  |  ML Cluster: {cluster_names.get(c_id,'?')}\n"
                f"       Optimal Field Deployment Window: {opt_win}"
            )

        print(f"\n  🔍 Random Forest Top Driving Dimension: {DIMENSIONS[top_dim_idx].upper()}")

        # Gravity compensation & Bekker Terramechanics
        top_site = scores[0][4]
        comp = compute_gravity_compensation(350.0, target["gravity_ms2"])
        bekker = compute_bekker_sinkage(350.0, target["gravity_ms2"], top_site.get("terramechanics"))
        solar = compute_solar_attenuation(target_solar, top_site.get("solar_flux_wm2", 1040.0))

        print(
            f"  ⚙  350 kg Rover Gravity Compensation: Offload {comp['offload_percentage']}% "
            f"({comp['counterweight_offload_N']} N)\n"
            f"  🚜 Bekker Terramechanics at {top_site['name']}:\n"
            f"       Earth Sinkage: {bekker['z_earth_cm']} cm → Target Sinkage: {bekker['z_target_cm']} cm | Slip Risk: {bekker['slip_risk']}\n"
            f"  ☀️ Solar Flux Compensation:\n"
            f"       Target: {solar['target_flux_wm2']} W/m² vs Earth: {solar['earth_flux_wm2']} W/m² | {solar['compensation']}\n"
            f"  {'─'*76}\n"
        )

        ml_output["targets"].append({
            "id": target["id"],
            "name": target["name"],
            "body": target["body"],
            "ml_cluster": cluster_names.get(t_cluster, "Unknown"),
            "pca_coords": [round(float(c), 2) for c in X_pca[t_idx]],
            "rf_top_dimension": DIMENSIONS[top_dim_idx],
            "rf_feature_importances": feature_importances,
            "gravity_compensation_350kg": comp,
            "bekker_terramechanics_350kg": bekker,
            "solar_attenuation": solar,
            "ranked_earth_sites": [
                {
                    "rank": rank + 1,
                    "id": site["id"],
                    "name": site["name"],
                    "region": site["region"],
                    "rbf_ml_score": rbf_s,
                    "hybrid_score": hybrid_s,
                    "sar_match_pct": csa_sar_roughness_similarity(
                        target["target_specs"]["sar_sigma0_db"],
                        site["metrics"]["sar_sigma0_db"]
                    ),
                    "pca_coords": pca_c,
                    "ml_cluster": cluster_names.get(c_id, "Unknown"),
                    "uncharted_gem": site["unrecognized_gem"],
                    "optimal_window": site.get("optimal_window", "JAN – APR"),
                    "seasonal_fidelity": site.get("seasonal_fidelity", []),
                }
                for rank, (rbf_s, hybrid_s, c_id, pca_c, site) in enumerate(scores)
            ],
        })

    # Export ml_results.json
    with open("ml_results.json", "w", encoding="utf-8") as out:
        json.dump(ml_output, out, indent=2)
    print("✅  ml_results.json written to backend_science/\n")

    return ml_output


if __name__ == "__main__":
    run_ml_analog_discovery()
