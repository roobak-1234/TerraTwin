#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
nasa_earthdata_fetcher.py — TerraTwin
2026 NASA Space Apps Challenge

Automated NASA Common Metadata Repository (CMR) API Client
Directly queries open Earth science observations (MODIS, ASTER, VIIRS, EMIT)
for any planetary analog coordinates.
"""

import sys
import json
import argparse
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional

CMR_GRANULES_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"

# Curated NASA Earth science collections for planetary analog characterization
COLLECTIONS = {
    "MODIS_LST": {
        "short_name": "MOD11A2",
        "description": "MODIS/Terra Land Surface Temperature & Emissivity 8-Day L3 Global 1km",
        "agency": "NASA EOSDIS LP DAAC",
    },
    "ASTER_TIR": {
        "short_name": "AST_L1T",
        "description": "ASTER Precision Terrain Corrected Registered At-Sensor Radiance (VNIR/SWIR/TIR)",
        "agency": "NASA/METI LP DAAC",
    },
    "VIIRS_TRUECOLOR": {
        "short_name": "VNP09GA",
        "description": "VIIRS/Suomi-NPP Surface Reflectance Daily L2G Global 1km & 500m",
        "agency": "NASA LP DAAC",
    },
}

# Pre-indexed coordinates for TerraTwin Global Earth Analogs
ANALOG_COORDINATES = {
    "rogaland_norway": {"name": "Rogaland Anorthosite Massif", "lat": 58.452, "lon": 6.012},
    "lonar_rim_ne": {"name": "Lonar Crater NE Basaltic Rim", "lat": 19.983, "lon": 76.514},
    "haughton_devon_canada": {"name": "Haughton Impact & Permafrost Basin", "lat": 75.383, "lon": -89.667},
    "dallol_ethiopia": {"name": "Dallol Hydrothermal Evaporite Delta", "lat": 14.241, "lon": 40.299},
    "qaidam_china": {"name": "Qaidam Basin Sulfate Yardangs", "lat": 38.512, "lon": 91.488},
    "umm_jirsan_saudi": {"name": "Harrat Khaybar — Umm Jirsan Lava Tube", "lat": 25.588, "lon": 39.757},
    "atacama_yungay": {"name": "Atacama Yungay Hyper-Arid Core", "lat": -24.088, "lon": -69.913},
    "iceland_askja": {"name": "Askja Caldera & Holuhraun Lava Fields", "lat": 65.030, "lon": -16.750},
    "svalbard_spitsbergen": {"name": "Svalbard Bokfjorden Basalt Complex", "lat": 79.430, "lon": 13.350},
    "hawaii_mauna_loa": {"name": "Mauna Loa HI-SEAS Volcanic Habitat", "lat": 19.533, "lon": -155.578},
}


def query_nasa_cmr(
    lat: float,
    lon: float,
    short_name: str = "MOD11A2",
    delta_deg: float = 0.25,
    page_size: int = 5,
    timeout: int = 10,
) -> Dict[str, Any]:
    """
    Queries the official NASA Common Metadata Repository (CMR) API for open satellite granules.
    Bounding box format: [min_lon, min_lat, max_lon, max_lat]
    """
    bbox = f"{lon - delta_deg:.4f},{lat - delta_deg:.4f},{lon + delta_deg:.4f},{lat + delta_deg:.4f}"
    params = {
        "short_name": short_name,
        "bounding_box": bbox,
        "page_size": page_size,
        "sort_key": "-start_date",
    }
    url = f"{CMR_GRANULES_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "TerraTwin-NASA-SpaceApps-2026/1.0",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
            entries = payload.get("feed", {}).get("entry", [])
            granules = []
            for e in entries:
                links = [link.get("href") for link in e.get("links", []) if link.get("href", "").startswith("http")]
                granules.append({
                    "title": e.get("title"),
                    "time_start": e.get("time_start"),
                    "time_end": e.get("time_end"),
                    "cloud_cover_pct": e.get("cloud_cover", 0.0),
                    "day_night_flag": e.get("day_night_flag", "UNSPECIFIED"),
                    "download_url": links[0] if links else None,
                })

            return {
                "status": "SUCCESS",
                "query": {
                    "latitude": lat,
                    "longitude": lon,
                    "collection": short_name,
                    "bounding_box": bbox,
                },
                "total_granules_found": len(granules),
                "granules": granules,
            }
    except Exception as err:
        return {
            "status": "ERROR",
            "message": str(err),
            "query": {"latitude": lat, "longitude": lon, "collection": short_name},
        }


def main():
    parser = argparse.ArgumentParser(
        description="TerraTwin — Automated NASA Earthdata CMR API Query Tool"
    )
    parser.add_argument("--site", choices=list(ANALOG_COORDINATES.keys()), help="Site ID from TerraTwin database")
    parser.add_argument("--lat", type=float, help="Latitude (-90 to +90)")
    parser.add_argument("--lon", type=float, help="Longitude (-180 to +180)")
    parser.add_argument(
        "--collection",
        default="MODIS_LST",
        choices=list(COLLECTIONS.keys()),
        help="NASA collection to query (default: MODIS_LST)",
    )
    parser.add_argument("--limit", type=int, default=3, help="Max granules to retrieve (default: 3)")
    parser.add_argument("--export", type=str, help="Export output to JSON file")

    args = parser.parse_args()

    if args.site:
        site_info = ANALOG_COORDINATES[args.site]
        lat = site_info["lat"]
        lon = site_info["lon"]
        site_name = site_info["name"]
    elif args.lat is not None and args.lon is not None:
        lat = args.lat
        lon = args.lon
        site_name = f"Custom Outcrop ({lat}, {lon})"
    else:
        # Default fallback to Rogaland Anorthosite
        lat = 58.452
        lon = 6.012
        site_name = "Rogaland Anorthosite Massif (Block B2)"

    coll_meta = COLLECTIONS.get(args.collection, COLLECTIONS["MODIS_LST"])
    short_name = coll_meta["short_name"]

    print(f"\n{'='*75}")
    print(f"📡 NASA Earthdata CMR API Query Client — TerraTwin 2026")
    print(f"{'='*75}")
    print(f"Target Site:       {site_name}")
    print(f"Coordinates:       {lat:.4f}° N, {lon:.4f}° E")
    print(f"NASA Collection:   {short_name} ({coll_meta['description']})")
    print(f"Connecting to:     {CMR_GRANULES_URL} ...\n")

    res = query_nasa_cmr(lat=lat, lon=lon, short_name=short_name, page_size=args.limit)

    if res.get("status") == "SUCCESS":
        granules = res.get("granules", [])
        print(f"✅ Success: Retrieved {len(granules)} active satellite granules from NASA EOSDIS:\n")
        for idx, g in enumerate(granules, 1):
            print(f"  [{idx}] Granule Title: {g['title']}")
            print(f"      Acquisition Date: {g['time_start']} to {g['time_end']}")
            print(f"      Day/Night Mode:   {g['day_night_flag']} | Cloud Cover: {g['cloud_cover_pct']}%")
            if g.get("download_url"):
                print(f"      Direct URL:       {g['download_url']}")
            print()
    else:
        print(f"❌ NASA CMR Query Error: {res.get('message')}")

    if args.export:
        with open(args.export, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2)
        print(f"💾 Results saved to {args.export}\n")


if __name__ == "__main__":
    main()
