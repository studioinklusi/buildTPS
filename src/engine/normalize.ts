/**
 * Normalization functions for multi-criteria evaluation (0 - 100 scale).
 * Each function scales raw physical/spatial metrics into standardized utility scores.
 */

// 1. Population Score (Higher population/demand = Higher priority)
export function normalizePopulationScore(population: number, maxPopInRegency: number = 15000): number {
  if (population <= 0) return 10;
  // Linear scale with upper clamp
  const score = (population / maxPopInRegency) * 100;
  return Math.min(100, Math.max(10, Math.round(score)));
}

// 2. Accessibility Score (Closer to road = Higher score, ideal <= 200m, max 1000m)
export function normalizeAccessibilityScore(distanceToRoadM: number, maxDistanceM: number = 1000): number {
  if (distanceToRoadM <= 50) return 100; // Perfect access
  if (distanceToRoadM >= maxDistanceM) return 10; // Too far from road
  // Inverse linear score
  const score = 100 - ((distanceToRoadM - 50) / (maxDistanceM - 50)) * 90;
  return Math.round(Math.max(10, score));
}

// 3. Slope Score (Flat = 100, Steeper = lower)
export function normalizeSlopeScore(slopePercent: number): number {
  if (slopePercent <= 8) return 100;   // Datar (0 - 8%)
  if (slopePercent <= 15) return 80;   // Landai (8 - 15%)
  if (slopePercent <= 25) return 50;   // Agak Curam (15 - 25%)
  if (slopePercent <= 40) return 20;   // Curam (25 - 40%)
  return 0;                            // Sangat Curam (>40% - Eliminated)
}

// 4. Spatial Planning (RTRW) Score
export function normalizeSpatialPlanningScore(status: string): number {
  const clean = status.toLowerCase();
  if (
    clean.includes('lindung') ||
    clean.includes('konservasi') ||
    clean.includes('cagar') ||
    clean.includes('badan air') ||
    clean.includes('fosil')
  ) {
    return 0;
  }
  if (clean.includes('perkotaan')) return 100;
  if (clean.includes('permukiman')) return 95;
  if (clean.includes('perdagangan') || clean.includes('jasa')) return 90;
  if (clean.includes('industri')) return 80;
  if (clean.includes('tanaman pangan')) return 75;
  if (clean.includes('hortikultura')) return 70;
  if (clean.includes('perkebunan')) return 65;
  if (clean.includes('produksi terbatas')) return 55;
  if (clean.includes('produksi tetap')) return 50;
  return 60; // Default budidaya
}

// 5. Landslide Hazard Score (Lower hazard = Higher suitability for construction)
export function normalizeLandslideScore(level: string): number {
  const clean = level.toLowerCase();
  if (clean.includes('rendah')) return 100;
  if (clean.includes('sedang')) return 60;
  if (clean.includes('tinggi')) return 20;
  return 80; // default aman jika data tidak tercatat
}

// 6. Flood Hazard Score (Lower flood risk = Higher suitability)
export function normalizeFloodScore(level: string): number {
  const clean = level.toLowerCase();
  if (clean.includes('rendah')) return 100;
  if (clean.includes('sedang')) return 60;
  if (clean.includes('tinggi')) return 20;
  return 80; // default
}

// 7. Sensitive Environmental Distance Score (Farther from waterbody = safer)
export function normalizeSensitiveDistanceScore(distanceToWaterM: number): number {
  if (distanceToWaterM >= 200) return 100;
  if (distanceToWaterM >= 100) return 70;
  if (distanceToWaterM >= 50) return 40;
  return 0; // Violates buffer (<50m)
}
