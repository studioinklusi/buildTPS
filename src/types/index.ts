import { Feature, FeatureCollection, Geometry, Polygon, MultiPolygon, Point, LineString } from 'geojson';

// --- Configuration Types ---

export interface WeightConfig {
  population: number;       // default: 25%
  accessibility: number;    // default: 20%
  slope: number;            // default: 15%
  spatialPlanning: number;  // default: 15%
  landslideRisk: number;    // default: 15%
  floodRisk: number;        // default: 5%
  sensitiveDistance: number;// default: 5%
}

export interface ThresholdConfig {
  riverBuffer: number;      // default: 50 meters (hard constraint)
  waterbodyBuffer: number;  // default: 100 meters (hard constraint)
  maxRoadDistance: number;  // default: 1000 meters
  maxSlopePercent: number;  // default: 40% (hard constraint)
  serviceRadius: number;    // default: 1000 meters (1.0 km)
}

export interface ForecastingConfig {
  planningHorizonYears: number; // 0, 1, 2, 3, 4, 5 years
  wastePerCapitaLiter: number;  // default: 2.5 L/day (SNI 19-3983-1995)
  customAnnualGrowthRate?: number; // fallback: from DKB timeseries (e.g. 0.0072 = 0.72%)
}

export interface FilterConfig {
  kecamatan: string | null; // null = all kecamatan
  desa: string | null;      // null = all desa
}

// --- Suitability Types ---

export type SuitabilityCategory = 
  | 'Sangat Sesuai'
  | 'Sesuai'
  | 'Cukup Sesuai'
  | 'Kurang Sesuai'
  | 'Tidak Sesuai (Constraint)';

export interface SuitabilityProperties {
  id: string;
  name: string;
  kecamatan: string;
  desa: string;
  score: number;            // 0 - 100
  category: SuitabilityCategory;
  isConstrained: boolean;
  constraintReasons: string[];
  
  // Criteria scores (0 - 100)
  scorePopulation: number;
  scoreAccessibility: number;
  scoreSlope: number;
  scoreSpatialPlanning: number;
  scoreLandslide: number;
  scoreFlood: number;
  scoreSensitiveDistance: number;
  
  // Raw physical & demographic attributes
  populationBase: number;
  populationProjected: number;
  wasteGenerationDailyM3: number;
  nearestRoadDistanceM: number;
  slopePercent: number;
  slopeCategory: string;
  spatialPlanningStatus: string;
  landslideRiskLevel: string;
  floodRiskLevel: string;
  
  areaHa: number;
}

export type SuitabilityFeature = Feature<Polygon | MultiPolygon, SuitabilityProperties>;
export type SuitabilityFeatureCollection = FeatureCollection<Polygon | MultiPolygon, SuitabilityProperties>;

// --- Coverage & Gap Analysis Types ---

export interface ExistingTpsPoint {
  id: string;
  name: string;
  kecamatan?: string;
  desa?: string;
  lat: number;
  lng: number;
  capacityM3?: number;
  type?: string; // 'TPS 3R', 'Transfer Depo', 'Kontainer', etc.
  status?: string;
}

export interface AnalysisSummaryMetrics {
  totalExistingTps: number;
  totalPopulationBase: number;
  totalPopulationProjected: number;
  totalWasteDailyM3: number;
  
  servedPopulation: number;
  servedPopulationPercent: number;
  gapPopulation: number;
  gapPopulationPercent: number;
  
  highlySuitableAreaHa: number;
  suitableAreaHa: number;
  constrainedAreaHa: number;
  
  planningHorizonYear: number;
}

// --- Layer Visibility State ---

export interface LayerVisibilityState {
  // Administrative
  administrasiKecamatan: boolean;
  administrasiDesa: boolean;
  
  // Infrastructure
  tpsEksisting: boolean;
  jaringanJalan: boolean;
  
  // Environment & Topography
  sungai: boolean;
  badanAir: boolean;
  slope: boolean;
  
  // Spatial Planning & Disaster
  polaRuang: boolean;
  kelasBanjir: boolean;
  kelasLongsor: boolean;
  
  // Spatial Intelligence Results
  suitabilityOverlay: boolean;
  serviceCoverage: boolean;
  serviceGap: boolean;
}
