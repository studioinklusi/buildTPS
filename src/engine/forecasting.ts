/**
 * Forecasting Engine for Population and Waste Generation
 * Based on geometric growth model: P_t = P_0 * (1 + r)^t
 * Waste generation model: Q_t = P_t * q (SNI 19-3983-1995)
 */

export interface PopulationForecastResult {
  p0: number;
  pt: number;
  years: number;
  annualRate: number;
  wasteGenerationDailyM3: number;
  wasteGenerationDailyLiter: number;
  growthDelta: number;
}

/**
 * Calculates projected population using geometric growth model
 * @param p0 Baseline population (e.g. year 2026)
 * @param annualRate Annual growth rate (e.g. 0.00722 for 0.722%)
 * @param years Planning horizon in years (0 to 5)
 */
export function calculateProjectedPopulation(
  p0: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0 || !p0) return Math.round(p0);
  const pt = p0 * Math.pow(1 + annualRate, years);
  return Math.round(pt);
}

/**
 * Calculates estimated daily waste generation based on SNI 19-3983-1995
 * @param population Population count (jiwa)
 * @param wastePerCapitaLiter Daily waste per capita in liters (default: 2.5 L/capita/day)
 * @returns Waste in cubic meters (m³/hari)
 */
export function calculateWasteGenerationDailyM3(
  population: number,
  wastePerCapitaLiter: number = 2.5
): number {
  const totalLiters = population * wastePerCapitaLiter;
  // 1 m³ = 1000 Liters
  return totalLiters / 1000;
}

/**
 * Full forecast calculation for an area (desa/kecamatan/kabupaten)
 */
export function runPopulationForecast(
  p0: number,
  annualRate: number,
  years: number,
  wastePerCapitaLiter: number = 2.5
): PopulationForecastResult {
  const pt = calculateProjectedPopulation(p0, annualRate, years);
  const wasteM3 = calculateWasteGenerationDailyM3(pt, wastePerCapitaLiter);
  const wasteLiter = pt * wastePerCapitaLiter;

  return {
    p0,
    pt,
    years,
    annualRate,
    wasteGenerationDailyM3: wasteM3,
    wasteGenerationDailyLiter: wasteLiter,
    growthDelta: pt - p0,
  };
}
