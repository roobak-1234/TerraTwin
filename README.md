# TerraTwin: Multi-Scale Moon & Mars Planetary Analog Discovery Engine
**2026 NASA Space Apps Challenge Solution**  
*Challenge: "Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars"*

---

## Executive Summary
No single location on Earth can perfectly replicate the surface of the Moon or Mars. **TerraTwin** is a multi-agency planetary analog discovery and characterization engine that moves beyond visual similarity to evaluate Earth candidate sites across **8 quantitative geophysical dimensions**. 

By synthesizing open datasets from **NASA, CSA, ESA, and JAXA**, TerraTwin introduces:
1. **Calibrated 8D Hybrid Similarity Scoring** (Gaussian RBF Kernel + Cosine Directional Match).
2. **2D Unsupervised Machine Learning Latent Space** (scikit-learn PCA capturing 69.1% variance + K-Means clustering into 4 geophysical archetypes).
3. **Dual-Site Campaign Synthesis** to solve single-site limitations (e.g., pairing lunar highlands anorthosite with cryogenic permafrost to reach &gt;92% exploration envelope fidelity).
4. **Hardware & Chamber Compensation Protocol** (Rover mechanical gravity offloading, Bekker terramechanic wheel sinkage $z_0$, and solar optical attenuation filters).
5. **12-Month Satellite Environmental Simulator** (NASA MODIS LST, ESA Sentinel-2 NDVI, and JAXA IMERG precipitation time-series).
6. **In-Browser Custom Outcrop Scanner & 1-Click Global Expedition Presets** spanning all 7 continents and subterranean lava tubes.

---

## Project Architecture

```
terratwin-nasa-2026/
├── backend_science/
│   ├── analogs_database.json        # Multi-agency scientific dataset (8 Targets, 10 Analogs)
│   ├── similarity_sar_engine.py     # scikit-learn PCA, K-Means & Random Forest ML pipeline
│   ├── ml_results.json              # Exported ML coordinates, clusters, and rankings
│   ├── nasa_earthdata_fetcher.py    # Automated NASA CMR API Granule Fetcher (Zero-Key)
│   ├── sar_backscatter_calculator.py # CSA RADARSAT & Mini-RF C-Band backscatter/CPR calculator
│   └── cli_analog_finder.py         # Terminal Interactive Planetary Analog Discovery CLI
├── frontend/                        # Next.js 14 + TypeScript + Tailwind CSS (NASA JPL Editorial)
│   ├── src/app/
│   │   ├── layout.tsx               # Root layout & technical metadata
│   │   ├── globals.css              # Tailwind directives & cross-browser sliders
│   │   └── page.tsx                 # Complete self-contained Mission Control Dashboard
│   └── package.json
├── Problem_Details/                 # Official NASA Space Apps Challenge resources & brief
└── README.md                        # Complete project documentation & guide
```

---

## The 8 Scientific Dimensions (1-to-1 Match with NASA Challenge Brief)

| Dimension | Description | Multi-Agency Sensor Datasets |
|---|---|---|
| `geology_mineralogy` | Lithology & mineral composition match | ESA Sentinel-2 SWIR plagioclase/clay ratios, NASA MRO CRISM |
| `topography_roughness` | Surface roughness, slope & crater relief | CSA RADARSAT-1/RCM C-Band $\sigma^0$, LRO LOLA, JAXA AW3D30 |
| `thermal_illumination` | Temperature extremes & low-sun insolation | NASA LRO Diviner bolometric thermal, Terra MODIS LST |
| `water_ice_isru` | Subsurface water-ice & cold-traps | NASA MRO SHARAD ground-ice sounder, LRO Mini-RF CPR |
| `aeolian_dynamic_processes` | Dust, dunes, TARs & wind abrasion | NASA HiRISE wind streaks, Sentinel-2 barren soil indices |
| `astrobiology_extremophiles`| Biosignatures & polyextremophiles | NASA Perseverance Mastcam-Z/SHERLOC, hypersaline delta analogues |
| `subsurface_lava_tubes` | Cavity geometry & skylight shielding | JAXA SELENE Lunar Radar Sounder, LRO LROC NAC geometry |
| `operations_mobility` | Rover traversability & sinkage risk | Bekker terramechanics, slope DEMs, regolith bearing capacity |

---

## Planetary Targets vs. Global Terrestrial Analogs

### 8 Flagship Planetary Targets (4 Moon, 4 Mars)
- 🌕 **Shackleton Crater Rim (Moon — Artemis III South Pole, 89.9°S):** Permanently Shadowed Regions (PSRs), cryogenic ice traps, steep anorthositic rim slopes.
- 🌕 **Marius Hills Skylight Pit (Moon — Oceanus Procellarum, 14.1°N):** Intact subterranean basaltic lava tube conduit for human radiation and thermal shielding.
- 🌕 **Malapert Mountain / Massif (Moon — Artemis South Pole, 86.0°S):** Peak of Eternal Light (>88% sunlight) & Line-of-Sight direct communications relay to Earth.
- 🌕 **Aristarchus Plateau & Pyroclastic Deposit (Moon — Oceanus Procellarum, 23.7°N):** Massive explosive volcanic glass and high-thorium lunar ISRU mineral reserve.
- 🔴 **Jezero Crater Western Delta (Mars — Perseverance, 18.38°N):** Fluvial-lacustrine smectite clays, carbonates, and ancient hydrothermal biosignatures.
- 🔴 **Arcadia Planitia (Mars — Human Starship Candidate, 39.3°N):** Massive cryogenic water-ice sheets 1–5m below regolith and permafrost polygons.
- 🔴 **Gale Crater & Mount Sharp (Mars — Curiosity, 5.37°S):** 5 km stratigraphic stack recording the ancient Martian transition from clay-bearing lakes to hyper-arid sulfates.
- 🔴 **Mawrth Vallis Layered Phyllosilicates (Mars — Oxia Palus, 23.99°N):** Deeply dissected Noachian bedrock rich in iron/magnesium smectite clays (>3.8 Ga wet era).

### 10 Global Earth Analogs Across 6 Continents + Volcanic & Arctic Chains
1. 🇳🇴 **Rogaland Anorthosite Massif (Europe — Norway):** Calcic plagioclase anorthosite (ESA Lunar Highlands Simulant host; 98% rock match to Shackleton Rim).
2. 🇮🇳 **Lonar Crater NE Basaltic Rim (Asia — India):** Hyper-velocity impact crater in pure flood basalt (shocked maskelynite glass matching Apollo return samples).
3. 🇨🇦 **Haughton Crater & Polygon Basin (North America — Canadian Arctic):** Active-layer permafrost polygons and ground-ice table matching Arcadia Planitia.
4. 🇪🇹 **Dallol Hydrothermal Evaporite Delta (Africa — Ethiopia):** Hyper-acidic (pH < 1.5) iron-sulfate brine pools matching early Noachian Mars.
5. 🇨🇳 **Qaidam Basin Yardangs & Dunes (East Asia — China):** High-altitude sulfate yardangs (jarosite/kieserite) mirroring Martian Gale and Jezero units.
6. 🇸🇦 **Harrat Khaybar — Umm Jirsan (Middle East — Saudi Arabia):** 1.5 km intact subterranean flood basalt tube with 3 vertical skylights for autonomous drones.
7. 🇨🇱 **Atacama Yungay Core (South America — Chile):** Gold-standard hyper-arid control benchmark for extreme desiccation and perchlorate soils.
8. 🇮🇸 **Askja Caldera & Holuhraun Lava Fields (Europe — Iceland):** Historic Apollo astronaut field training site; tephra sand and rough basaltic crust matching Mars rover traversals.
9. 🇳🇴 **Svalbard Bokfjorden Basalt Complex (Arctic — Spitsbergen):** NASA/ESA AMASE expedition site; hydrothermal carbonate globules in basalt twin ALH84001 Martian meteorite.
10. 🇺🇸 **Mauna Loa HI-SEAS Habitat & Saddle (North America — Hawaii):** High-altitude unweathered tholeiitic basalt field and isolated long-duration habitat operations benchmark.

---

## How to Run the Project Locally

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (with `numpy` and `scikit-learn`)

### 1. Run the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run the Machine Learning Pipeline (Backend Sync)
```bash
cd backend_science
pip install numpy scikit-learn
python similarity_sar_engine.py
```
This re-runs the unsupervised PCA projection, calculates K-Means cluster centroids, fits Random Forest regressors for feature importance, and regenerates `ml_results.json`.

### 3. Automated NASA CMR API Live Granule Fetcher
Query NASA's EOSDIS Common Metadata Repository (CMR) API for real-world active satellite granules over any analog coordinate with **zero API key required**:
```bash
cd backend_science
# Query active MODIS Land Surface Temperature granules over Rogaland Anorthosite Massif
python nasa_earthdata_fetcher.py --site rogaland_norway --limit 3

# Query active granules over Askja Caldera, Iceland
python nasa_earthdata_fetcher.py --site askja_iceland --limit 3
```

### 4. CSA RADARSAT & Mini-RF SAR Roughness / CPR Calculator
Compute Rayleigh criteria for smooth/rough radar backscatter and Circular Polarization Ratio ($\text{CPR} = \sigma^0_{\text{SC}} / \sigma^0_{\text{OC}}$):
```bash
cd backend_science
# Evaluate C-Band backscatter against a target threshold
python sar_backscatter_calculator.py --hh -7.2 --hv -14.5 --band C-band --compare-target -6.8

# Calculate Circular Polarization Ratio (CPR) for Lunar PSR ice detection
python sar_backscatter_calculator.py --sc -1.2 --oc -3.8
```

### 5. Interactive Terminal Planetary Analog Discovery CLI
Explore and rank Earth analogs directly from the terminal with customizable mission hardware weights and dual-site synthesis:
```bash
cd backend_science
# Find top analogs for Malapert Mountain weighted for Rover Mobility
python cli_analog_finder.py --target malapert_mountain --weights rover --top 4

# Search analogs for Gale Crater weighted for Astrobiology & Biosignatures
python cli_analog_finder.py --target gale_crater --weights astrobiology --top 3
```
```
This re-runs the unsupervised PCA projection, calculates K-Means cluster centroids, fits Random Forest regressors for feature importance, and regenerates `ml_results.json`.

---

## Innovation Highlights & Deliverables
- **Live NASA Moon Trek & Mars Trek Integration:** Direct launch buttons into NASA's official planetary GIS viewers.
- **Satellite Band Math Documentation Modal:** In-depth derivations of RADARSAT CPR, Sentinel-2 band ratios, and Apparent Thermal Inertia (ATI).
- **One-Click CSV Export:** Downloads a complete `.csv` containing all 8D scores, SAR roughness, and rover offload metrics.
- **Print / PDF Dossier:** Official NASA mission authorization field brief formatted for print or PDF archiving.
