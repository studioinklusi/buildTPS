import { WeightConfig, ThresholdConfig, ForecastingConfig, LayerVisibilityState } from '@/types';

// Kabupaten Banjarnegara Center & Bounding Box
export const BANJARNEGARA_CENTER: [number, number] = [109.65, -7.38];
export const BANJARNEGARA_DEFAULT_ZOOM = 10.2;
export const BANJARNEGARA_BBOX: [number, number, number, number] = [
  109.35, -7.55, 109.95, -7.15
];

// Baseline Year for Planning
export const BASELINE_YEAR = 2026;

// Default Criteria Weights (Sum = 100%)
export const DEFAULT_WEIGHTS: WeightConfig = {
  population: 25,
  accessibility: 20,
  slope: 15,
  spatialPlanning: 15,
  landslideRisk: 15,
  floodRisk: 5,
  sensitiveDistance: 5,
};

// Default Spatial Thresholds
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  riverBuffer: 50,         // meters (Sempadan Sungai - SNI 19-3983-1995)
  waterbodyBuffer: 100,    // meters (Danau/Waduk Mrica)
  maxRoadDistance: 1000,   // meters (Jarak ideal truk sampah)
  maxSlopePercent: 40,     // % (>40% dilarang untuk TPS)
  serviceRadius: 1000,     // meters (1.0 km buffer layanan TPS standar)
};

// Default Forecasting Parameters
export const DEFAULT_FORECASTING: ForecastingConfig = {
  planningHorizonYears: 0, // 0 = Baseline (2026)
  wastePerCapitaLiter: 2.5,// 2.5 liter/orang/hari (SNI 19-3983-1995 kab/kota sedang)
  customAnnualGrowthRate: 0.00722, // 0.722% rata-rata Kab. Banjarnegara
};

// Default Layer Visibility
export const DEFAULT_LAYER_VISIBILITY: LayerVisibilityState = {
  // Admin
  administrasiKecamatan: true,
  administrasiDesa: false,
  
  // Infrastructure
  tpsEksisting: true,
  jaringanJalan: false,
  
  // Environment
  sungai: false,
  badanAir: false,
  slope: false,
  
  // Planning & Hazard
  polaRuang: false,
  kelasBanjir: false,
  kelasLongsor: false,
  
  // Intelligence Overlays
  suitabilityOverlay: true,
  serviceCoverage: true,
  serviceGap: true,
};

// Basemap Tile Providers (all raster for maximum reliability)
export const BASEMAP_STYLES = {
  streets: {
    name: 'Peta Jalan (Streets)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    isRaster: true,
  },
  satellite: {
    name: 'Satelit ESRI',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    isRaster: true,
  },
  topo: {
    name: 'Topografi',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    isRaster: true,
  },
};
