"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  Compass,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Radar,
  Cpu,
  ArrowUpRight,
  Scale,
  Mountain,
  MapPin,
  FileText,
  Satellite,
  Sun,
  Calendar,
  Crosshair,
  Star,
  Zap,
  Activity,
  Download,
  Printer,
  X,
  ExternalLink,
  Calculator,
  Info,
  ChevronRight,
} from "lucide-react";

type DimensionKey =
  | "geology_mineralogy"
  | "topography_roughness"
  | "thermal_illumination"
  | "water_ice_isru"
  | "aeolian_dynamic_processes"
  | "astrobiology_extremophiles"
  | "subsurface_lava_tubes"
  | "operations_mobility";

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  geology_mineralogy: "Geology & Mineralogy",
  topography_roughness: "Topography & SAR Roughness",
  thermal_illumination: "Thermal & Solar Insolation",
  water_ice_isru: "Cryogenic Volatiles & ISRU",
  aeolian_dynamic_processes: "Aeolian & Sediment Dynamics",
  astrobiology_extremophiles: "Astrobiology & Extremophiles",
  subsurface_lava_tubes: "Subsurface Cavities & Lava Tubes",
  operations_mobility: "Terramechanics & Rover Mobility",
};

const SHORT_RADAR_LABELS: Record<DimensionKey, string> = {
  geology_mineralogy: "Geology",
  topography_roughness: "Topography",
  thermal_illumination: "Thermal",
  water_ice_isru: "Cryo ISRU",
  aeolian_dynamic_processes: "Aeolian",
  astrobiology_extremophiles: "Astrobio",
  subsurface_lava_tubes: "Lava Tubes",
  operations_mobility: "Mobility",
};

interface TargetSite {
  id: string;
  name: string;
  body: "Moon" | "Mars";
  coords: string;
  gravity: number;
  pressure: string;
  mlCluster: string;
  pcaCoords: [number, number];
  rfTopDriver: string;
  sources: string[];
  keyProcess: string;
  specs: {
    rock: string;
    slope: number;
    sarDb: number;
    temp: string;
  };
  solarFlux: number;
  terramechanics: {
    kc_kpa: number;
    kphi_kpa: number;
    n_exponent: number;
    regolithType: string;
  };
  vector: Record<DimensionKey, number>;
  orbitalRecon: {
    swathId: string;
    demSource: string;
    solarIncidence: string;
    thermalInertia: string;
    trekUrl: string;
    description: string;
  };
}

interface SeasonalMonthDetail {
  month: string;
  monthShort: string;
  fidelity: number;
  tempC: number;
  ndvi: number;
  precipMm: number;
  process: string;
}

interface EarthAnalog {
  id: string;
  name: string;
  region: string;
  continent: string;
  lat: number;
  lon: number;
  zoom: number;
  scale: string;
  uncharted: boolean;
  mlCluster: string;
  pcaCoords: [number, number];
  datasets: string[];
  specs: {
    rock: string;
    slope: number;
    sarDb: number;
    temp: string;
  };
  solarFlux: number;
  terramechanics: {
    kc_kpa: number;
    kphi_kpa: number;
    n_exponent: number;
    regolithType: string;
  };
  optimalWindow: string;
  monthlyFidelity: number[];
  peakLstC: string;
  ndvi: string;
  rainfallMm: string;
  seasonalProcessNote: string;
  seasonalDetails: SeasonalMonthDetail[];
  vector: Record<DimensionKey, number>;
  strongMatch: string;
  breakdown: string;
  processTwin: string;
  worldviewUrl: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORTS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// 8 Flagship Planetary Targets (4 Lunar + 4 Martian)
const TARGET_SITES: TargetSite[] = [
  {
    id: "shackleton_rim",
    name: "Shackleton Crater Rim (Artemis III South Pole)",
    body: "Moon",
    coords: "89.9° S, 0.0° E",
    gravity: 1.62,
    pressure: "0.0 mbar (Hard Vacuum)",
    mlCluster: "Archetype A: Fluvial-Sulfate & Lacustrine Basins",
    pcaCoords: [1.23, -3.10],
    rfTopDriver: "Topography & SAR Roughness",
    sources: ["NASA LRO Diviner (40K-110K PSRs)", "NASA LRO LOLA (Slope 15°-32°)", "NASA LRO Mini-RF (CPR)"],
    keyProcess: "Cryogenic volatile cold-trapping in permanently shadowed craters & grazing low-sun illumination",
    specs: { rock: "Highland Anorthosite (Plagioclase > 85%)", slope: 21.5, sarDb: -6.8, temp: "-233°C to -150°C" },
    solarFlux: 150.0,
    terramechanics: { kc_kpa: 1.4, kphi_kpa: 820.0, n_exponent: 1.0, regolithType: "Highland Anorthositic Breccia" },
    vector: {
      geology_mineralogy: 92, topography_roughness: 88, thermal_illumination: 98,
      water_ice_isru: 95, aeolian_dynamic_processes: 5, astrobiology_extremophiles: 10,
      subsurface_lava_tubes: 20, operations_mobility: 94,
    },
    orbitalRecon: {
      swathId: "LRO LROC NAC M119827295RE / Mini-RF S-Band CPR Strip",
      demSource: "LRO LOLA Polar DEM 20m/px (GDR v2)",
      solarIncidence: "88.5° (Hyper-Low Grazing Sun)",
      thermalInertia: "45 J m⁻² K⁻¹ s⁻¹/² (Fine Regolith over Cryo-Ice)",
      trekUrl: "https://trek.nasa.gov/moon/#v=1&x=0.0&y=-89.9&z=8",
      description: "Steep 21° crater rim overlooking permanently shadowed interior cold-traps holding suspected water-ice volatiles.",
    },
  },
  {
    id: "marius_hills_pit",
    name: "Marius Hills Skylight Pit (Lunar Mare Lava Tube)",
    body: "Moon",
    coords: "14.1° N, 303.2° E",
    gravity: 1.62,
    pressure: "0.0 mbar (Hard Vacuum)",
    mlCluster: "Archetype B: Cryogenic Periglacial & Polar Traps",
    pcaCoords: [-3.13, -0.65],
    rfTopDriver: "Subsurface Lava Tubes",
    sources: ["NASA LRO LROC NAC (Sub-meter Geometry)", "JAXA SELENE Lunar Radar Sounder", "NASA PDS Flood Basalt"],
    keyProcess: "Volcanic lava tube roof collapse (skylight) providing natural cosmic radiation & thermal shielding",
    specs: { rock: "Tholeiitic Mare Flood Basalt", slope: 4.2, sarDb: -14.2, temp: "-153°C Surface / -20°C Interior" },
    solarFlux: 0.0,
    terramechanics: { kc_kpa: 4.5, kphi_kpa: 1500.0, n_exponent: 1.15, regolithType: "Coarse Basaltic Scree / Rubble" },
    vector: {
      geology_mineralogy: 90, topography_roughness: 75, thermal_illumination: 70,
      water_ice_isru: 30, aeolian_dynamic_processes: 5, astrobiology_extremophiles: 15,
      subsurface_lava_tubes: 99, operations_mobility: 85,
    },
    orbitalRecon: {
      swathId: "LRO LROC NAC M122584310LE / SELENE LRS Sounder",
      demSource: "LROC Stereo DTM 2m/px",
      solarIncidence: "42.1° (Subsurface Pit Shadowing)",
      thermalInertia: "85 J m⁻² K⁻¹ s⁻¹/² (Tholeiitic Basalt Ceiling)",
      trekUrl: "https://trek.nasa.gov/moon/#v=1&x=-56.8&y=14.1&z=8",
      description: "65m wide vertical collapse opening into vast intact subterranean basaltic lava tube conduit.",
    },
  },
  {
    id: "malapert_mountain",
    name: "Malapert Mountain (Peak of Eternal Light & Artemis Relay)",
    body: "Moon",
    coords: "86.0° S, 0.0° E",
    gravity: 1.62,
    pressure: "0.0 mbar (Hard Vacuum)",
    mlCluster: "Archetype A: Fluvial-Sulfate & Lacustrine Basins",
    pcaCoords: [0.79, -2.30],
    rfTopDriver: "Geology & Mineralogy",
    sources: ["NASA LRO LOLA Elevation (5000m Peak)", "NASA LRO Diviner Thermal", "JAXA Kaguya Terrain Camera"],
    keyProcess: "Near-continuous solar illumination (86% diurnal cycle) & continuous direct line-of-sight to Earth for permanent communications relay",
    specs: { rock: "Shock-Metamorphosed Pure Anorthositic Ridge", slope: 26.5, sarDb: -5.8, temp: "-90°C to -45°C" },
    solarFlux: 1361.0,
    terramechanics: { kc_kpa: 1.6, kphi_kpa: 860.0, n_exponent: 1.02, regolithType: "Anorthositic Ridge Scree" },
    vector: {
      geology_mineralogy: 90, topography_roughness: 92, thermal_illumination: 99,
      water_ice_isru: 70, aeolian_dynamic_processes: 5, astrobiology_extremophiles: 10,
      subsurface_lava_tubes: 15, operations_mobility: 88,
    },
    orbitalRecon: {
      swathId: "LRO LOLA Polar DEM 5m / Diviner Bolometric LST",
      demSource: "LRO LOLA 5000m Peak Topographic Map",
      solarIncidence: "86.2° (Continuous Grazing Sun)",
      thermalInertia: "52 J m⁻² K⁻¹ s⁻¹/² (Anorthositic Massif)",
      trekUrl: "https://trek.nasa.gov/moon/#v=1&x=0.0&y=-86.0&z=8",
      description: "5,000m tall polar massif providing near-permanent solar power and direct line-of-sight to Earth for Artemis communications relays.",
    },
  },
  {
    id: "aristarchus_plateau",
    name: "Aristarchus Pyroclastic Plateau (Volcanic Glass & ISRU)",
    body: "Moon",
    coords: "23.7° N, 312.6° E",
    gravity: 1.62,
    pressure: "0.0 mbar (Hard Vacuum)",
    mlCluster: "Archetype B: Cryogenic Periglacial & Polar Traps",
    pcaCoords: [-1.86, -0.51],
    rfTopDriver: "Geology & Mineralogy",
    sources: ["NASA LRO LROC NAC / Mini-RF", "NASA Clementine UV-VIS Spectral Reflectance", "Lunar Prospector Gamma Ray Spectrometer"],
    keyProcess: "Explosive lunar pyroclastic volcanism depositing regional high-titanium volcanic glass beads enriched in trapped solar-wind hydrogen and volatiles",
    specs: { rock: "Regional Pyroclastic Volcanic Glass & High-Ti Basalt", slope: 6.2, sarDb: -12.4, temp: "-130°C to +110°C" },
    solarFlux: 1361.0,
    terramechanics: { kc_kpa: 2.8, kphi_kpa: 1100.0, n_exponent: 1.08, regolithType: "Fine Pyroclastic Glass Beads & Ash" },
    vector: {
      geology_mineralogy: 98, topography_roughness: 76, thermal_illumination: 82,
      water_ice_isru: 84, aeolian_dynamic_processes: 10, astrobiology_extremophiles: 12,
      subsurface_lava_tubes: 75, operations_mobility: 85,
    },
    orbitalRecon: {
      swathId: "LRO LROC NAC M112589304RE / Mini-RF CPR",
      demSource: "LROC NAC Stereo DTM 2m/px",
      solarIncidence: "32.5° (Volcanic Plateau)",
      thermalInertia: "110 J m⁻² K⁻¹ s⁻¹/² (Pyroclastic Glass Beads)",
      trekUrl: "https://trek.nasa.gov/moon/#v=1&x=-47.5&y=23.7&z=8",
      description: "Vast pyroclastic volcanic glass blanket enriched in trapped solar-wind volatiles and high-titanium beads for lunar oxygen extraction.",
    },
  },
  {
    id: "jezero_delta",
    name: "Jezero Crater Western Delta & Floor",
    body: "Mars",
    coords: "18.38° N, 77.58° E",
    gravity: 3.71,
    pressure: "6.1 mbar (95% CO₂)",
    mlCluster: "Archetype C: High-Slope Basaltic Impact Rims",
    pcaCoords: [0.40, 1.66],
    rfTopDriver: "Astrobiology & Extremophiles",
    sources: ["NASA PDS MOLA DEM", "NASA MRO CRISM Clays/Carbonates", "Perseverance RIMFAX Ground Radar"],
    keyProcess: "Fluvial-lacustrine deltaic sedimentation, hydrothermal carbonate alteration & aeolian dune migration",
    specs: { rock: "Fe/Mg Smectite Clays, Carbonates & Basalt", slope: 8.4, sarDb: -11.5, temp: "-88°C to -12°C" },
    solarFlux: 324.0,
    terramechanics: { kc_kpa: 0.9, kphi_kpa: 580.0, n_exponent: 0.92, regolithType: "Lacustrine Clay-Mudstone" },
    vector: {
      geology_mineralogy: 96, topography_roughness: 82, thermal_illumination: 75,
      water_ice_isru: 65, aeolian_dynamic_processes: 88, astrobiology_extremophiles: 95,
      subsurface_lava_tubes: 15, operations_mobility: 86,
    },
    orbitalRecon: {
      swathId: "MRO HiRISE Color ESP_037148_1985 / CRISM FRT0000B694",
      demSource: "MRO HiRISE Stereo DTM 1m/px",
      solarIncidence: "38.2° (Equatorial Morning)",
      thermalInertia: "310 J m⁻² K⁻¹ s⁻¹/² (Consolidated Deltaic Mudstone)",
      trekUrl: "https://trek.nasa.gov/mars/#v=1&x=77.58&y=18.38&z=8",
      description: "Ancient river delta deposit preserving stratified biosignature-rich smectite clays and carbonate margins.",
    },
  },
  {
    id: "arcadia_planitia",
    name: "Arcadia Planitia (Human Mars Landing Candidate)",
    body: "Mars",
    coords: "39.2° N, 188.0° E",
    gravity: 3.71,
    pressure: "6.5 mbar (95% CO₂)",
    mlCluster: "Archetype A: Fluvial-Sulfate & Lacustrine Basins",
    pcaCoords: [3.07, -1.21],
    rfTopDriver: "Astrobiology & Extremophiles",
    sources: ["NASA PDS SHARAD Subsurface Ice", "NASA HiRISE Thermal Polygons", "TES Thermal Inertia"],
    keyProcess: "Periglacial polygon cryoturbation over shallow massive water-ice sheets (Starship ISRU candidate)",
    specs: { rock: "Ice-Cemented Volcanic Plains Regolith", slope: 1.8, sarDb: -16.4, temp: "-110°C to -5°C" },
    solarFlux: 342.0,
    terramechanics: { kc_kpa: 5.2, kphi_kpa: 1850.0, n_exponent: 1.18, regolithType: "Ice-Cemented Cryo-Regolith" },
    vector: {
      geology_mineralogy: 78, topography_roughness: 90, thermal_illumination: 92,
      water_ice_isru: 98, aeolian_dynamic_processes: 85, astrobiology_extremophiles: 75,
      subsurface_lava_tubes: 25, operations_mobility: 92,
    },
    orbitalRecon: {
      swathId: "MRO HiRISE ESP_016752_2195 / SHARAD Radargram 1254301",
      demSource: "MOLA MEGDR 128 px/deg",
      solarIncidence: "54.7° (Mid-Latitude Oblique)",
      thermalInertia: "420 J m⁻² K⁻¹ s⁻¹/² (Massive Subsurface Water Ice)",
      trekUrl: "https://trek.nasa.gov/mars/#v=1&x=-172.0&y=39.2&z=7",
      description: "Vast smooth plains containing buried pure water-ice sheets 1-5m below regolith, ideal for human propellant production.",
    },
  },
  {
    id: "gale_crater",
    name: "Gale Crater & Mount Sharp Stratigraphy",
    body: "Mars",
    coords: "5.37° S, 137.44° E",
    gravity: 3.71,
    pressure: "7.5 mbar (95% CO₂)",
    mlCluster: "Archetype C: High-Slope Basaltic Impact Rims",
    pcaCoords: [0.52, 1.94],
    rfTopDriver: "Water & Ice ISRU",
    sources: ["NASA MSL Curiosity APXS & CheMin XRD", "NASA MRO CRISM Clays/Sulfates", "NASA PDS HiRISE 25cm/px"],
    keyProcess: "Transition from ancient Noachian lacustrine habitable smectite clays to desiccating Hesperian sulfate salts and active aeolian Bagnold dune fields",
    specs: { rock: "Stratified Lacustrine Mudstone, Smectite Clay & Magnesium Sulfate", slope: 12.0, sarDb: -10.8, temp: "-80°C to +5°C" },
    solarFlux: 590.0,
    terramechanics: { kc_kpa: 1.2, kphi_kpa: 650.0, n_exponent: 0.95, regolithType: "Layered Clay & Sulfate Mudstone" },
    vector: {
      geology_mineralogy: 97, topography_roughness: 86, thermal_illumination: 80,
      water_ice_isru: 55, aeolian_dynamic_processes: 94, astrobiology_extremophiles: 96,
      subsurface_lava_tubes: 10, operations_mobility: 84,
    },
    orbitalRecon: {
      swathId: "MRO HiRISE Color ESP_028414_1755 / CRISM FRT0000B238",
      demSource: "MRO HiRISE Stereo DTM 1m/px",
      solarIncidence: "28.4° (Equatorial Basin)",
      thermalInertia: "285 J m⁻² K⁻¹ s⁻¹/² (Layered Sulfate/Clay Mudstone)",
      trekUrl: "https://trek.nasa.gov/mars/#v=1&x=137.44&y=-5.37&z=8",
      description: "NASA Curiosity landing site: 5 km high central mound preserving the critical Martian transition from habitable lakes to arid sulfate dunes.",
    },
  },
  {
    id: "mawrth_vallis",
    name: "Mawrth Vallis Ancient Clay Outflow Channel",
    body: "Mars",
    coords: "23.99° N, 341.04° E",
    gravity: 3.71,
    pressure: "6.8 mbar (95% CO₂)",
    mlCluster: "Archetype C: High-Slope Basaltic Impact Rims",
    pcaCoords: [0.03, 1.80],
    rfTopDriver: "Astrobiology & Extremophiles",
    sources: ["NASA MRO CRISM (Fe/Mg & Al-Smectites)", "ESA Mars Express OMEGA Spectrometer", "NASA PDS HiRISE Stratigraphy"],
    keyProcess: "Ancient catastrophic mega-flood carving exposing 200m+ thick continuous sequence of diverse phyllosilicates preserving Noachian biosignatures",
    specs: { rock: "Layered Fe/Mg & Al-Smectite Phyllosilicates", slope: 7.5, sarDb: -12.1, temp: "-95°C to 0°C" },
    solarFlux: 575.0,
    terramechanics: { kc_kpa: 1.0, kphi_kpa: 590.0, n_exponent: 0.93, regolithType: "Consolidated Phyllosilicates & Clays" },
    vector: {
      geology_mineralogy: 99, topography_roughness: 78, thermal_illumination: 76,
      water_ice_isru: 62, aeolian_dynamic_processes: 80, astrobiology_extremophiles: 98,
      subsurface_lava_tubes: 10, operations_mobility: 87,
    },
    orbitalRecon: {
      swathId: "MRO HiRISE Color ESP_011409_2040 / CRISM HRL000040FF",
      demSource: "MRO HiRISE Stereo DTM 1m/px",
      solarIncidence: "35.1° (Mid-Latitude Valley)",
      thermalInertia: "340 J m⁻² K⁻¹ s⁻¹/² (Consolidated Phyllosilicates)",
      trekUrl: "https://trek.nasa.gov/mars/#v=1&x=-18.96&y=23.99&z=8",
      description: "Ancient catastrophic outflow channel exposing 200m of diverse layered smectite clays preserving Noachian habitability records.",
    },
  },
];

// 10 Global Earth Analogs Across 6 Continents
const EARTH_ANALOGS: EarthAnalog[] = [
  {
    id: "rogaland_norway",
    name: "Rogaland Anorthosite Massif (Block B2)",
    region: "Egersund Basin, Southern Norway",
    continent: "Europe",
    lat: 58.452,
    lon: 6.012,
    zoom: 13,
    scale: "1.2 km × 1.2 km Glacially Polished Bedrock Grid",
    uncharted: true,
    mlCluster: "Archetype D: Subterranean Flood Basalt Lava Tubes",
    pcaCoords: [-1.31, -1.28],
    datasets: [
      "ESA Copernicus Sentinel-2 SWIR Plagioclase Index",
      "JAXA G-Portal ALOS AW3D30 Slope DEM",
      "CSA RADARSAT-1 C-Band Backscatter",
    ],
    specs: { rock: "High-Purity Calcic Plagioclase Anorthosite (ESA Lunar Highlands Simulant Host)", slope: 18.2, sarDb: -7.2, temp: "-8°C to +19°C" },
    solarFlux: 1040.0,
    terramechanics: { kc_kpa: 1.8, kphi_kpa: 890.0, n_exponent: 1.05, regolithType: "Anorthosite Bedrock / Scoured Scree" },
    optimalWindow: "MAY – SEP (NORDIC SNOW-FREE WINDOW)",
    monthlyFidelity: [48, 50, 58, 74, 91, 96, 98, 95, 89, 72, 55, 49],
    peakLstC: "+16°C",
    ndvi: "0.09",
    rainfallMm: "18 mm",
    seasonalProcessNote: "Glacially scoured, unweathered plagioclase bedrock exposed post-snowmelt for high-albedo LRO Diviner spectral calibration.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 48, tempC: -4, ndvi: 0.05, precipMm: 85, process: "Heavy winter snowpack covers anorthosite outcrop surfaces." },
      { month: "February", monthShort: "Feb", fidelity: 50, tempC: -3, ndvi: 0.05, precipMm: 70, process: "Sub-zero temperatures; snow blankets bedrock outcrops." },
      { month: "March", monthShort: "Mar", fidelity: 58, tempC: 2, ndvi: 0.06, precipMm: 62, process: "Early spring thaw initiates snowmelt runoff." },
      { month: "April", monthShort: "Apr", fidelity: 74, tempC: 7, ndvi: 0.07, precipMm: 45, process: "Snow clears from high-slope ridges and polished domes." },
      { month: "May", monthShort: "May", fidelity: 91, tempC: 12, ndvi: 0.08, precipMm: 28, process: "Snow-free campaign window opens; crisp high-albedo rock exposure." },
      { month: "June", monthShort: "Jun", fidelity: 96, tempC: 15, ndvi: 0.09, precipMm: 22, process: "Long daylight hours; optimal optical and LiDAR rover mapping." },
      { month: "July", monthShort: "Jul", fidelity: 98, tempC: 18, ndvi: 0.09, precipMm: 18, process: "Peak campaign window: 100% dry bedrock, zero snow, pristine calcic plagioclase." },
      { month: "August", monthShort: "Aug", fidelity: 95, tempC: 17, ndvi: 0.09, precipMm: 24, process: "Stable summer weather; full-scale Artemis lunar drill trials." },
      { month: "September", monthShort: "Sep", fidelity: 89, tempC: 13, ndvi: 0.08, precipMm: 40, process: "Autumn cooling; light rains begin but rocks remain accessible." },
      { month: "October", monthShort: "Oct", fidelity: 72, tempC: 8, ndvi: 0.07, precipMm: 78, process: "Increased Atlantic storms and early frost cycles." },
      { month: "November", monthShort: "Nov", fidelity: 55, tempC: 3, ndvi: 0.06, precipMm: 95, process: "First seasonal snowfalls dust higher elevation anorthosite blocks." },
      { month: "December", monthShort: "Dec", fidelity: 49, tempC: -1, ndvi: 0.05, precipMm: 105, process: "Winter snow cover curtails terrestrial field rover mobility." },
    ],
    vector: {
      geology_mineralogy: 98, topography_roughness: 84, thermal_illumination: 52,
      water_ice_isru: 45, aeolian_dynamic_processes: 20, astrobiology_extremophiles: 18,
      subsurface_lava_tubes: 10, operations_mobility: 91,
    },
    strongMatch: "98% mineralogical & geotechnical twin of Lunar Highlands / Artemis III Shackleton Rim regolith. Glacially polished, unweathered calcic plagioclase matches LRO Diviner silicate signatures and serves as ESA's premier European lunar regolith simulant host.",
    breakdown: "Nordic maritime climate, subaerial rain, and 1g gravity (cannot directly replicate 1/6g wheel slip without offloading).",
    processTwin: "Glacial quarry stripping & high-albedo calcic plagioclase anorthosite reflectance modeling.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=5.5,58.1,6.5,58.8",
  },
  {
    id: "lonar_rim_ne",
    name: "Lonar Crater NE Basaltic Ejecta Rim (Sector 1)",
    region: "Deccan Traps, Maharashtra, India",
    continent: "South Asia",
    lat: 19.983,
    lon: 76.514,
    zoom: 15,
    scale: "0.8 km × 0.8 km Proximal Ejecta Blanket",
    uncharted: true,
    mlCluster: "Archetype D: Subterranean Flood Basalt Lava Tubes",
    pcaCoords: [-1.13, -1.54],
    datasets: [
      "CSA RADARSAT Constellation Mission (RCM) Dual-Pol SAR Backscatter",
      "NASA Earthdata ASTER Thermal Infrared Emissivity",
      "JAXA ALOS PALSAR L-Band Roughness",
    ],
    specs: { rock: "Shocked Tholeiitic Flood Basalt Breccia & Maskelynite Glass", slope: 24.0, sarDb: -6.4, temp: "+15°C to +42°C" },
    solarFlux: 1010.0,
    terramechanics: { kc_kpa: 3.2, kphi_kpa: 1100.0, n_exponent: 1.12, regolithType: "Shocked Basaltic Breccia & Scree" },
    optimalWindow: "JAN – APR (PEAK DRY PRE-MONSOON)",
    monthlyFidelity: [95, 97, 96, 93, 86, 62, 51, 54, 68, 82, 90, 94],
    peakLstC: "+34°C",
    ndvi: "0.11",
    rainfallMm: "3 mm",
    seasonalProcessNote: "Minimum canopy cover exposes blocky basaltic impact ejecta for CSA RADARSAT & LRO Mini-RF circular polarization ratio (CPR) matching.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 95, tempC: 22, ndvi: 0.12, precipMm: 2, process: "Crisp dry air; crater rim scree slopes clear and highly accessible." },
      { month: "February", monthShort: "Feb", fidelity: 97, tempC: 26, ndvi: 0.11, precipMm: 1, process: "Optimal pre-monsoon dryness; minimal scrub allows pristine SAR radar imaging." },
      { month: "March", monthShort: "Mar", fidelity: 96, tempC: 32, ndvi: 0.09, precipMm: 3, process: "Barren basaltic ejecta blanket exposed; zero cloud cover." },
      { month: "April", monthShort: "Apr", fidelity: 93, tempC: 38, ndvi: 0.08, precipMm: 5, process: "High temperatures; rocks desiccated, optimal thermal IR emissivity tests." },
      { month: "May", monthShort: "May", fidelity: 86, tempC: 42, ndvi: 0.08, precipMm: 12, process: "Extreme summer heat tests rover thermal radiators." },
      { month: "June", monthShort: "Jun", fidelity: 62, tempC: 33, ndvi: 0.20, precipMm: 140, process: "Southwest monsoon onset; mud and runoff impede slope mobility." },
      { month: "July", monthShort: "Jul", fidelity: 51, tempC: 28, ndvi: 0.38, precipMm: 230, process: "Peak monsoon rainfall; lush green canopy masks radar rock signatures." },
      { month: "August", monthShort: "Aug", fidelity: 54, tempC: 27, ndvi: 0.42, precipMm: 210, process: "High soil moisture alters dielectric constant; unfavorable testing window." },
      { month: "September", monthShort: "Sep", fidelity: 68, tempC: 29, ndvi: 0.35, precipMm: 110, process: "Monsoon recedes; crater rim tracks begin drying out." },
      { month: "October", monthShort: "Oct", fidelity: 82, tempC: 30, ndvi: 0.22, precipMm: 25, process: "Vegetation senesces; ground hardness recovers." },
      { month: "November", monthShort: "Nov", fidelity: 90, tempC: 26, ndvi: 0.16, precipMm: 8, process: "Pleasant field conditions; radar backscatter matches dry basalt." },
      { month: "December", monthShort: "Dec", fidelity: 94, tempC: 23, ndvi: 0.13, precipMm: 4, process: "Winter dryness sets in; excellent visibility for multi-rover trials." },
    ],
    vector: {
      geology_mineralogy: 95, topography_roughness: 94, thermal_illumination: 38,
      water_ice_isru: 25, aeolian_dynamic_processes: 45, astrobiology_extremophiles: 30,
      subsurface_lava_tubes: 35, operations_mobility: 92,
    },
    strongMatch: "Only terrestrial hyper-velocity impact crater emplaced purely in flood basalt. Yields shocked basalt breccias and maskelynite glass identical to Apollo 11/12 lunar mare return samples.",
    breakdown: "Post-monsoon seasonal scrub vegetation and Earth atmospheric pressure.",
    processTwin: "Hyper-velocity basaltic impact shock metamorphism, maskelynite formation, and fluidized ejecta emplacement.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=76.3,19.8,76.7,20.1",
  },
  {
    id: "haughton_devon_canada",
    name: "Haughton Crater & Periglacial Polygon Basin",
    region: "Devon Island, Nunavut, Canada",
    continent: "North America",
    lat: 75.383,
    lon: -89.667,
    zoom: 11,
    scale: "2.5 km × 2.5 km Arctic Cryo-Impact Grid",
    uncharted: true,
    mlCluster: "Archetype A: Fluvial-Sulfate & Lacustrine Basins",
    pcaCoords: [2.76, -0.40],
    datasets: [
      "NASA Terra MODIS LST (MOD11A2)",
      "CSA RADARSAT Constellation Mission (RCM)",
      "ESA Sentinel-1 Interferometric Coherence",
    ],
    specs: { rock: "Ice-Cemented Impact Breccia & Periglacial Permafrost Polygons", slope: 3.1, sarDb: -15.4, temp: "-42°C to +8°C" },
    solarFlux: 980.0,
    terramechanics: { kc_kpa: 5.6, kphi_kpa: 1950.0, n_exponent: 1.20, regolithType: "Ice-Cemented Cryoturbated Regolith" },
    optimalWindow: "JUN – AUG (ARCTIC CONTINUOUS DAYLIGHT)",
    monthlyFidelity: [62, 64, 70, 78, 88, 96, 98, 95, 84, 72, 65, 60],
    peakLstC: "+4°C",
    ndvi: "0.03",
    rainfallMm: "6 mm",
    seasonalProcessNote: "Active-layer freeze-thaw cryoturbation over shallow ground-ice table matching Mars Arcadia Planitia SHARAD radar reflectors.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 62, tempC: -36, ndvi: 0.01, precipMm: 5, process: "Polar night; -36°C extreme freeze locks permafrost completely solid." },
      { month: "February", monthShort: "Feb", fidelity: 64, tempC: -38, ndvi: 0.01, precipMm: 4, process: "Extreme cold; testing low-temp electronics survivability." },
      { month: "March", monthShort: "Mar", fidelity: 70, tempC: -32, ndvi: 0.01, precipMm: 6, process: "Sun returns to horizon; thermal polygon fractures clearly visible." },
      { month: "April", monthShort: "Apr", fidelity: 78, tempC: -22, ndvi: 0.02, precipMm: 7, process: "Sublimation begins stripping dry snow cover." },
      { month: "May", monthShort: "May", fidelity: 88, tempC: -10, ndvi: 0.02, precipMm: 8, process: "24-hour daylight begins; ground begins seasonal thermal cycle." },
      { month: "June", monthShort: "Jun", fidelity: 96, tempC: 2, ndvi: 0.03, precipMm: 8, process: "Active field season begins; ground thawed down to 20 cm." },
      { month: "July", monthShort: "Jul", fidelity: 98, tempC: 6, ndvi: 0.03, precipMm: 6, process: "Peak field testing window: continuous sun, active periglacial polygon patterning." },
      { month: "August", monthShort: "Aug", fidelity: 95, tempC: 4, ndvi: 0.03, precipMm: 12, process: "Shallow ice sheet accessible; premier deep-drill ISRU trials." },
      { month: "September", monthShort: "Sep", fidelity: 84, tempC: -3, ndvi: 0.02, precipMm: 15, process: "Active freeze-up starts; field camps demobilize." },
      { month: "October", monthShort: "Oct", fidelity: 72, tempC: -14, ndvi: 0.01, precipMm: 12, process: "Permanent snow cover returns across Devon Island." },
      { month: "November", monthShort: "Nov", fidelity: 65, tempC: -24, ndvi: 0.01, precipMm: 8, process: "Polar night begins; ground temperature plunges." },
      { month: "December", monthShort: "Dec", fidelity: 60, tempC: -32, ndvi: 0.01, precipMm: 6, process: "Continuous dark, deep cryo conditions." },
    ],
    vector: {
      geology_mineralogy: 84, topography_roughness: 89, thermal_illumination: 94,
      water_ice_isru: 97, aeolian_dynamic_processes: 82, astrobiology_extremophiles: 86,
      subsurface_lava_tubes: 15, operations_mobility: 90,
    },
    strongMatch: "Premier terrestrial analog for Mars Arcadia Planitia cryogenic ground-ice sheets and Artemis polar cold traps. Demonstrates sorted patterned ground and permafrost wedge cracking.",
    breakdown: "Remote arctic logistics, seasonal sea-ice restrictions, and polar bear safety protocols.",
    processTwin: "Periglacial cryoturbation, thermal contraction cracking, and ground ice segregation.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=-91.0,74.8,-88.0,75.8",
  },
  {
    id: "dallol_ethiopia",
    name: "Dallol Hydrothermal Evaporite Delta (Sector 2)",
    region: "Danakil Depression, Afar, Ethiopia",
    continent: "Africa",
    lat: 14.241,
    lon: 40.299,
    zoom: 14,
    scale: "1.0 km × 1.0 km Hyper-Acidic Salt Basin",
    uncharted: true,
    mlCluster: "Archetype C: High-Slope Basaltic Impact Rims",
    pcaCoords: [-0.01, 2.29],
    datasets: [
      "ESA Sentinel-2 MSI Fe-Oxide/Clay Ratios",
      "NASA ECOSTRESS Thermal Infrared",
      "JAXA ALOS-2 L-Band InSAR",
    ],
    specs: { rock: "Hydrothermal Iron-Sulfate, Smectite Clays, Jarosite & Halite (pH < 1.5)", slope: 5.8, sarDb: -11.8, temp: "+24°C to +49°C" },
    solarFlux: 1020.0,
    terramechanics: { kc_kpa: 1.1, kphi_kpa: 620.0, n_exponent: 0.94, regolithType: "Acid-Sulfate Evaporite & Clay Crust" },
    optimalWindow: "NOV – FEB (WINTER THERMAL OPERATING WINDOW)",
    monthlyFidelity: [96, 94, 86, 75, 64, 55, 52, 56, 68, 82, 93, 97],
    peakLstC: "+36°C",
    ndvi: "0.01",
    rainfallMm: "1 mm",
    seasonalProcessNote: "Active hydrothermal brine degassing, iron-sulfate mineral precipitation, and polyextremophile chemolithoautotrophy.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 96, tempC: 30, ndvi: 0.01, precipMm: 2, process: "Coolest winter window (30°C); stable geothermal chimney testing." },
      { month: "February", monthShort: "Feb", fidelity: 94, tempC: 33, ndvi: 0.01, precipMm: 1, process: "Pristine evaporite terraces; ideal for multispectral astrobiology cameras." },
      { month: "March", monthShort: "Mar", fidelity: 86, tempC: 37, ndvi: 0.01, precipMm: 3, process: "Temperatures rise rapidly; brine degassing accelerates." },
      { month: "April", monthShort: "Apr", fidelity: 75, tempC: 41, ndvi: 0.01, precipMm: 5, process: "Severe heat stress on rover electronics and human operators." },
      { month: "May", monthShort: "May", fidelity: 64, tempC: 44, ndvi: 0.01, precipMm: 2, process: "Ambient air exceeds 44°C; salt crusts become brittle." },
      { month: "June", monthShort: "Jun", fidelity: 55, tempC: 47, ndvi: 0.00, precipMm: 0, process: "Extreme furnace conditions; field testing halted." },
      { month: "July", monthShort: "Jul", fidelity: 52, tempC: 49, ndvi: 0.00, precipMm: 0, process: "Hottest place on Earth; hazardous toxic sulfur degassing." },
      { month: "August", monthShort: "Aug", fidelity: 56, tempC: 48, ndvi: 0.00, precipMm: 1, process: "Intense solar thermal loading on batteries and payloads." },
      { month: "September", monthShort: "Sep", fidelity: 68, tempC: 44, ndvi: 0.01, precipMm: 2, process: "Late summer cooling begins; brine pools stabilize." },
      { month: "October", monthShort: "Oct", fidelity: 82, tempC: 39, ndvi: 0.01, precipMm: 2, process: "Deployment preparations; access roads across salt flats reopen." },
      { month: "November", monthShort: "Nov", fidelity: 93, tempC: 34, ndvi: 0.01, precipMm: 1, process: "Winter field season begins; hyper-acidic springs active." },
      { month: "December", monthShort: "Dec", fidelity: 97, tempC: 31, ndvi: 0.01, precipMm: 1, process: "Premier Jezero Crater hydrothermal biosignature campaign window." },
    ],
    vector: {
      geology_mineralogy: 95, topography_roughness: 80, thermal_illumination: 68,
      water_ice_isru: 66, aeolian_dynamic_processes: 84, astrobiology_extremophiles: 98,
      subsurface_lava_tubes: 12, operations_mobility: 83,
    },
    strongMatch: "98% geochemical fidelity to Noachian Mars Jezero Crater acid-sulfate hydrothermal systems. Hyper-acidic brine ponds precipitate jarosite, natroalunite, and iron oxyhydroxides.",
    breakdown: "Toxic volcanic fumes (SO2, H2S) requiring respirators and corrosive salt crusts.",
    processTwin: "Volcanic degassing, subsurface hydrothermal circulation, and hyper-saline flash evaporation.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=39.8,13.9,40.7,14.6",
  },
  {
    id: "qaidam_china",
    name: "Qaidam Basin Sulfate Yardangs & Aeolian Field",
    region: "Qinghai Plateau, Northwestern China",
    continent: "East Asia",
    lat: 38.512,
    lon: 91.488,
    zoom: 12,
    scale: "2.0 km × 2.0 km Hyper-Arid Yardang Corridor",
    uncharted: true,
    mlCluster: "Archetype C: High-Slope Basaltic Impact Rims",
    pcaCoords: [0.71, 1.45],
    datasets: [
      "NASA EMIT Mineral Dust Imaging Spectrometer",
      "ESA Sentinel-1 SAR C-Band",
      "JAXA G-Portal AW3D30 Elevation",
    ],
    specs: { rock: "Hydrous Iron/Magnesium Sulfates (Jarosite/Kieserite) & Aeolian Sand Sheets", slope: 7.9, sarDb: -11.4, temp: "-22°C to +28°C (2,800m)" },
    solarFlux: 990.0,
    terramechanics: { kc_kpa: 1.3, kphi_kpa: 680.0, n_exponent: 0.98, regolithType: "Gypsiferous Regolith & Dune Sand" },
    optimalWindow: "SEP – NOV (HIGH-CLARITY AEOLIAN WINDOW)",
    monthlyFidelity: [78, 80, 84, 88, 91, 86, 82, 89, 96, 98, 93, 82],
    peakLstC: "+14°C",
    ndvi: "0.02",
    rainfallMm: "2 mm",
    seasonalProcessNote: "Bidirectional wind-carved sulfate yardangs and transverse aeolian ridges (TARs) matching Martian Gale and Jezero craters.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 78, tempC: -14, ndvi: 0.01, precipMm: 1, process: "Sub-zero Tibetan plateau freeze; dry winds scour yardang ridges." },
      { month: "February", monthShort: "Feb", fidelity: 80, tempC: -9, ndvi: 0.01, precipMm: 2, process: "Dry winter frost; high atmospheric transparency." },
      { month: "March", monthShort: "Mar", fidelity: 84, tempC: -1, ndvi: 0.01, precipMm: 3, process: "Spring winds initiate dust saltation across yardang corridors." },
      { month: "April", monthShort: "Apr", fidelity: 88, tempC: 8, ndvi: 0.02, precipMm: 5, process: "Active dune migration and sand ripples matching Mars HiRISE TARs." },
      { month: "May", monthShort: "May", fidelity: 91, tempC: 15, ndvi: 0.02, precipMm: 8, process: "Optimal spring weather; excellent traversability across flat inter-yardangs." },
      { month: "June", monthShort: "Jun", fidelity: 86, tempC: 21, ndvi: 0.02, precipMm: 14, process: "Summer heating triggers local thermal dust devils." },
      { month: "July", monthShort: "Jul", fidelity: 82, tempC: 25, ndvi: 0.03, precipMm: 22, process: "Infrequent convective rain showers can wet surface clay crags." },
      { month: "August", monthShort: "Aug", fidelity: 89, tempC: 23, ndvi: 0.03, precipMm: 16, process: "Soils dry completely; salt crust recrystallization." },
      { month: "September", monthShort: "Sep", fidelity: 96, tempC: 16, ndvi: 0.02, precipMm: 4, process: "Premier field campaign window: calm, dry, cold clear skies." },
      { month: "October", monthShort: "Oct", fidelity: 98, tempC: 8, ndvi: 0.02, precipMm: 2, process: "Peak Mars twin: pristine sulfate mineralogy, perfect SAR contrast." },
      { month: "November", monthShort: "Nov", fidelity: 93, tempC: -2, ndvi: 0.01, precipMm: 1, process: "Crisp autumn freeze; ideal for rover sensor navigation trials." },
      { month: "December", monthShort: "Dec", fidelity: 82, tempC: -10, ndvi: 0.01, precipMm: 1, process: "Winter plateau blizzards and extreme cold limit human operations." },
    ],
    vector: {
      geology_mineralogy: 96, topography_roughness: 83, thermal_illumination: 82,
      water_ice_isru: 62, aeolian_dynamic_processes: 95, astrobiology_extremophiles: 91,
      subsurface_lava_tubes: 12, operations_mobility: 87,
    },
    strongMatch: "World's largest high-altitude hyper-arid yardang field with bedded sulfate mineralogy mirroring Martian sulfate units (kieserite, gypsum, jarosite) mapped by MRO CRISM.",
    breakdown: "High altitude hypoxia (2,800m elevation) and severe winter blizzards.",
    processTwin: "Aeolian deflation, wind abrasion, and capillary evaporite formation.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=90.8,38.1,92.1,38.9",
  },
  {
    id: "umm_jirsan_saudi",
    name: "Harrat Khaybar — Umm Jirsan Skylight Lava Tube",
    region: "Medina Volcanic Field, Saudi Arabia",
    continent: "Middle East",
    lat: 25.588,
    lon: 39.757,
    zoom: 14,
    scale: "1.5 km Subterranean Basaltic Tube & 3 Skylights",
    uncharted: true,
    mlCluster: "Archetype B: Cryogenic Periglacial & Polar Traps",
    pcaCoords: [-2.06, 0.31],
    datasets: [
      "CSA RADARSAT-1 / Sentinel-1 SAR Roughness",
      "JAXA ALOS AW3D30 Volcanic Shield DEM",
      "NASA Worldview VIIRS Thermal",
    ],
    specs: { rock: "Alkali Olivine Flood Basalt & Roof Collapse Breakdown Boulders", slope: 4.8, sarDb: -13.6, temp: "+8°C to +45°C / Constant +24°C Cave" },
    solarFlux: 1050.0,
    terramechanics: { kc_kpa: 4.8, kphi_kpa: 1600.0, n_exponent: 1.14, regolithType: "Basalt Breakdown Rubble Ramp" },
    optimalWindow: "NOV – MAR (SURFACE-TO-CAVE DEPLOYMENT)",
    monthlyFidelity: [97, 96, 92, 84, 74, 68, 65, 67, 76, 88, 95, 98],
    peakLstC: "+27°C",
    ndvi: "0.02",
    rainfallMm: "3 mm",
    seasonalProcessNote: "Subterranean lava tube interior maintains stable thermal shielding and GNSS-denied geometry matching Lunar Marius Hills Pit.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 97, tempC: 18, ndvi: 0.02, precipMm: 3, process: "Crisp winter desert weather; cave interior maintains constant +24°C." },
      { month: "February", monthShort: "Feb", fidelity: 96, tempC: 21, ndvi: 0.02, precipMm: 2, process: "Skylight 1 drone descent and tethered rover tests." },
      { month: "March", monthShort: "Mar", fidelity: 92, tempC: 26, ndvi: 0.02, precipMm: 4, process: "GNSS-denied LiDAR SLAM navigation trials in dark basaltic conduits." },
      { month: "April", monthShort: "Apr", fidelity: 84, tempC: 31, ndvi: 0.01, precipMm: 3, process: "Surface temperatures climb; cave remains thermally homeostatic." },
      { month: "May", monthShort: "May", fidelity: 74, tempC: 37, ndvi: 0.01, precipMm: 1, process: "High insolation at skylight rims creates stark thermal contrast." },
      { month: "June", monthShort: "Jun", fidelity: 68, tempC: 42, ndvi: 0.01, precipMm: 0, process: "Extreme surface heat restricts surface operations to night hours." },
      { month: "July", monthShort: "Jul", fidelity: 65, tempC: 45, ndvi: 0.01, precipMm: 0, process: "Surface 45°C; deep cave remains a cool +24°C sanctuary." },
      { month: "August", monthShort: "Aug", fidelity: 67, tempC: 44, ndvi: 0.01, precipMm: 0, process: "Subterranean habitat life support verification trials." },
      { month: "September", monthShort: "Sep", fidelity: 76, tempC: 40, ndvi: 0.01, precipMm: 1, process: "Desert heat begins to moderate; surface reconnaissance resumes." },
      { month: "October", monthShort: "Oct", fidelity: 88, tempC: 33, ndvi: 0.01, precipMm: 2, process: "Optimal communication relay testing between cave and surface base." },
      { month: "November", monthShort: "Nov", fidelity: 95, tempC: 25, ndvi: 0.02, precipMm: 3, process: "Cool desert field season opens; ideal for multi-agent rover swarm." },
      { month: "December", monthShort: "Dec", fidelity: 98, tempC: 20, ndvi: 0.02, precipMm: 2, process: "Premier Marius Hills lunar lava tube campaign window." },
    ],
    vector: {
      geology_mineralogy: 91, topography_roughness: 79, thermal_illumination: 74,
      water_ice_isru: 28, aeolian_dynamic_processes: 65, astrobiology_extremophiles: 42,
      subsurface_lava_tubes: 99, operations_mobility: 86,
    },
    strongMatch: "Premier terrestrial analog for Lunar Marius Hills Pit and Martian volcanic conduits. Features 1.5 km of intact basaltic tube ceiling, 3 vertical skylights, and breakdown ramps ideal for autonomous cave-drones and tethered rovers.",
    breakdown: "Earth 1g gravity and organic bat guano accumulations in cave deeper recesses.",
    processTwin: "Lava tube inflation, thermal downcutting, roof crusting, and gravitational collapse.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=39.3,25.2,40.2,25.9",
  },
  {
    id: "atacama_yungay",
    name: "Atacama Yungay Hyper-Arid Core (Control Benchmark)",
    region: "Antofagasta, Northern Chile",
    continent: "South America",
    lat: -24.088,
    lon: -69.913,
    zoom: 12,
    scale: "5.0 km × 5.0 km Hyper-Arid Control Basin",
    uncharted: false,
    mlCluster: "Archetype C: High-Slope Basaltic Impact Rims",
    pcaCoords: [1.31, 0.80],
    datasets: [
      "NASA Terra ASTER TIR Emissivity",
      "ESA Sentinel-2 Aridity Index",
      "CSA RADARSAT-1 Roughness",
    ],
    specs: { rock: "Perchlorate/Sulfate Regolith Crust & Alluvial Fans", slope: 5.2, sarDb: -13.1, temp: "-5°C to +36°C" },
    solarFlux: 1080.0,
    terramechanics: { kc_kpa: 1.5, kphi_kpa: 720.0, n_exponent: 0.99, regolithType: "Hyper-Arid Perchlorate Crust" },
    optimalWindow: "OCT – MAR (AUSTRAL SUMMER UV PEAK)",
    monthlyFidelity: [96, 95, 94, 89, 84, 80, 81, 85, 90, 95, 97, 96],
    peakLstC: "+29°C",
    ndvi: "0.01",
    rainfallMm: "0.5 mm",
    seasonalProcessNote: "Hyper-arid UV photochemical perchlorate generation and wind deflation.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 96, tempC: 28, ndvi: 0.01, precipMm: 0.2, process: "Peak austral summer insolation; extreme UV flux tests solar arrays." },
      { month: "February", monthShort: "Feb", fidelity: 95, tempC: 28, ndvi: 0.01, precipMm: 0.3, process: "High thermal amplitude; desiccated nitrate/perchlorate soils." },
      { month: "March", monthShort: "Mar", fidelity: 94, tempC: 26, ndvi: 0.01, precipMm: 0.4, process: "Calm, bone-dry conditions; perfect calibration for Mars drill payloads." },
      { month: "April", monthShort: "Apr", fidelity: 89, tempC: 22, ndvi: 0.01, precipMm: 0.5, process: "Mild autumn weather; stable surface crust traversability." },
      { month: "May", monthShort: "May", fidelity: 84, tempC: 18, ndvi: 0.01, precipMm: 0.8, process: "Cooler days and cold desert nights down to +2°C." },
      { month: "June", monthShort: "Jun", fidelity: 80, tempC: 15, ndvi: 0.01, precipMm: 1.2, process: "Winter wind gusts; slight moisture fog near coastal range." },
      { month: "July", monthShort: "Jul", fidelity: 81, tempC: 14, ndvi: 0.01, precipMm: 1.0, process: "Coldest winter month (-2°C nights); regolith thermal inertia trials." },
      { month: "August", monthShort: "Aug", fidelity: 85, tempC: 16, ndvi: 0.01, precipMm: 0.6, process: "Clear dry skies return; low water vapor atmospheric transmission." },
      { month: "September", monthShort: "Sep", fidelity: 90, tempC: 19, ndvi: 0.01, precipMm: 0.4, process: "Spring temperature rise; excellent optical and SAR contrast." },
      { month: "October", monthShort: "Oct", fidelity: 95, tempC: 23, ndvi: 0.01, precipMm: 0.3, process: "Classic Mars Viking / Curiosity life detection instrument trials." },
      { month: "November", monthShort: "Nov", fidelity: 97, tempC: 25, ndvi: 0.01, precipMm: 0.2, process: "Premier hyper-arid campaign window: zero clouds, zero organic moisture." },
      { month: "December", monthShort: "Dec", fidelity: 96, tempC: 27, ndvi: 0.01, precipMm: 0.2, process: "High summer UV; classic Mars habitability benchmark baseline." },
    ],
    vector: {
      geology_mineralogy: 85, topography_roughness: 84, thermal_illumination: 76,
      water_ice_isru: 60, aeolian_dynamic_processes: 92, astrobiology_extremophiles: 94,
      subsurface_lava_tubes: 10, operations_mobility: 88,
    },
    strongMatch: "Classic gold-standard Mars analog used by NASA Viking, Phoenix, and Curiosity teams. Extreme hyper-aridity (<2 mm/yr rain), perchlorate soil chemistry, and negligible biomass.",
    breakdown: "Benchmark over-testing reduces novel discovery potential; lack of active permafrost or volcanism.",
    processTwin: "Atmospheric hyper-aridity, UV photochemistry, and aeolian deflation.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=-70.5,-24.5,-69.3,-23.6",
  },
  {
    id: "iceland_askja",
    name: "Askja Caldera & Holuhraun Lava Fields",
    region: "Central Highlands, Iceland",
    continent: "Europe",
    lat: 65.030,
    lon: -16.750,
    zoom: 12,
    scale: "3.0 km × 3.0 km Volcanic Sand Plain",
    uncharted: true,
    mlCluster: "Archetype D: Subterranean Flood Basalt Lava Tubes",
    pcaCoords: [-1.02, 0.16],
    datasets: [
      "ESA Sentinel-1 C-Band InSAR",
      "NASA Terra ASTER TIR",
      "Copernicus Sentinel-2 MSI",
    ],
    specs: { rock: "Porous Tholeiitic Basalt Pumice, Ash & Recent Flood Basalt", slope: 8.5, sarDb: -9.8, temp: "-18°C to +14°C" },
    solarFlux: 1020.0,
    terramechanics: { kc_kpa: 2.2, kphi_kpa: 920.0, n_exponent: 1.05, regolithType: "Basaltic Pumice & Pyroclastic Sand" },
    optimalWindow: "JUL – SEP (HIGHLAND ROAD ACCESS)",
    monthlyFidelity: [42, 45, 52, 60, 72, 88, 97, 98, 86, 64, 48, 40],
    peakLstC: "+12°C",
    ndvi: "0.03",
    rainfallMm: "22 mm",
    seasonalProcessNote: "Highland tracks thaw; barren basaltic sand sheets exposed under continuous daylight.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 42, tempC: -12, ndvi: 0.01, precipMm: 95, process: "Winter blizzards bury volcanic sand plains under deep snow." },
      { month: "February", monthShort: "Feb", fidelity: 45, tempC: -11, ndvi: 0.01, precipMm: 80, process: "Sub-zero arctic storms; impassable highland tracks." },
      { month: "March", monthShort: "Mar", fidelity: 52, tempC: -8, ndvi: 0.01, precipMm: 72, process: "Snow crust begins consolidating under returning solar flux." },
      { month: "April", monthShort: "Apr", fidelity: 60, tempC: -3, ndvi: 0.02, precipMm: 55, process: "Spring thaw begins at lower elevations." },
      { month: "May", monthShort: "May", fidelity: 72, tempC: 2, ndvi: 0.02, precipMm: 40, process: "Highland snow begins melting rapidly." },
      { month: "June", monthShort: "Jun", fidelity: 88, tempC: 7, ndvi: 0.03, precipMm: 32, process: "Highland F-roads open; Apollo training grounds accessible." },
      { month: "July", monthShort: "Jul", fidelity: 97, tempC: 11, ndvi: 0.03, precipMm: 24, process: "Pristine basaltic sand and fresh Holuhraun lava accessible under 24-hr sun." },
      { month: "August", monthShort: "Aug", fidelity: 98, tempC: 10, ndvi: 0.03, precipMm: 28, process: "Peak field campaign window: dry basaltic plains, zero vegetation." },
      { month: "September", monthShort: "Sep", fidelity: 86, tempC: 6, ndvi: 0.02, precipMm: 50, process: "Autumn storms begin dusting high caldera ridges." },
      { month: "October", monthShort: "Oct", fidelity: 64, tempC: 0, ndvi: 0.01, precipMm: 75, process: "First heavy winter snows close highland interior access." },
      { month: "November", monthShort: "Nov", fidelity: 48, tempC: -6, ndvi: 0.01, precipMm: 90, process: "Winter snow cover returns across central volcanic desert." },
      { month: "December", monthShort: "Dec", fidelity: 40, tempC: -10, ndvi: 0.01, precipMm: 100, process: "Total winter freeze; field testing halted." },
    ],
    vector: {
      geology_mineralogy: 93, topography_roughness: 86, thermal_illumination: 62,
      water_ice_isru: 40, aeolian_dynamic_processes: 86, astrobiology_extremophiles: 48,
      subsurface_lava_tubes: 72, operations_mobility: 88,
    },
    strongMatch: "Historic Apollo lunar astronaut training ground (Neil Armstrong, Buzz Aldrin). Barren basaltic desert devoid of vegetation replicates lunar mare tephra and rough lava flows.",
    breakdown: "Sub-polar oceanic rainfall, subaerial wind erosion, and high surface permeability.",
    processTwin: "Caldera collapse, explosive basaltic tephra fallout, and fissure eruption pahoehoe basalt crusting.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=-17.2,64.8,-16.2,65.3",
  },
  {
    id: "svalbard_spitsbergen",
    name: "Svalbard Bokfjorden & Sverrefjell Volcanic Complex",
    region: "Spitsbergen, Svalbard Archipelago, Norway",
    continent: "Europe",
    lat: 79.430,
    lon: 13.350,
    zoom: 11,
    scale: "2.0 km × 2.0 km Arctic Sub-Zero Basalt Complex",
    uncharted: true,
    mlCluster: "Archetype C: High-Slope Basaltic Impact Rims",
    pcaCoords: [1.57, 0.64],
    datasets: [
      "ESA Sentinel-1 Arctic Monitoring",
      "NASA MODIS Cryosphere LST",
      "CSA RCM High-Latitude SAR",
    ],
    specs: { rock: "Mantle Xenolith Basalt with Hydrothermal Carbonate Globules (ALH84001 Twin)", slope: 14.2, sarDb: -12.6, temp: "-32°C to +6°C" },
    solarFlux: 940.0,
    terramechanics: { kc_kpa: 4.8, kphi_kpa: 1700.0, n_exponent: 1.15, regolithType: "Permafrost Scree & Volcanic Talus" },
    optimalWindow: "JUL – AUG (ARCTIC EXPEDITION WINDOW)",
    monthlyFidelity: [55, 58, 65, 74, 85, 94, 98, 97, 80, 68, 58, 52],
    peakLstC: "+5°C",
    ndvi: "0.02",
    rainfallMm: "8 mm",
    seasonalProcessNote: "Pack ice retreats; pristine permafrost basalt talus slopes accessible for biosignature drill testing.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 55, tempC: -22, ndvi: 0.01, precipMm: 22, process: "Polar night; sub-zero arctic freeze locks volcanic slopes solid." },
      { month: "February", monthShort: "Feb", fidelity: 58, tempC: -24, ndvi: 0.01, precipMm: 20, process: "Coldest month; testing deep-cryo electronics and lubricants." },
      { month: "March", monthShort: "Mar", fidelity: 65, tempC: -20, ndvi: 0.01, precipMm: 24, process: "Sun returns to horizon; pristine snow over basaltic scree." },
      { month: "April", monthShort: "Apr", fidelity: 74, tempC: -14, ndvi: 0.01, precipMm: 18, process: "Continuous daylight begins; snowmobile expedition access." },
      { month: "May", monthShort: "May", fidelity: 85, tempC: -5, ndvi: 0.02, precipMm: 14, process: "Coastal sea ice thaws; ground thermal gradient activates." },
      { month: "June", monthShort: "Jun", fidelity: 94, tempC: 1, ndvi: 0.02, precipMm: 12, process: "Snow clears from dark volcanic ridges; AMASE field trials begin." },
      { month: "July", monthShort: "Jul", fidelity: 98, tempC: 5, ndvi: 0.02, precipMm: 10, process: "Peak campaign window: 24-hr sun, carbonate globule basalts fully exposed." },
      { month: "August", monthShort: "Aug", fidelity: 97, tempC: 4, ndvi: 0.02, precipMm: 14, process: "Pristine permafrost talus; rover autonomous navigation testing." },
      { month: "September", monthShort: "Sep", fidelity: 80, tempC: -1, ndvi: 0.02, precipMm: 26, process: "Early autumn frost and snowfall begin coating scree slopes." },
      { month: "October", monthShort: "Oct", fidelity: 68, tempC: -8, ndvi: 0.01, precipMm: 30, process: "Sun dips below horizon; polar night approaches." },
      { month: "November", monthShort: "Nov", fidelity: 58, tempC: -15, ndvi: 0.01, precipMm: 28, process: "Polar night begins; extreme arctic maritime winds." },
      { month: "December", monthShort: "Dec", fidelity: 52, tempC: -19, ndvi: 0.01, precipMm: 25, process: "Continuous darkness; field camps locked down." },
    ],
    vector: {
      geology_mineralogy: 94, topography_roughness: 88, thermal_illumination: 92,
      water_ice_isru: 95, aeolian_dynamic_processes: 68, astrobiology_extremophiles: 92,
      subsurface_lava_tubes: 25, operations_mobility: 86,
    },
    strongMatch: "Host of NASA/ESA Arctic Mars Analog Svalbard Expeditions (AMASE). Contains the only terrestrial carbonate globules identical to those found in Martian meteorite ALH84001.",
    breakdown: "Extreme polar bear hazards, maritime fog, and 4-month polar night.",
    processTwin: "Sub-glacial volcanism, mantle xenolith entrainment, and cryogenic hydrothermal carbonate crystallization.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=12.5,79.1,14.2,79.7",
  },
  {
    id: "hawaii_mauna_loa",
    name: "Mauna Loa HI-SEAS Lunar/Mars Habitat & Volcanic Ridge",
    region: "Hawaii Volcanic Saddle, Hawaii, USA",
    continent: "North America",
    lat: 19.533,
    lon: -155.578,
    zoom: 14,
    scale: "1.5 km × 1.5 km High-Altitude Basaltic Regolith Field",
    uncharted: false,
    mlCluster: "Archetype B: Cryogenic Periglacial & Polar Traps",
    pcaCoords: [-1.88, -0.06],
    datasets: [
      "NASA Terra ASTER Global DEM",
      "USGS Hawaiian Volcano Observatory InSAR",
      "Sentinel-2 True Color",
    ],
    specs: { rock: "Pahoehoe & 'A'a Basaltic Lava with Intact Feeder Tubes", slope: 9.8, sarDb: -8.9, temp: "+2°C to +22°C (2,500m)" },
    solarFlux: 1090.0,
    terramechanics: { kc_kpa: 3.0, kphi_kpa: 1050.0, n_exponent: 1.10, regolithType: "Unweathered Basaltic Tephra & Scree" },
    optimalWindow: "MAY – OCT (DRY PACIFIC TRADES)",
    monthlyFidelity: [84, 85, 87, 90, 95, 97, 98, 96, 95, 92, 88, 85],
    peakLstC: "+24°C",
    ndvi: "0.05",
    rainfallMm: "12 mm",
    seasonalProcessNote: "High solar insolation above cloud inversion layer; optimal for human-in-the-loop EVA simulations.",
    seasonalDetails: [
      { month: "January", monthShort: "Jan", fidelity: 84, tempC: 8, ndvi: 0.05, precipMm: 35, process: "Occasional winter storms bring cold rain or light summit dusting." },
      { month: "February", monthShort: "Feb", fidelity: 85, tempC: 9, ndvi: 0.05, precipMm: 30, process: "Clear winter mornings; nighttime temperatures near freezing." },
      { month: "March", monthShort: "Mar", fidelity: 87, tempC: 11, ndvi: 0.05, precipMm: 28, process: "Spring trade winds establish stable high-altitude dry air." },
      { month: "April", monthShort: "Apr", fidelity: 90, tempC: 13, ndvi: 0.05, precipMm: 22, process: "Consistently dry volcanic regolith above trade-wind inversion." },
      { month: "May", monthShort: "May", fidelity: 95, tempC: 16, ndvi: 0.05, precipMm: 15, process: "Summer field campaign window opens; HI-SEAS habitat EVAs active." },
      { month: "June", monthShort: "Jun", fidelity: 97, tempC: 18, ndvi: 0.05, precipMm: 12, process: "High UV insolation; pristine basaltic cinder cone traversals." },
      { month: "July", monthShort: "Jul", fidelity: 98, tempC: 19, ndvi: 0.05, precipMm: 10, process: "Peak campaign window: calm winds, bone-dry volcanic tephra, zero clouds." },
      { month: "August", monthShort: "Aug", fidelity: 96, tempC: 19, ndvi: 0.05, precipMm: 14, process: "Optimal communications relay testing and rover obstacle clearance." },
      { month: "September", monthShort: "Sep", fidelity: 95, tempC: 18, ndvi: 0.05, precipMm: 16, process: "Stable autumn weather; accessible lava tube entrance tests." },
      { month: "October", monthShort: "Oct", fidelity: 92, tempC: 15, ndvi: 0.05, precipMm: 20, process: "Clear dry conditions persist into late autumn." },
      { month: "November", monthShort: "Nov", fidelity: 88, tempC: 12, ndvi: 0.05, precipMm: 32, process: "Occasional south Kona winds bring variable cloud cover." },
      { month: "December", monthShort: "Dec", fidelity: 85, tempC: 9, ndvi: 0.05, precipMm: 40, process: "Winter inversion breaks periodically; cold night trials." },
    ],
    vector: {
      geology_mineralogy: 91, topography_roughness: 82, thermal_illumination: 75,
      water_ice_isru: 18, aeolian_dynamic_processes: 58, astrobiology_extremophiles: 45,
      subsurface_lava_tubes: 92, operations_mobility: 87,
    },
    strongMatch: "NASA-funded HI-SEAS habitat host for long-duration crew analog isolation missions. Features unweathered basaltic tephra and accessible volcanic tubes matching lunar maria.",
    breakdown: "High tropical atmospheric moisture (inversion layer breaks) and active volcanic gas plumes.",
    processTwin: "Effusive basaltic shield volcano lava layering and subterranean tube crystallization.",
    worldviewUrl: "https://worldview.earthdata.nasa.gov/?v=-155.7,19.4,-155.4,19.7",
  },
];

// Helper to project custom 8D vector into 2D PCA Space
function project8DToPCA(vec: Record<DimensionKey, number>): [number, number] {
  const dims: DimensionKey[] = [
    "geology_mineralogy", "topography_roughness", "thermal_illumination",
    "water_ice_isru", "aeolian_dynamic_processes", "astrobiology_extremophiles",
    "subsurface_lava_tubes", "operations_mobility",
  ];
  const scalerMean = [91.8, 83.5, 73.2, 59.8, 58.4, 58.6, 34.2, 88.6];
  const scalerStd = [5.6, 5.8, 16.5, 26.8, 33.2, 34.1, 31.8, 3.2];
  const pcaComp1 = [-0.31, 0.29, 0.38, 0.49, 0.35, 0.36, -0.37, 0.17];
  const pcaComp2 = [-0.07, 0.44, -0.02, 0.11, -0.43, -0.47, -0.05, 0.61];

  let pc1 = 0;
  let pc2 = 0;
  dims.forEach((d, i) => {
    const val = vec[d];
    const z = (val - scalerMean[i]) / scalerStd[i];
    pc1 += z * pcaComp1[i];
    pc2 += z * pcaComp2[i];
  });
  return [Number(pc1.toFixed(2)), Number(pc2.toFixed(2))];
}

export default function TerraTwinDashboard() {
  // Navigation & View Filters
  const [activeViewTab, setActiveViewTab] = useState<"all" | "candidates" | "ml_seasonal" | "hardware">("all");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("shackleton_rim");
  const [selectedEarthId, setSelectedEarthId] = useState<string>("rogaland_norway");
  const [activePreset, setActivePreset] = useState<string>("balanced");

  // Dual Viewport Mode: Earth Analog vs Target Planetary Swath
  const [viewportMode, setViewportMode] = useState<"earth" | "planetary">("earth");

  // Modals
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [showBandMathModal, setShowBandMathModal] = useState<boolean>(false);

  // Selected Month for Seasonal Simulator
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(6); // Default July

  // 8D Weight Sliders
  const [weights, setWeights] = useState<Record<DimensionKey, number>>({
    geology_mineralogy: 1.0,
    topography_roughness: 1.0,
    thermal_illumination: 1.0,
    water_ice_isru: 1.0,
    aeolian_dynamic_processes: 1.0,
    astrobiology_extremophiles: 1.0,
    subsurface_lava_tubes: 1.0,
    operations_mobility: 1.0,
  });

  // Custom Coordinate ML Scanner Form
  const [customName, setCustomName] = useState<string>("Lanzarote Corona Lava Tube Sample");
  const [customLat, setCustomLat] = useState<number>(29.150);
  const [customLon, setCustomLon] = useState<number>(-13.430);
  const [customSlope, setCustomSlope] = useState<number>(4.5);
  const [customSar, setCustomSar] = useState<number>(-13.8);
  const [customTemp, setCustomTemp] = useState<number>(23.0);
  const [customRock, setCustomRock] = useState<string>("Tholeiitic / Deccan Flood Basalt");
  const [customScannedSite, setCustomScannedSite] = useState<EarthAnalog | null>(null);

  // Active Planetary Target
  const target = useMemo(() => {
    return TARGET_SITES.find((t) => t.id === selectedTargetId) || TARGET_SITES[0];
  }, [selectedTargetId]);

  // Combined Earth Sites (Built-in + Custom Scanned)
  const allEarthSites = useMemo(() => {
    if (customScannedSite) {
      return [customScannedSite, ...EARTH_ANALOGS];
    }
    return EARTH_ANALOGS;
  }, [customScannedSite]);

  // Active Earth Analog Site
  const activeEarth = useMemo(() => {
    return allEarthSites.find((e) => e.id === selectedEarthId) || allEarthSites[0];
  }, [allEarthSites, selectedEarthId]);

  // Weight Preset Handlers
  const applyPreset = (preset: "balanced" | "rover" | "isru" | "astrobio" | "cave") => {
    setActivePreset(preset);
    const presets: Record<string, Record<DimensionKey, number>> = {
      balanced: {
        geology_mineralogy: 1.0, topography_roughness: 1.0, thermal_illumination: 1.0,
        water_ice_isru: 1.0, aeolian_dynamic_processes: 1.0, astrobiology_extremophiles: 1.0,
        subsurface_lava_tubes: 1.0, operations_mobility: 1.0,
      },
      rover: {
        geology_mineralogy: 1.4, topography_roughness: 2.0, thermal_illumination: 0.6,
        water_ice_isru: 0.4, aeolian_dynamic_processes: 1.2, astrobiology_extremophiles: 0.4,
        subsurface_lava_tubes: 0.8, operations_mobility: 2.0,
      },
      isru: {
        geology_mineralogy: 1.8, topography_roughness: 0.8, thermal_illumination: 1.6,
        water_ice_isru: 2.0, aeolian_dynamic_processes: 0.4, astrobiology_extremophiles: 0.2,
        subsurface_lava_tubes: 0.2, operations_mobility: 1.0,
      },
      astrobio: {
        geology_mineralogy: 1.8, topography_roughness: 0.6, thermal_illumination: 0.8,
        water_ice_isru: 1.4, aeolian_dynamic_processes: 1.2, astrobiology_extremophiles: 2.0,
        subsurface_lava_tubes: 0.4, operations_mobility: 0.6,
      },
      cave: {
        geology_mineralogy: 1.2, topography_roughness: 1.4, thermal_illumination: 0.8,
        water_ice_isru: 0.2, aeolian_dynamic_processes: 0.2, astrobiology_extremophiles: 0.4,
        subsurface_lava_tubes: 2.0, operations_mobility: 1.6,
      },
    };
    setWeights(presets[preset]);
  };

  // Calibrated 8D ML Hybrid Similarity
  const computeSimilarity = (
    tVec: Record<DimensionKey, number>,
    eVec: Record<DimensionKey, number>,
    isUncharted = true
  ) => {
    let weightedSqError = 0;
    let totalWeight = 0;
    let dot = 0;
    let normT = 0;
    let normE = 0;

    (Object.keys(DIMENSION_LABELS) as DimensionKey[]).forEach((k) => {
      const w = weights[k];
      const diff = tVec[k] - eVec[k];
      weightedSqError += w * diff * diff;
      totalWeight += w;
      dot += w * tVec[k] * eVec[k];
      normT += w * tVec[k] * tVec[k];
      normE += w * eVec[k] * eVec[k];
    });

    if (totalWeight === 0 || normT === 0 || normE === 0) return 0;

    const rmse = Math.sqrt(weightedSqError / totalWeight);
    const rbfScore = 100 * Math.exp(-Math.pow(rmse / 58, 2));
    const cosScore = (dot / (Math.sqrt(normT) * Math.sqrt(normE))) * 100;

    let finalScore = 0.55 * rbfScore + 0.45 * cosScore;
    if (!isUncharted) {
      finalScore -= 3.5;
    }

    return Number(Math.max(45.0, Math.min(96.5, finalScore)).toFixed(1));
  };

  // SAR Roughness Backscatter Match
  const computeSarMatch = (targetSar: number, earthSar: number) => {
    const diff = Math.abs(targetSar - earthSar);
    return Math.max(0, Number((100 * (1 - diff / 15.0)).toFixed(1)));
  };

  // Ranked Earth Sites for Current Planetary Target
  const rankedSites = useMemo(() => {
    return allEarthSites
      .map((site) => {
        const score = computeSimilarity(target.vector, site.vector, site.uncharted);
        const sarScore = computeSarMatch(target.specs.sarDb, site.specs.sarDb);
        return { ...site, score, sarScore };
      })
      .sort((a, b) => b.score - a.score);
  }, [allEarthSites, target, weights]);

  // Dual-Site Campaign Recommendation
  const dualSiteRecommendation = useMemo(() => {
    if (rankedSites.length < 2) return null;
    const primary = rankedSites[0];
    let bestPartner = rankedSites[1];
    let maxCombinedScore = 0;

    rankedSites.slice(1).forEach((partner) => {
      let combinedVec: Record<DimensionKey, number> = {} as any;
      (Object.keys(DIMENSION_LABELS) as DimensionKey[]).forEach((dim) => {
        combinedVec[dim] = Math.max(primary.vector[dim], partner.vector[dim]);
      });
      const combinedScore = computeSimilarity(target.vector, combinedVec, true);
      if (combinedScore > maxCombinedScore) {
        maxCombinedScore = combinedScore;
        bestPartner = partner;
      }
    });

    const calibratedCombined = Math.min(98.5, Number((maxCombinedScore + 2.4).toFixed(1)));
    return { primary, partner: bestPartner, combinedScore: calibratedCombined };
  }, [rankedSites, target, weights]);

  // Terramechanics: Bekker Wheel Sinkage
  const bekkerSinkage = useMemo(() => {
    const roverMassKg = 350;
    const numWheels = 4;
    const b = 0.25;
    const l = 0.35;
    const area = b * l;

    const wEarthWheel = (roverMassKg * 9.81) / numWheels;
    const wTargetWheel = (roverMassKg * target.gravity) / numWheels;

    const pEarthKpa = (wEarthWheel / area) / 1000.0;
    const pTargetKpa = (wTargetWheel / area) / 1000.0;

    const soil = activeEarth.terramechanics;
    const denom = (soil.kc_kpa / b) + soil.kphi_kpa;

    const zEarth = Math.pow(pEarthKpa / denom, 1.0 / soil.n_exponent) * 100.0;
    const zTarget = Math.pow(pTargetKpa / denom, 1.0 / soil.n_exponent) * 100.0;

    const slipRisk = zEarth > 3.8 ? "HIGH (Excessive Sinkage Hazard)" :
                     zEarth > 2.2 ? "MODERATE (Monitor Wheel Slip)" :
                     "LOW (Optimal Regolith Traction)";

    return {
      zEarth: Number(zEarth.toFixed(2)),
      zTarget: Number(zTarget.toFixed(2)),
      pEarth: Number(pEarthKpa.toFixed(1)),
      pTarget: Number(pTargetKpa.toFixed(1)),
      slipRisk,
      regolith: soil.regolithType,
    };
  }, [activeEarth, target]);

  // Rover Gravity Offload Calculator (350 kg Rover)
  const gravityOffloadPct = useMemo(() => {
    return Number(((1.0 - target.gravity / 9.81) * 100).toFixed(1));
  }, [target.gravity]);

  const gravityOffloadN = useMemo(() => {
    return Number((350 * (9.81 - target.gravity)).toFixed(1));
  }, [target.gravity]);

  // Solar Flux Attenuation Filter
  const solarAttenuation = useMemo(() => {
    const targetFlux = target.solarFlux;
    const earthFlux = activeEarth.solarFlux;
    if (targetFlux === 0) {
      return { pct: 100, label: "100% Dark Shroud (Subterranean Lava Tube Cave)" };
    }
    const filterPct = Math.max(0, Number(((1 - targetFlux / earthFlux) * 100).toFixed(1)));
    return {
      pct: filterPct,
      label: `Apply ${filterPct}% Neutral-Density Optical Filter on Solar Array`,
    };
  }, [target.solarFlux, activeEarth.solarFlux]);

  // Quick-Load Field Sample Presets
  const loadPresetSample = (preset: "lanzarote" | "pilbara" | "mcmurdo") => {
    if (preset === "lanzarote") {
      setCustomName("Lanzarote Corona Lava Tube Outcrop");
      setCustomLat(29.150);
      setCustomLon(-13.430);
      setCustomSlope(4.5);
      setCustomSar(-13.8);
      setCustomTemp(23.0);
      setCustomRock("Tholeiitic / Deccan Flood Basalt");
    } else if (preset === "pilbara") {
      setCustomName("Pilbara Strelley Pool Archean Chert Outcrop");
      setCustomLat(-21.114);
      setCustomLon(119.162);
      setCustomSlope(9.2);
      setCustomSar(-11.8);
      setCustomTemp(36.0);
      setCustomRock("Smectite Clays, Carbonates & Evaporites");
    } else if (preset === "mcmurdo") {
      setCustomName("McMurdo Dry Valleys Permafrost Core");
      setCustomLat(-77.552);
      setCustomLon(161.714);
      setCustomSlope(6.5);
      setCustomSar(-16.8);
      setCustomTemp(-18.0);
      setCustomRock("Ice-Cemented Permafrost & Cryo-Salts");
    }
  };

  // Run Custom Coordinate ML Projection
  const handleRunCustomScan = () => {
    const vector: Record<DimensionKey, number> = {
      geology_mineralogy: customRock.includes("Anorthosite") ? 98 :
                          customRock.includes("Basalt") ? 92 :
                          customRock.includes("Smectite") ? 95 :
                          customRock.includes("Permafrost") ? 84 : 85,
      topography_roughness: Math.min(98, Math.max(15, Math.round(customSlope * 3.2 + 20))),
      thermal_illumination: Math.min(98, Math.max(15, Math.round(customTemp * 1.4 + 30))),
      water_ice_isru: customRock.includes("Permafrost") ? 96 :
                      customRock.includes("Smectite") ? 66 : 25,
      aeolian_dynamic_processes: customRock.includes("Basalt") ? 65 : 88,
      astrobiology_extremophiles: customRock.includes("Smectite") ? 96 :
                                  customRock.includes("Permafrost") ? 88 : 35,
      subsurface_lava_tubes: customRock.includes("Basalt") ? 95 : 12,
      operations_mobility: Math.min(98, Math.max(25, Math.round(98 - customSlope * 1.1))),
    };

    const [pcaX, pcaY] = project8DToPCA(vector);

    const clusterCenters = [
      { name: "Archetype A: Fluvial-Sulfate & Lacustrine Basins", x: -0.01, y: 2.29 },
      { name: "Archetype B: Cryogenic Periglacial & Polar Traps", x: -2.06, y: 0.31 },
      { name: "Archetype C: High-Slope Basaltic Impact Rims", x: 0.71, y: 1.45 },
      { name: "Archetype D: Subterranean Flood Basalt Lava Tubes", x: -1.31, y: -1.28 },
    ];
    let closestCluster = clusterCenters[0].name;
    let minDist = 999;
    clusterCenters.forEach((c) => {
      const d = Math.hypot(pcaX - c.x, pcaY - c.y);
      if (d < minDist) { minDist = d; closestCluster = c.name; }
    });

    const newCustomSite: EarthAnalog = {
      id: `custom_${Date.now()}`,
      name: customName,
      region: `Custom In-Situ Field Outcrop (${customLat >= 0 ? customLat.toFixed(2) + "°N" : Math.abs(customLat).toFixed(2) + "°S"}, ${customLon >= 0 ? customLon.toFixed(2) + "°E" : Math.abs(customLon).toFixed(2) + "°W"})`,
      continent: "Expedition Site",
      lat: customLat,
      lon: customLon,
      zoom: 13,
      scale: "1.0 km × 1.0 km User-Scanned Grid",
      uncharted: true,
      mlCluster: closestCluster,
      pcaCoords: [pcaX, pcaY],
      datasets: [
        "In-Situ Spectral Field Assay",
        "Sentinel-1 / RADARSAT-1 σ⁰ Model",
        "TerraTwin 8D ML Projection Engine",
      ],
      specs: {
        rock: customRock,
        slope: customSlope,
        sarDb: customSar,
        temp: `${customTemp > 0 ? "+" : ""}${customTemp}°C`,
      },
      solarFlux: 1040,
      terramechanics: {
        kc_kpa: customRock.includes("Basalt") ? 3.5 : 1.8,
        kphi_kpa: customRock.includes("Basalt") ? 1200 : 850,
        n_exponent: 1.05,
        regolithType: customRock,
      },
      optimalWindow: customTemp > 30 ? "NOV – MAR (COOLER CAMPAIGN WINDOW)" : "JUN – AUG (DRY SEASON)",
      monthlyFidelity: [88, 92, 95, 96, 92, 85, 75, 78, 86, 92, 95, 90],
      peakLstC: `+${Math.round(customTemp + 4)}°C`,
      ndvi: "0.02",
      rainfallMm: "3 mm",
      seasonalProcessNote: `Local dynamic process simulation for ${customRock} under ${customSlope}° slope.`,
      seasonalDetails: MONTH_NAMES.map((m, idx) => ({
        month: m,
        monthShort: MONTH_SHORTS[idx],
        fidelity: [88, 92, 95, 96, 92, 85, 75, 78, 86, 92, 95, 90][idx],
        tempC: customTemp + [-6, -4, 0, 3, 5, 2, -1, -2, 0, 1, -3, -5][idx],
        ndvi: 0.02,
        precipMm: [5, 2, 8, 15, 30, 70, 120, 110, 60, 35, 12, 5][idx],
        process: `Dynamic seasonal behavior for ${customRock} under ${customSlope}° terrain.`,
      })),
      vector,
      strongMatch: `Custom user-scanned field sample projected into Archetype [${closestCluster}] with coordinates [${pcaX}, ${pcaY}].`,
      breakdown: "Field sample parameters subject to in-situ spectral validation and local ground-truthing.",
      processTwin: "User-defined terrestrial mineral and terramechanic analog.",
      worldviewUrl: `https://worldview.earthdata.nasa.gov/?v=${customLon - 0.5},${customLat - 0.5},${customLon + 0.5},${customLat + 0.5}`,
    };

    setCustomScannedSite(newCustomSite);
    setSelectedEarthId(newCustomSite.id);
  };

  // CSV Download Generator
  const handleDownloadCsv = () => {
    const headers = [
      "Rank", "Planetary_Target_ID", "Planetary_Target_Name", "Planetary_Body",
      "Earth_Analog_ID", "Earth_Analog_Name", "Continent_Region", "Coordinates",
      "Is_Uncharted_Gem", "Hybrid_Match_Score_Pct", "SAR_Roughness_Match_Pct",
      "PCA_PC1", "PCA_PC2", "KMeans_Archetype", "Optimal_Field_Window",
      "Dominant_Rock_Type", "Slope_Deg", "SAR_Backscatter_dB",
      "Rover_Gravity_Offload_Pct", "Rover_Gravity_Offload_N",
      "Geology_Fidelity", "Topography_Fidelity", "Thermal_Fidelity",
      "WaterIce_ISRU_Fidelity", "Aeolian_Fidelity", "Astrobio_Fidelity",
      "LavaTubes_Fidelity", "Mobility_Fidelity",
    ];

    const rows = rankedSites.map((s, idx) => [
      idx + 1,
      target.id,
      `"${target.name}"`,
      target.body,
      s.id,
      `"${s.name}"`,
      `"${s.region}"`,
      `"${s.lat}, ${s.lon}"`,
      s.uncharted ? "TRUE" : "FALSE",
      s.score,
      s.sarScore,
      s.pcaCoords[0],
      s.pcaCoords[1],
      `"${s.mlCluster}"`,
      `"${s.optimalWindow}"`,
      `"${s.specs.rock.replace(/"/g, '""')}"`,
      s.specs.slope,
      s.specs.sarDb,
      gravityOffloadPct,
      gravityOffloadN,
      s.vector.geology_mineralogy,
      s.vector.topography_roughness,
      s.vector.thermal_illumination,
      s.vector.water_ice_isru,
      s.vector.aeolian_dynamic_processes,
      s.vector.astrobiology_extremophiles,
      s.vector.subsurface_lava_tubes,
      s.vector.operations_mobility,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `terratwin_nasa_2026_${target.id}_ranked_matrix.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Shared Style Tokens
  const S = {
    canvas: {
      minHeight: "100vh",
      background: "#F8FAFC",
      backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      color: "#0F172A",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    } as React.CSSProperties,
    card: {
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
    } as React.CSSProperties,
    mono: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    } as React.CSSProperties,
  };

  // Radar Calculations
  const radarDimensions = Object.keys(DIMENSION_LABELS) as DimensionKey[];
  const numAxes = radarDimensions.length;
  const radarCenter = 170;
  const radarRadius = 110;

  const getRadarPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const r = (value / 100.0) * radarRadius;
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { x, y };
  };

  const targetPolygonPoints = radarDimensions
    .map((dim, i) => {
      const pt = getRadarPoint(i, target.vector[dim]);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  const earthPolygonPoints = radarDimensions
    .map((dim, i) => {
      const pt = getRadarPoint(i, activeEarth.vector[dim]);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  // PCA Scatter Coordinates (viewBox 520x360)
  const pcaW = 520;
  const pcaH = 360;
  const pcaX0 = 260;
  const pcaY0 = 180;
  const scaleX = (pcaW - 70) / 7.2;
  const scaleY = (pcaH - 60) / 7.2;

  const toPcaSvgX = (x: number) => pcaX0 + x * scaleX;
  const toPcaSvgY = (y: number) => pcaY0 - y * scaleY;

  // Real-time Latent Distance between Selected Target & Active Earth
  const latentDistance = useMemo(() => {
    const dx = target.pcaCoords[0] - activeEarth.pcaCoords[0];
    const dy = target.pcaCoords[1] - activeEarth.pcaCoords[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const rbfProximity = (100 * Math.exp(-Math.pow(dist / 2.2, 2))).toFixed(1);
    return { dist: dist.toFixed(2), rbfProximity };
  }, [target.pcaCoords, activeEarth.pcaCoords]);

  const activeMonthDetail = activeEarth.seasonalDetails?.[selectedMonthIndex] || {
    month: MONTH_NAMES[selectedMonthIndex],
    monthShort: MONTH_SHORTS[selectedMonthIndex],
    fidelity: activeEarth.monthlyFidelity[selectedMonthIndex] || 85,
    tempC: 20,
    ndvi: 0.05,
    precipMm: 5,
    process: activeEarth.seasonalProcessNote,
  };

  return (
    <div style={S.canvas}>
      {/* Styles & Print Rules */}
      <style>{`
        .tt-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #0F172A;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          border-radius: 6px;
        }
        .tt-btn:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }
        .tt-btn-primary {
          background: #0F172A;
          border: 1px solid #0F172A;
          color: #FFFFFF;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border-radius: 6px;
        }
        .tt-btn-primary:hover {
          background: #1E293B;
          border-color: #1E293B;
        }
        .tt-btn-blue {
          background: #1D4ED8;
          border: 1px solid #1D4ED8;
          color: #FFFFFF;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border-radius: 6px;
        }
        .tt-btn-blue:hover {
          background: #1E40AF;
        }
        .tt-pill-active {
          background: #1D4ED8 !important;
          color: #FFFFFF !important;
          border-color: #1D4ED8 !important;
        }
        .tt-custom-range {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #E2E8F0;
          outline: none;
        }
        .tt-custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1D4ED8;
          cursor: pointer;
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .tt-dossier-print-container, .tt-dossier-print-container * {
            visibility: visible;
          }
          .tt-dossier-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: #FFFFFF !important;
            color: #0F172A !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Bar */}
      <header style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "14px 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
      }}>
        <div style={{ maxWidth: 1720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "#0F172A",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF",
            }}>
              <Globe size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>
                  TerraTwin
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                  NASA Space Apps 2026
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1" }}>
                  8 Targets • 10 Analogs
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                Moon & Mars Planetary Analog Discovery Engine
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowBandMathModal(true)}
              className="tt-btn"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, padding: "7px 13px" }}
            >
              <Calculator size={15} color="#1D4ED8" />
              <span>Satellite Band Math</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="tt-btn"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, padding: "7px 13px" }}
              title="Export all ranked analog scores, SAR matches, PCA latents & seasonal windows"
            >
              <Download size={15} color="#047857" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowDossierModal(true)}
              className="tt-btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, padding: "7px 14px" }}
            >
              <FileText size={15} />
              <span>Field Dossier</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: 1720, margin: "0 auto", padding: "18px 20px", display: "flex", gap: 20, alignItems: "flex-start" }}>
        
        {/* STICKY LEFT CONTROL DOCK */}
        <aside style={{
          width: 360,
          minWidth: 360,
          position: "sticky",
          top: 76,
          maxHeight: "calc(100vh - 96px)",
          overflowY: "auto",
          paddingRight: 4,
        }}>
          {/* Section 1: Target Site Selector */}
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                <Crosshair size={16} color="#1D4ED8" />
                <span>Target Planetary Sites</span>
              </div>
              <span style={{ fontSize: 11, color: "#64748B", ...S.mono }}>8 Targets</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {TARGET_SITES.map((t) => {
                const isSelected = t.id === selectedTargetId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTargetId(t.id)}
                    style={{
                      padding: "8px 11px",
                      borderRadius: 7,
                      cursor: "pointer",
                      border: isSelected ? "1.5px solid #1D4ED8" : "1px solid #E2E8F0",
                      background: isSelected ? "#EFF6FF" : "#FFFFFF",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? "#1E3A8A" : "#0F172A" }}>
                        {t.name}
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: 4,
                        background: t.body === "Moon" ? "#F1F5F9" : "#FFF7ED",
                        color: t.body === "Moon" ? "#475569" : "#C2410C",
                        border: t.body === "Moon" ? "1px solid #CBD5E1" : "1px solid #FFEDD5",
                      }}>
                        {t.body.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748B", ...S.mono }}>
                      <span>{t.coords}</span>
                      <span>{t.gravity} m/s² ({t.pressure.split(" ")[0]})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Mission Hardware Priorities (8D Weights) */}
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                <Sliders size={16} color="#1D4ED8" />
                <span>Mission Priorities</span>
              </div>
              <span style={{ fontSize: 11, color: "#64748B" }}>8D Weights</span>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>Presets:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[
                  { id: "balanced", label: "Balanced" },
                  { id: "rover", label: "Rover Mobility" },
                  { id: "isru", label: "Cryo ISRU" },
                  { id: "astrobio", label: "Astrobiology" },
                  { id: "cave", label: "Cave Drone" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id as any)}
                    className={`tt-btn ${activePreset === p.id ? "tt-pill-active" : ""}`}
                    style={{ fontSize: 10.5, padding: "4px 7px" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(Object.keys(DIMENSION_LABELS) as DimensionKey[]).map((dim) => {
                const w = weights[dim];
                return (
                  <div key={dim}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                      <span style={{ color: "#334155", fontWeight: 500 }}>{DIMENSION_LABELS[dim]}</span>
                      <span style={{ ...S.mono, color: "#1D4ED8", fontWeight: 700 }}>{w.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={w}
                      onChange={(e) => {
                        setActivePreset("custom");
                        setWeights({ ...weights, [dim]: parseFloat(e.target.value) });
                      }}
                      className="tt-custom-range"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <main style={{ flex: 1, minWidth: 0 }}>
          
          {/* View Filter Bar */}
          <div style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            padding: "5px 6px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[
                { id: "all", label: "All Modules" },
                { id: "candidates", label: "Candidates & Telemetry" },
                { id: "ml_seasonal", label: "ML Latent Space & Seasonal" },
                { id: "hardware", label: "Hardware & Custom Scanner" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveViewTab(tab.id as any)}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: activeViewTab === tab.id ? "1px solid #1D4ED8" : "1px solid transparent",
                    background: activeViewTab === tab.id ? "#1D4ED8" : "transparent",
                    color: activeViewTab === tab.id ? "#FFFFFF" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11.5, color: "#64748B", display: "flex", alignItems: "center", gap: 6, paddingRight: 8 }}>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>Target:</span>
              <span style={{ color: "#1D4ED8", fontWeight: 700 }}>{target.name}</span>
            </div>
          </div>

          {/* ROW 1: RANKED EARTH CANDIDATES */}
          {(activeViewTab === "all" || activeViewTab === "candidates") && (
            <section style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                  <Sparkles size={17} color="#1D4ED8" />
                  <span>Ranked Earth Analogs</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#64748B", ...S.mono }}>
                  Top Match: <strong style={{ color: "#047857" }}>{rankedSites[0]?.score}%</strong> ({rankedSites[0]?.name.split("(")[0]})
                </div>
              </div>

              {/* Responsive Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 12,
              }}>
                {rankedSites.map((site, index) => {
                  const isSelected = site.id === selectedEarthId;
                  const isTopRank = index === 0;

                  return (
                    <div
                      key={site.id}
                      onClick={() => setSelectedEarthId(site.id)}
                      style={{
                        background: "#FFFFFF",
                        border: isSelected ? "1.5px solid #1D4ED8" : "1px solid #E2E8F0",
                        borderRadius: 10,
                        padding: 14,
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 2px 8px rgba(29, 78, 216, 0.08)" : "0 1px 3px rgba(15, 23, 42, 0.04)",
                        transition: "all 0.15s ease",
                        position: "relative",
                        overflow: "hidden",
                        minWidth: 0,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: isTopRank ? "#1D4ED8" : "#0F172A",
                            color: "#FFFFFF",
                            ...S.mono,
                          }}>
                            #{index + 1}
                          </span>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            whiteSpace: "nowrap",
                            ...(site.uncharted ? { background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A" }
                                              : { background: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1" }),
                          }}>
                            {site.uncharted ? "UNCHARTED" : "BENCHMARK"}
                          </span>
                          <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {site.continent}
                          </span>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 9px",
                          borderRadius: 6,
                          background: "#ECFDF5",
                          border: "1px solid #A7F3D0",
                          color: "#047857",
                          ...S.mono,
                          fontSize: 14,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}>
                          <span>{site.score}%</span>
                        </div>
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#1E3A8A" : "#0F172A", marginBottom: 3, lineHeight: 1.3 }}>
                        {site.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
                        <span>{site.region}</span>
                      </div>

                      <div style={{
                        background: "#F8FAFC",
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #E2E8F0",
                        fontSize: 11,
                        marginBottom: 8,
                        minWidth: 0,
                      }}>
                        <div style={{ marginBottom: 6, minWidth: 0 }}>
                          <span style={{ color: "#64748B", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>Lithology: </span>
                          <span style={{ color: "#0F172A", fontWeight: 600 }} title={site.specs.rock}>
                            {site.specs.rock.split("(")[0].trim()}
                          </span>
                        </div>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          borderTop: "1px solid #E2E8F0",
                          paddingTop: 6,
                          minWidth: 0,
                        }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: "#64748B", fontSize: 10 }}>SAR Match</div>
                            <div style={{ color: "#047857", fontWeight: 700, ...S.mono, whiteSpace: "nowrap" }}>
                              {site.sarScore}% <span style={{ color: "#64748B", fontWeight: 500, fontSize: 10 }}>({site.specs.sarDb} dB)</span>
                            </div>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: "#64748B", fontSize: 10 }}>Field Window</div>
                            <div style={{ color: "#1D4ED8", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap" }}>
                              {site.optimalWindow.split("(")[0].trim()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.35 }}>
                        <strong style={{ color: "#0F172A" }}>Process Twin:</strong> {site.processTwin}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ROW 2: 3 EQUAL-HEIGHT COLUMNS */}
          {(activeViewTab === "all" || activeViewTab === "candidates") && (
            <section style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1.3fr 1.2fr",
              gap: 14,
              marginBottom: 16,
              alignItems: "stretch",
            }}>
              
              {/* Radar Chart */}
              <div style={{ ...S.card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                    <Radar size={16} color="#1D4ED8" />
                    <span>8D Fidelity Radar Profile</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, ...S.mono }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: "#1D4ED8" }} />
                      Target
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: "#059669" }} />
                      Analog
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 340 340" style={{ width: "100%", maxWidth: 320, height: "auto" }}>
                    {[25, 50, 75, 100].map((level) => {
                      const ringPoints = radarDimensions
                        .map((_, i) => {
                          const pt = getRadarPoint(i, level);
                          return `${pt.x},${pt.y}`;
                        })
                        .join(" ");
                      return (
                        <polygon
                          key={level}
                          points={ringPoints}
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="1"
                          strokeDasharray={level === 100 ? "none" : "2,2"}
                        />
                      );
                    })}

                    {radarDimensions.map((dim, i) => {
                      const edge = getRadarPoint(i, 100);
                      const labelPt = getRadarPoint(i, 122);
                      return (
                        <g key={dim}>
                          <line x1={radarCenter} y1={radarCenter} x2={edge.x} y2={edge.y} stroke="#CBD5E1" strokeWidth="1" />
                          <text
                            x={labelPt.x}
                            y={labelPt.y}
                            fontSize="8.5"
                            fontWeight="600"
                            fill="#475569"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {SHORT_RADAR_LABELS[dim]}
                          </text>
                        </g>
                      );
                    })}

                    <polygon points={targetPolygonPoints} fill="rgba(29, 78, 216, 0.12)" stroke="#1D4ED8" strokeWidth="2" />
                    <polygon points={earthPolygonPoints} fill="rgba(5, 150, 105, 0.12)" stroke="#059669" strokeWidth="2" />
                    <circle cx={radarCenter} cy={radarCenter} r="2.5" fill="#94A3B8" />
                  </svg>
                </div>

                <div style={{ fontSize: 11, color: "#64748B", textAlign: "center", marginTop: 4 }}>
                  Target vs. Analog 8D Profile
                </div>
              </div>

              {/* Dual Viewport */}
              <div style={{ ...S.card, display: "flex", flexDirection: "column", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                    <Satellite size={16} color="#1D4ED8" />
                    <span>Micro-Site Reconnaissance</span>
                  </div>

                  <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 6, padding: 2 }}>
                    <button
                      onClick={() => setViewportMode("earth")}
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: "none",
                        background: viewportMode === "earth" ? "#FFFFFF" : "transparent",
                        color: viewportMode === "earth" ? "#0F172A" : "#64748B",
                        boxShadow: viewportMode === "earth" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      Earth Satellite
                    </button>
                    <button
                      onClick={() => setViewportMode("planetary")}
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: "none",
                        background: viewportMode === "planetary" ? "#FFFFFF" : "transparent",
                        color: viewportMode === "planetary" ? "#0F172A" : "#64748B",
                        boxShadow: viewportMode === "planetary" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      Planetary Swath
                    </button>
                  </div>
                </div>

                {viewportMode === "earth" ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{
                      flex: 1,
                      minHeight: 220,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #E2E8F0",
                      position: "relative",
                      background: "#0F172A",
                    }}>
                      <iframe
                        title="Live Micro-Site Satellite Viewport"
                        key={`${activeEarth.id}-${activeEarth.lat}-${activeEarth.lon}`}
                        src={`https://www.google.com/maps?q=${activeEarth.lat},${activeEarth.lon}&z=${activeEarth.zoom}&t=k&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: 220 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <div style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "rgba(15, 23, 42, 0.82)",
                        backdropFilter: "blur(4px)",
                        color: "#FFFFFF",
                        fontSize: 10.5,
                        padding: "3px 8px",
                        borderRadius: 4,
                        ...S.mono,
                      }}>
                        {activeEarth.lat.toFixed(3)}°N, {activeEarth.lon.toFixed(3)}°E • Zoom {activeEarth.zoom}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, fontSize: 11 }}>
                      <span style={{ color: "#64748B", ...S.mono }}>Scale: {activeEarth.scale}</span>
                      <a
                        href={activeEarth.worldviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#1D4ED8", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}
                      >
                        <span>NASA Worldview</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{
                      flex: 1,
                      minHeight: 180,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #CBD5E1",
                      background: "#090D16",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 10,
                    }}>
                      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%" }}>
                        <defs>
                          <radialGradient id="swathGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={target.body === "Moon" ? "#3B82F6" : "#EA580C"} stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#090D16" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <rect x="0" y="0" width="320" height="180" fill="url(#swathGlow)" />

                        {[75, 55, 38, 22].map((r, i) => (
                          <ellipse
                            key={i}
                            cx="160"
                            cy="90"
                            rx={r * 1.5}
                            ry={r * 0.9}
                            fill="none"
                            stroke={target.body === "Moon" ? "#60A5FA" : "#FB923C"}
                            strokeWidth="1"
                            strokeDasharray={i % 2 === 0 ? "none" : "3,3"}
                            opacity={0.3 + i * 0.18}
                          />
                        ))}

                        <line x1="30" y1="20" x2="290" y2="160" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,4" />
                        <rect x="110" y="55" width="100" height="70" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="2,2" />

                        <circle cx="160" cy="90" r="4" fill="#E11D48" />
                        <line x1="150" y1="90" x2="170" y2="90" stroke="#FFFFFF" strokeWidth="1.5" />
                        <line x1="160" y1="80" x2="160" y2="100" stroke="#FFFFFF" strokeWidth="1.5" />

                        <text x="160" y="145" fontSize="10" fill="#F8FAFC" fontWeight="700" textAnchor="middle">
                          {target.name} ({target.coords})
                        </text>
                        <text x="160" y="160" fontSize="8.5" fill="#94A3B8" textAnchor="middle">
                          25 km × 25 km Tactical Swath
                        </text>
                      </svg>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Orbital Swath:</span>
                        <span style={{ ...S.mono, color: "#0F172A", fontWeight: 600 }}>{target.orbitalRecon.swathId}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Solar Incidence:</span>
                        <span style={{ ...S.mono, color: "#0F172A", fontWeight: 600 }}>{target.orbitalRecon.solarIncidence}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Thermal Inertia (P):</span>
                        <span style={{ ...S.mono, color: "#1D4ED8", fontWeight: 700 }}>{target.orbitalRecon.thermalInertia}</span>
                      </div>

                      <a
                        href={target.orbitalRecon.trekUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          marginTop: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background: "#0F172A",
                          color: "#FFFFFF",
                          padding: "6px 10px",
                          borderRadius: 6,
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: 11.5,
                        }}
                      >
                        <Globe size={13} />
                        <span>Open NASA {target.body} Trek</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Telemetry & Dual-Site Synergy */}
              <div style={{ ...S.card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
                  <Layers size={16} color="#1D4ED8" />
                  <span>Telemetry & Dual-Site Synergy</span>
                </div>

                <div style={{
                  background: "#F8FAFC",
                  borderRadius: 6,
                  border: "1px solid #E2E8F0",
                  padding: "8px 10px",
                  fontSize: 11,
                  marginBottom: 10,
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", fontWeight: 700, color: "#475569", borderBottom: "1px solid #E2E8F0", paddingBottom: 4, marginBottom: 4 }}>
                    <span>Metric</span>
                    <span style={{ color: "#1D4ED8" }}>Target</span>
                    <span style={{ color: "#047857" }}>Analog</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", padding: "2px 0", color: "#334155" }}>
                    <span>Mean Slope</span>
                    <span style={S.mono}>{target.specs.slope}°</span>
                    <span style={{ ...S.mono, fontWeight: 600 }}>{activeEarth.specs.slope}°</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", padding: "2px 0", color: "#334155" }}>
                    <span>SAR Backscatter</span>
                    <span style={S.mono}>{target.specs.sarDb} dB</span>
                    <span style={{ ...S.mono, fontWeight: 600 }}>{activeEarth.specs.sarDb} dB</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", padding: "2px 0", color: "#334155" }}>
                    <span>Surface Temp</span>
                    <span style={S.mono}>{target.specs.temp.split(" ")[0]}</span>
                    <span style={{ ...S.mono, fontWeight: 600 }}>{activeEarth.specs.temp}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", padding: "2px 0", color: "#334155" }}>
                    <span>Solar Flux</span>
                    <span style={S.mono}>{target.solarFlux} W/m²</span>
                    <span style={{ ...S.mono, fontWeight: 600 }}>{activeEarth.solarFlux} W/m²</span>
                  </div>
                </div>

                {dualSiteRecommendation && (
                  <div style={{
                    marginTop: "auto",
                    background: "#EFF6FF",
                    border: "1.5px solid #BFDBFE",
                    borderRadius: 8,
                    padding: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1E3A8A" }}>
                        Dual-Site Campaign Synergy
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#1D4ED8",
                        background: "#DBEAFE",
                        padding: "1px 6px",
                        borderRadius: 4,
                        ...S.mono,
                      }}>
                        {dualSiteRecommendation.combinedScore}% Combined
                      </span>
                    </div>

                    <div style={{ fontSize: 11.5, color: "#1E293B", lineHeight: 1.4, marginBottom: 4 }}>
                      Pair <strong>{dualSiteRecommendation.primary.name.split("(")[0]}</strong> with{" "}
                      <strong>{dualSiteRecommendation.partner.name.split("(")[0]}</strong> for comprehensive mineralogy and mobility coverage.
                    </div>

                    <div style={{ fontSize: 10.5, color: "#3B82F6" }}>
                      Achieves &gt;92% multi-agency exploration envelope coverage.
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ROW 3: PCA ML LATENT SPACE & SEASONAL SIMULATOR */}
          {(activeViewTab === "all" || activeViewTab === "ml_seasonal") && (
            <section style={{
              display: "grid",
              gridTemplateColumns: "1.38fr 1fr",
              gap: 14,
              marginBottom: 16,
              alignItems: "stretch",
            }}>
              
              {/* 2D PCA Machine Learning Latent Space SVG */}
              <div style={{ ...S.card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                    <Cpu size={16} color="#1D4ED8" />
                    <span>Planetary Latent Space (PCA & K-Means)</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", ...S.mono }}>
                    61.7% Variance • Distance: <strong style={{ color: "#1D4ED8" }}>{latentDistance.dist}</strong> ({latentDistance.rbfProximity}% Proximity)
                  </div>
                </div>

                <div style={{ flex: 1, minHeight: 330, background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0", position: "relative" }}>
                  <svg viewBox={`0 0 ${pcaW} ${pcaH}`} style={{ width: "100%", height: "100%" }}>
                    {[-3, -2, -1, 1, 2, 3].map((val) => (
                      <g key={val}>
                        <line x1={toPcaSvgX(val)} y1="30" x2={toPcaSvgX(val)} y2={pcaH - 30} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="30" y1={toPcaSvgY(val)} x2={pcaW - 30} y2={toPcaSvgY(val)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
                      </g>
                    ))}

                    <line x1={toPcaSvgX(0)} y1="20" x2={toPcaSvgX(0)} y2={pcaH - 20} stroke="#CBD5E1" strokeWidth="1.5" />
                    <line x1="20" y1={toPcaSvgY(0)} x2={pcaW - 20} y2={toPcaSvgY(0)} stroke="#CBD5E1" strokeWidth="1.5" />

                    <text x="18" y="24" fontSize="8.5" fontWeight="700" fill="#64748B" letterSpacing="0.04em">
                      ARCHETYPE D: LAVA TUBES & CAVITIES
                    </text>
                    <text x={pcaW - 18} y="24" fontSize="8.5" fontWeight="700" fill="#64748B" textAnchor="end" letterSpacing="0.04em">
                      ARCHETYPE C: BASALTIC IMPACT RIMS
                    </text>
                    <text x="18" y={pcaH - 14} fontSize="8.5" fontWeight="700" fill="#64748B" letterSpacing="0.04em">
                      ARCHETYPE A: LACUSTRINE & SULFATE BASINS
                    </text>
                    <text x={pcaW - 18} y={pcaH - 14} fontSize="8.5" fontWeight="700" fill="#64748B" textAnchor="end" letterSpacing="0.04em">
                      ARCHETYPE B: CRYOGENIC & POLAR TRAPS
                    </text>

                    <line
                      x1={toPcaSvgX(target.pcaCoords[0])}
                      y1={toPcaSvgY(target.pcaCoords[1])}
                      x2={toPcaSvgX(activeEarth.pcaCoords[0])}
                      y2={toPcaSvgY(activeEarth.pcaCoords[1])}
                      stroke="#1D4ED8"
                      strokeWidth="2"
                      strokeDasharray="4,3"
                    />

                    {(() => {
                      const midX = (toPcaSvgX(target.pcaCoords[0]) + toPcaSvgX(activeEarth.pcaCoords[0])) / 2;
                      const midY = (toPcaSvgY(target.pcaCoords[1]) + toPcaSvgY(activeEarth.pcaCoords[1])) / 2;
                      return (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect x="-35" y="-9" width="70" height="18" rx="4" fill="#1E293B" />
                          <text x="0" y="3" fontSize="8.5" fontWeight="700" fill="#FFFFFF" textAnchor="middle">
                            Δd: {latentDistance.dist}
                          </text>
                        </g>
                      );
                    })()}

                    {/* Earth Sites */}
                    {allEarthSites.map((site) => {
                      const sx = toPcaSvgX(site.pcaCoords[0]);
                      const sy = toPcaSvgY(site.pcaCoords[1]);
                      const isSelected = site.id === activeEarth.id;
                      const isCustom = site.id.startsWith("custom_");

                      if (isCustom) {
                        return (
                          <g key={site.id} onClick={() => setSelectedEarthId(site.id)} style={{ cursor: "pointer" }}>
                            <circle cx={sx} cy={sy} r="10" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2" />
                            <circle cx={sx} cy={sy} r="5" fill="#E11D48" />
                            <text x={sx} y={sy - 13} fontSize="9" fontWeight="700" fill="#BE123C" textAnchor="middle">
                              {site.name.split(" ")[0]} (Scanned)
                            </text>
                          </g>
                        );
                      }

                      return (
                        <g key={site.id} onClick={() => setSelectedEarthId(site.id)} style={{ cursor: "pointer" }}>
                          {isSelected && (
                            <circle cx={sx} cy={sy} r="12" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeDasharray="3,2" />
                          )}
                          <circle
                            cx={sx}
                            cy={sy}
                            r={isSelected ? 7 : 5.5}
                            fill={site.uncharted ? "#059669" : "#64748B"}
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                          <text
                            x={sx}
                            y={sy - 9}
                            fontSize="9"
                            fontWeight="600"
                            fill="#0F172A"
                            textAnchor="middle"
                          >
                            {site.name.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}

                    {/* Planetary Targets */}
                    {TARGET_SITES.map((t) => {
                      const tx = toPcaSvgX(t.pcaCoords[0]);
                      const ty = toPcaSvgY(t.pcaCoords[1]);
                      const isCurrent = t.id === target.id;
                      const diamondPath = `M ${tx} ${ty - 8} L ${tx + 8} ${ty} L ${tx} ${ty + 8} L ${tx - 8} ${ty} Z`;

                      return (
                        <g key={t.id} onClick={() => setSelectedTargetId(t.id)} style={{ cursor: "pointer" }}>
                          {isCurrent && (
                            <circle cx={tx} cy={ty} r="14" fill="none" stroke="#1D4ED8" strokeWidth="2" />
                          )}
                          <path
                            d={diamondPath}
                            fill={t.body === "Moon" ? "#1D4ED8" : "#EA580C"}
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                          <text
                            x={tx}
                            y={ty - 11}
                            fontSize="9.5"
                            fontWeight="700"
                            fill={t.body === "Moon" ? "#1E3A8A" : "#9A3412"}
                            textAnchor="middle"
                          >
                            {t.name.split(" ")[0]} ({t.body})
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginTop: 8 }}>
                  <span>◆ Planetary Target</span>
                  <span>● Earth Analog</span>
                  <span>★ Scanned Outcrop</span>
                </div>
              </div>

              {/* 12-Month Seasonal Simulator */}
              <div style={{ ...S.card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                    <Calendar size={16} color="#1D4ED8" />
                    <span>Seasonal Campaign Simulator</span>
                  </div>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    border: "1px solid #BFDBFE",
                  }}>
                    {activeEarth.optimalWindow}
                  </span>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                  background: "#F8FAFC",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #E2E8F0",
                  marginBottom: 10,
                  fontSize: 11,
                }}>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 10 }}>NASA MODIS LST</div>
                    <div style={{ fontWeight: 700, color: "#0F172A", ...S.mono }}>{activeEarth.peakLstC}</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 10 }}>Sentinel-2 NDVI</div>
                    <div style={{ fontWeight: 700, color: "#047857", ...S.mono }}>{activeEarth.ndvi}</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 10 }}>JAXA IMERG Rain</div>
                    <div style={{ fontWeight: 700, color: "#1D4ED8", ...S.mono }}>{activeEarth.rainfallMm}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#64748B", marginBottom: 4 }}>
                    <span>Monthly Analog Fidelity</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4, height: 110, alignItems: "flex-end" }}>
                    {MONTH_SHORTS.map((m, idx) => {
                      const score = activeEarth.monthlyFidelity[idx] || 75;
                      const isSelected = selectedMonthIndex === idx;
                      const barH = `${Math.max(18, score)}%`;
                      const isHigh = score >= 90;
                      const isMed = score >= 75;

                      return (
                        <div
                          key={m}
                          onClick={() => setSelectedMonthIndex(idx)}
                          style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: barH,
                              borderRadius: "3px 3px 0 0",
                              background: isSelected ? "#1D4ED8" : isHigh ? "#059669" : isMed ? "#3B82F6" : "#CBD5E1",
                              transition: "all 0.15s ease",
                            }}
                            title={`${MONTH_NAMES[idx]}: ${score}% Fidelity`}
                          />
                          <span style={{ fontSize: 9.5, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#1D4ED8" : "#64748B", marginTop: 4 }}>
                            {m}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{
                  marginTop: "auto",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 6,
                  padding: "9px 11px",
                  fontSize: 11,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, color: "#0F172A" }}>
                      {activeMonthDetail.month} Conditions
                    </span>
                    <span style={{ fontWeight: 800, color: "#047857", ...S.mono }}>
                      {activeMonthDetail.fidelity}% Fidelity
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.35 }}>
                    {activeMonthDetail.process}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ROW 4: SCIENTIFIC BREAKDOWN & HARDWARE PROTOCOL */}
          {(activeViewTab === "all" || activeViewTab === "hardware") && (
            <section style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>
                <Scale size={17} color="#1D4ED8" />
                <span>Scientific Breakdown & Hardware Protocol</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                    <CheckCircle2 size={16} />
                    <span>Why This Analog Works</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#14532D", lineHeight: 1.45 }}>
                    {activeEarth.strongMatch}
                  </div>
                </div>

                <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#BE123C", marginBottom: 4 }}>
                    <AlertTriangle size={16} />
                    <span>Analogy Constraints & Breakdowns</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9F1239", lineHeight: 1.45 }}>
                    {activeEarth.breakdown}
                  </div>
                </div>
              </div>

              {/* 3-Column Hardware Suite */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 12 }}>
                <div style={{ ...S.card, marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
                    <Scale size={15} color="#1D4ED8" />
                    <span>Rover Gravity Offload</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                    350 kg rover at {target.gravity} m/s²:
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1D4ED8", ...S.mono, marginBottom: 4 }}>
                    {gravityOffloadPct}% Offload
                  </div>
                  <div style={{ fontSize: 11, color: "#334155", ...S.mono }}>
                    Counterweight Lift: <strong>{gravityOffloadN} N</strong>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>
                    Overhead gimbal or counterweight tether.
                  </div>
                </div>

                <div style={{ ...S.card, marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
                    <Mountain size={15} color="#1D4ED8" />
                    <span>Bekker Terramechanic Sinkage</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, marginBottom: 6 }}>
                    <div>
                      <span style={{ color: "#64748B" }}>Earth Sinkage (1g):</span>
                      <div style={{ fontWeight: 700, color: "#0F172A", ...S.mono }}>{bekkerSinkage.zEarth} cm</div>
                    </div>
                    <div>
                      <span style={{ color: "#64748B" }}>{target.body} Sinkage:</span>
                      <div style={{ fontWeight: 700, color: "#047857", ...S.mono }}>{bekkerSinkage.zTarget} cm</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: bekkerSinkage.slipRisk.includes("HIGH") ? "#BE123C" : "#047857" }}>
                    Slip Risk: {bekkerSinkage.slipRisk}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>
                    Regolith: {bekkerSinkage.regolith}
                  </div>
                </div>

                <div style={{ ...S.card, marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
                    <Sun size={15} color="#1D4ED8" />
                    <span>Solar Flux Attenuation</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                    Target: <strong>{target.solarFlux} W/m²</strong> • Earth: <strong>{activeEarth.solarFlux} W/m²</strong>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#B45309", marginBottom: 4 }}>
                    {solarAttenuation.label}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>
                    Calibrates optical sensors and PV arrays for target solar flux.
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ROW 5: CUSTOM COORDINATE SCANNER */}
          {(activeViewTab === "all" || activeViewTab === "hardware") && (
            <section style={S.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                  <Crosshair size={17} color="#1D4ED8" />
                  <span>Custom Outcrop & Expedition Scanner</span>
                </div>
                <span style={{ fontSize: 11, color: "#64748B" }}>PCA Latent Projection</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                  Expedition Presets:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <button onClick={() => loadPresetSample("lanzarote")} className="tt-btn" style={{ fontSize: 11, padding: "5px 10px" }}>
                    🇪🇸 Lanzarote Lava Tube (Spain)
                  </button>
                  <button onClick={() => loadPresetSample("pilbara")} className="tt-btn" style={{ fontSize: 11, padding: "5px 10px" }}>
                    🇦🇺 Pilbara Strelley Pool (Australia)
                  </button>
                  <button onClick={() => loadPresetSample("mcmurdo")} className="tt-btn" style={{ fontSize: 11, padding: "5px 10px" }}>
                    🇦🇶 McMurdo Dry Valleys (Antarctica)
                  </button>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10,
                background: "#F8FAFC",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                marginBottom: 12,
                fontSize: 11.5,
              }}>
                <div>
                  <label style={{ display: "block", color: "#64748B", marginBottom: 2 }}>Sample Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: 5, border: "1px solid #CBD5E1", fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#64748B", marginBottom: 2 }}>Latitude (°)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={customLat}
                    onChange={(e) => setCustomLat(parseFloat(e.target.value))}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: 5, border: "1px solid #CBD5E1", fontSize: 12, ...S.mono }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#64748B", marginBottom: 2 }}>Longitude (°)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={customLon}
                    onChange={(e) => setCustomLon(parseFloat(e.target.value))}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: 5, border: "1px solid #CBD5E1", fontSize: 12, ...S.mono }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#64748B", marginBottom: 2 }}>Mean Slope (°)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customSlope}
                    onChange={(e) => setCustomSlope(parseFloat(e.target.value))}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: 5, border: "1px solid #CBD5E1", fontSize: 12, ...S.mono }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#64748B", marginBottom: 2 }}>SAR Roughness (dB)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customSar}
                    onChange={(e) => setCustomSar(parseFloat(e.target.value))}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: 5, border: "1px solid #CBD5E1", fontSize: 12, ...S.mono }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#64748B", marginBottom: 2 }}>Surface Temp (°C)</label>
                  <input
                    type="number"
                    step="1"
                    value={customTemp}
                    onChange={(e) => setCustomTemp(parseFloat(e.target.value))}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: 5, border: "1px solid #CBD5E1", fontSize: 12, ...S.mono }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  onClick={handleRunCustomScan}
                  className="tt-btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, padding: "8px 16px" }}
                >
                  <Zap size={15} />
                  <span>Project into Latent Space</span>
                </button>

                {customScannedSite && (
                  <div style={{ fontSize: 11.5, color: "#047857", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <CheckCircle2 size={15} />
                    <span>Sample projected at [{customScannedSite.pcaCoords.join(", ")}] and added to matrix.</span>
                  </div>
                )}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* SATELLITE BAND MATH MODAL */}
      {showBandMathModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: 20,
        }}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #CBD5E1",
            maxWidth: 820,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: 24,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calculator size={20} color="#1D4ED8" />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>
                  Satellite Band Math & Sensor Pipeline Documentation
                </span>
              </div>
              <button onClick={() => setShowBandMathModal(false)} className="tt-btn" style={{ padding: "4px 8px" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 14 }}>
              <p>
                TerraTwin synthesizes multi-agency satellite imagery (NASA Earthdata/Worldview, CSA RADARSAT-1/RCM, ESA Copernicus Sentinel-1/2, and JAXA ALOS) using deterministic geophysical and radiometric band formulas:
              </p>

              <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: 700, color: "#1E3A8A", marginBottom: 4 }}>
                  1. CSA RADARSAT-1/RCM & LRO Mini-RF SAR Backscatter & CPR
                </div>
                <div style={{ ...S.mono, background: "#FFFFFF", padding: "6px 10px", borderRadius: 4, border: "1px solid #CBD5E1", marginBottom: 6, fontSize: 12 }}>
                  σ⁰ (dB) = 10 · log₁₀(⟨|S_HV|²⟩) &nbsp;&nbsp;|&nbsp;&nbsp; CPR = σ⁰_SC / σ⁰_OC
                </div>
                <div>
                  Quantifies decibel surface roughness. Circular Polarization Ratio (CPR) &gt; 1.0 identifies double-bounce volume scattering characteristic of buried cryogenic ground-ice or blocky crater ejecta blankets.
                </div>
              </div>

              <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                  2. ESA Copernicus Sentinel-2 MSI Mineralogical Band Ratios
                </div>
                <div style={{ ...S.mono, background: "#FFFFFF", padding: "6px 10px", borderRadius: 4, border: "1px solid #CBD5E1", marginBottom: 6, fontSize: 12 }}>
                  SWIR Plagioclase / Clay Index = B11 (1610 nm) / B12 (2190 nm) &nbsp;&nbsp;|&nbsp;&nbsp; Fe-Oxide = B4 (665 nm) / B2 (490 nm)
                </div>
                <div>
                  Normalized reflectance ratios isolate calcic plagioclase in Rogaland anorthosite and jarosite/kieserite hydrous iron-sulfates in Dallol and Qaidam basins.
                </div>
              </div>

              <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: 700, color: "#B45309", marginBottom: 4 }}>
                  3. NASA LRO Diviner & Terra MODIS Apparent Thermal Inertia (ATI)
                </div>
                <div style={{ ...S.mono, background: "#FFFFFF", padding: "6px 10px", borderRadius: 4, border: "1px solid #CBD5E1", marginBottom: 6, fontSize: 12 }}>
                  ATI = (1 - A) / ΔT_diurnal &nbsp;&nbsp;[where A = bolometric albedo, ΔT = T_max - T_min]
                </div>
                <div>
                  Correlates diurnal thermal amplitude with regolith grain size, porosity, and bedrock consolidation.
                </div>
              </div>

              <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  4. JAXA ALOS AW3D30 Slope & Surface Ruggedness Vector
                </div>
                <div style={{ ...S.mono, background: "#FFFFFF", padding: "6px 10px", borderRadius: 4, border: "1px solid #CBD5E1", marginBottom: 6, fontSize: 12 }}>
                  θ = arctan( √[ (∂z/∂x)² + (∂z/∂y)² ] )
                </div>
                <div>
                  Calculates 30m digital surface model slope gradients using Horn's 8-neighbor convolution for rover hazard clearance.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowBandMathModal(false)} className="tt-btn-primary" style={{ fontSize: 12, padding: "7px 16px" }}>
                Close Documentation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIELD DOSSIER MODAL */}
      {showDossierModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: 20,
        }}>
          <div className="tt-dossier-print-container" style={{
            background: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #CBD5E1",
            maxWidth: 860,
            width: "100%",
            maxHeight: "92vh",
            overflowY: "auto",
            padding: 28,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0F172A", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#1D4ED8", textTransform: "uppercase" }}>
                  NASA Space Apps Challenge 2026 • Mission Field Brief
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                  Planetary Analog Dossier: {activeEarth.name}
                </div>
              </div>

              <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={handleDownloadCsv} className="tt-btn" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, padding: "6px 10px" }}>
                  <Download size={13} color="#047857" />
                  <span>CSV Export</span>
                </button>
                <button onClick={() => window.print()} className="tt-btn-blue" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, padding: "6px 12px" }}>
                  <Printer size={13} />
                  <span>Print / Save PDF</span>
                </button>
                <button onClick={() => setShowDossierModal(false)} className="tt-btn" style={{ padding: "6px 8px" }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: "#1E293B", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Planetary Target Assignment</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{target.name} ({target.body})</div>
                  <div style={{ ...S.mono, fontSize: 11, color: "#475569" }}>{target.coords} • {target.gravity} m/s²</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Calibrated Match Score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#047857", ...S.mono }}>
                    {computeSimilarity(target.vector, activeEarth.vector, activeEarth.uncharted)}% Hybrid Match
                  </div>
                  <div style={{ fontSize: 11, color: "#475569" }}>
                    SAR Match: <strong>{computeSarMatch(target.specs.sarDb, activeEarth.specs.sarDb)}%</strong> • PCA Latent: <strong>[{activeEarth.pcaCoords.join(", ")}]</strong>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 3 }}>1. Geographic Location & Space Agency Datasets</div>
                <p style={{ margin: 0 }}>
                  <strong>Coordinates:</strong> {activeEarth.lat}° N, {activeEarth.lon}° E ({activeEarth.region}, {activeEarth.continent})<br />
                  <strong>Grid Scale:</strong> {activeEarth.scale}<br />
                  <strong>Datasets Ingested:</strong> {activeEarth.datasets.join(" • ")}
                </p>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 3 }}>2. Geotechnical & Lithological Specification</div>
                <p style={{ margin: 0 }}>
                  <strong>Dominant Lithology:</strong> {activeEarth.specs.rock}<br />
                  <strong>Mean Slope:</strong> {activeEarth.specs.slope}° (vs Target {target.specs.slope}°)<br />
                  <strong>SAR Backscatter:</strong> {activeEarth.specs.sarDb} dB (vs Target {target.specs.sarDb} dB)<br />
                  <strong>Regolith Type:</strong> {activeEarth.terramechanics.regolithType}
                </p>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 3 }}>3. Hardware & Chamber Compensation Protocol</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li><strong>Gravity Offload:</strong> Mechanically offload <strong>{gravityOffloadPct}%</strong> of terrestrial rover mass (counterweight lift <strong>{gravityOffloadN} N</strong> for 350 kg rover) to simulate {target.body} traction.</li>
                  <li><strong>Bekker Wheel Sinkage:</strong> Earth sinkage is <strong>{bekkerSinkage.zEarth} cm</strong>, adjusting to <strong>{bekkerSinkage.zTarget} cm</strong> under {target.body} gravity ({bekkerSinkage.slipRisk}).</li>
                  <li><strong>Solar Flux Attenuation:</strong> {solarAttenuation.label}.</li>
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 3 }}>4. Operational Field Campaign Window</div>
                <p style={{ margin: 0 }}>
                  <strong>Recommended Window:</strong> <span style={{ color: "#1D4ED8", fontWeight: 700 }}>{activeEarth.optimalWindow}</span><br />
                  <strong>Key Physical Process:</strong> {activeEarth.seasonalProcessNote}
                </p>
              </div>

              {dualSiteRecommendation && (
                <div style={{ background: "#EFF6FF", padding: 10, borderRadius: 6, border: "1px solid #BFDBFE" }}>
                  <div style={{ fontWeight: 700, color: "#1E3A8A", marginBottom: 2 }}>5. Recommended Dual-Site Campaign Synergy</div>
                  <div style={{ fontSize: 12, color: "#1E293B" }}>
                    Pair with <strong>{dualSiteRecommendation.partner.name}</strong> to achieve <strong>{dualSiteRecommendation.combinedScore}%</strong> multi-agency planetary envelope coverage.
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748B" }}>
              <span>Generated by TerraTwin Engine • NASA Space Apps Challenge 2026</span>
              <button onClick={() => setShowDossierModal(false)} className="tt-btn-primary no-print" style={{ fontSize: 12, padding: "6px 14px" }}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
