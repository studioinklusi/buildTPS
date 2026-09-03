'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import * as turf from '@turf/turf';
import { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import {
  WeightConfig,
  ThresholdConfig,
  ForecastingConfig,
  FilterConfig,
  ExistingTpsPoint,
  AnalysisSummaryMetrics,
  SuitabilityFeatureCollection,
  SuitabilityProperties,
  SuitabilityCategory,
} from '@/types';
import {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  DEFAULT_FORECASTING,
  BASELINE_YEAR,
} from '@/lib/constants';
import { runPopulationForecast } from '@/engine/forecasting';
import { evaluateHardConstraints } from '@/engine/constraint';
import {
  normalizePopulationScore,
  normalizeAccessibilityScore,
  normalizeSlopeScore,
  normalizeSpatialPlanningScore,
  normalizeLandslideScore,
  normalizeFloodScore,
  normalizeSensitiveDistanceScore,
} from '@/engine/normalize';
import { calculateWlcScore } from '@/engine/scoring';
import { calculateTpsServiceCoverage } from '@/engine/coverage';
import { evaluateServiceGap, SettlementUnit } from '@/engine/gap';

export function useAnalysis() {
  // Config States
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHTS);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const [forecasting, setForecasting] = useState<ForecastingConfig>(DEFAULT_FORECASTING);
  const [filter, setFilter] = useState<FilterConfig>({ kecamatan: null, desa: null });

  // Data States
  const [desaGeo, setDesaGeo] = useState<any | null>(null);
  const [kecamatanGeo, setKecamatanGeo] = useState<any | null>(null);
  const [populationTimeseries, setPopulationTimeseries] = useState<any | null>(null);
  const [existingTps, setExistingTps] = useState<ExistingTpsPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load baseline datasets on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [resDesa, resKec, resPop, resTps] = await Promise.all([
          fetch('/data/administrasi_desa.geojson').then((r) => r.json()),
          fetch('/data/administrasi_kecamatan.geojson').then((r) => r.json()),
          fetch('/data/population_timeseries.json').then((r) => r.json()),
          fetch('/data/template_tps_eksisting.geojson')
            .then((r) => r.json())
            .catch(() => null),
        ]);

        setDesaGeo(resDesa);
        setKecamatanGeo(resKec);
        setPopulationTimeseries(resPop);

        // Load initial TPS sample if available
        if (resTps && resTps.features) {
          const samplePoints: ExistingTpsPoint[] = resTps.features.map(
            (f: any, i: number) => ({
              id: `tps-init-${i + 1}`,
              name: f.properties?.nama || f.properties?.name || `TPS ${i + 1}`,
              kecamatan: f.properties?.kecamatan || '',
              desa: f.properties?.desa || '',
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
              capacityM3: f.properties?.kapasitas || 6,
              type: f.properties?.tipe || 'TPS Eksisting',
              status: 'Aktif',
            })
          );
          setExistingTps(samplePoints);
        }
      } catch (err) {
        console.error('Gagal memuat dataset dasar:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Update Weight Helper with Auto-Normalize to 100%
  const updateWeight = useCallback((key: keyof WeightConfig, val: number) => {
    setWeights((prev) => {
      const keys = Object.keys(prev) as (keyof WeightConfig)[];
      const otherKeys = keys.filter((k) => k !== key);
      const remainingTarget = 100 - val;
      const currentOtherSum = otherKeys.reduce((sum, k) => sum + prev[k], 0);

      const next = { ...prev, [key]: val };
      if (currentOtherSum > 0) {
        otherKeys.forEach((k) => {
          next[k] = Math.max(
            1,
            Math.round((prev[k] / currentOtherSum) * remainingTarget)
          );
        });
      }
      return next;
    });
  }, []);

  // List of unique Kecamatans
  const kecamatanList = useMemo(() => {
    if (!kecamatanGeo?.features) return [];
    return kecamatanGeo.features
      .map((f: any) => f.properties?.KECAMATAN)
      .filter(Boolean)
      .sort();
  }, [kecamatanGeo]);

  // List of Desas based on selected Kecamatan
  const desaList = useMemo(() => {
    if (!desaGeo?.features) return [];
    let feats = desaGeo.features;
    if (filter.kecamatan) {
      feats = feats.filter(
        (f: any) =>
          f.properties?.KECAMATAN?.toUpperCase() === filter.kecamatan?.toUpperCase()
      );
    }
    return feats
      .map((f: any) => f.properties?.DESA)
      .filter(Boolean)
      .sort();
  }, [desaGeo, filter.kecamatan]);

  // Master Spatial Intelligence Engine Run
  const analysisResult = useMemo(() => {
    if (!desaGeo?.features || !populationTimeseries) {
      return {
        suitabilityFeatures: turf.featureCollection([]) as SuitabilityFeatureCollection,
        coverageResult: {
          bufferFeatures: turf.featureCollection([]),
          unionBuffer: null,
          servedTpsCount: 0,
        },
        gapResult: {
          gapFeatures: turf.featureCollection([]),
          summary: {
            totalSettlements: 0,
            unservedSettlementsCount: 0,
            servedSettlementsCount: 0,
            totalPopulation: 0,
            servedPopulation: 0,
            unservedPopulation: 0,
            servedPercent: 0,
            unservedPercent: 100,
            unservedWasteDailyM3: 0,
          },
        },
        metrics: {
          totalExistingTps: 0,
          totalPopulationBase: 0,
          totalPopulationProjected: 0,
          totalWasteDailyM3: 0,
          servedPopulation: 0,
          servedPopulationPercent: 0,
          gapPopulation: 0,
          gapPopulationPercent: 100,
          highlySuitableAreaHa: 0,
          suitableAreaHa: 0,
          constrainedAreaHa: 0,
          planningHorizonYear: BASELINE_YEAR,
        } as AnalysisSummaryMetrics,
      };
    }

    const { planningHorizonYears, wastePerCapitaLiter } = forecasting;
    const targetYear = BASELINE_YEAR + planningHorizonYears;

    // Filter features if kecamatan/desa selected
    let targetFeatures = desaGeo.features;
    if (filter.kecamatan) {
      targetFeatures = targetFeatures.filter(
        (f: any) =>
          f.properties?.KECAMATAN?.toUpperCase() === filter.kecamatan?.toUpperCase()
      );
    }
    if (filter.desa) {
      targetFeatures = targetFeatures.filter(
        (f: any) =>
          f.properties?.DESA?.toUpperCase() === filter.desa?.toUpperCase()
      );
    }

    // 1. Calculate Coverage from TPS points
    const coverageResult = calculateTpsServiceCoverage(
      existingTps,
      thresholds.serviceRadius
    );

    // 2. Prepare settlement units and suitability scoring for each desa
    const suitabilityFeaturesList: any[] = [];
    const settlementUnits: SettlementUnit[] = [];

    let totalBasePop = 0;
    let totalProjectedPop = 0;
    let totalWasteM3 = 0;
    let highlySuitableHa = 0;
    let suitableHa = 0;
    let constrainedHa = 0;

    targetFeatures.forEach((feat: any, idx: number) => {
      const p = feat.properties || {};
      const desaName = p.DESA || p.NAMA_STANDAR || `Desa ${idx + 1}`;
      const kecName = p.KECAMATAN || 'Banjarnegara';

      // Population & Growth rate
      const kecMeta = populationTimeseries.kecamatan?.[kecName];
      const annualRate =
        kecMeta?.annual_growth_rate ||
        populationTimeseries.metadata?.kabupaten_annual_growth_rate ||
        0.00722;

      // Village population fallback
      const villageMeta = kecMeta?.villages?.find(
        (v: any) => v.name?.toUpperCase() === desaName?.toUpperCase()
      );
      const basePop = villageMeta?.population_2026 || 3800; // average desa size in Banjarnegara

      const forecast = runPopulationForecast(
        basePop,
        annualRate,
        planningHorizonYears,
        wastePerCapitaLiter
      );

      totalBasePop += basePop;
      totalProjectedPop += forecast.pt;
      totalWasteM3 += forecast.wasteGenerationDailyM3;

      // Spatial centroid
      const centroid = turf.centroid(feat);
      const [cLng, cLat] = centroid.geometry.coordinates;

      // Simulated physical attributes based on topography & region characteristics
      // (Uses real spatial proxies for slope and distance)
      const latOffset = Math.abs(cLat - (-7.35));
      const lngOffset = Math.abs(cLng - 109.65);
      
      // Northern Banjarnegara (Dieng/Batur/Wanayasa) has higher slope and landslide risk
      const isNorthernHighland = cLat > -7.30;
      const slopeSimulated = isNorthernHighland ? 18 + latOffset * 120 : 4 + latOffset * 25;
      const nearestRoadDistance = 80 + (latOffset + lngOffset) * 2000;
      const riverDist = 120 + Math.sin(idx) * 80;
      const waterDist = 450 + Math.cos(idx) * 200;
      
      const rtrwStatus = isNorthernHighland && slopeSimulated > 40 ? 'Kawasan Lindung' : 'Kawasan Permukiman';
      const landslideRisk = isNorthernHighland ? (slopeSimulated > 25 ? 'Tinggi' : 'Sedang') : 'Rendah';
      const floodRisk = !isNorthernHighland && cLat < -7.42 ? 'Sedang' : 'Rendah';

      // Area in Hectares
      const areaM2 = turf.area(feat);
      const areaHa = Math.round((areaM2 / 10000) * 10) / 10;

      // Settlement unit for gap analysis
      settlementUnits.push({
        id: `desa-${idx + 1}`,
        name: desaName,
        kecamatan: kecName,
        centroid: [cLng, cLat],
        populationBase: basePop,
        populationProjected: forecast.pt,
        wasteGenerationDailyM3: forecast.wasteGenerationDailyM3,
        geometry: feat.geometry,
      });

      // Constraint check
      const constraint = evaluateHardConstraints(
        slopeSimulated,
        rtrwStatus,
        riverDist,
        waterDist,
        thresholds
      );

      // Criteria scores (0 - 100)
      const scorePop = normalizePopulationScore(forecast.pt);
      const scoreAcc = normalizeAccessibilityScore(nearestRoadDistance, thresholds.maxRoadDistance);
      const scoreSlope = normalizeSlopeScore(slopeSimulated);
      const scorePlan = normalizeSpatialPlanningScore(rtrwStatus);
      const scoreLand = normalizeLandslideScore(landslideRisk);
      const scoreFlood = normalizeFloodScore(floodRisk);
      const scoreSens = normalizeSensitiveDistanceScore(Math.min(riverDist, waterDist));

      // Final WLC calculation
      const wlc = calculateWlcScore(
        {
          scorePopulation: scorePop,
          scoreAccessibility: scoreAcc,
          scoreSlope: scoreSlope,
          scoreSpatialPlanning: scorePlan,
          scoreLandslide: scoreLand,
          scoreFlood: scoreFlood,
          scoreSensitiveDistance: scoreSens,
        },
        weights,
        constraint.isConstrained
      );

      if (wlc.category === 'Sangat Sesuai') highlySuitableHa += areaHa;
      else if (wlc.category === 'Sesuai') suitableHa += areaHa;
      else if (constraint.isConstrained) constrainedHa += areaHa;

      const suitabilityProps: SuitabilityProperties = {
        id: `suitability-${idx + 1}`,
        name: desaName,
        kecamatan: kecName,
        desa: desaName,
        score: wlc.finalScore,
        category: wlc.category,
        isConstrained: constraint.isConstrained,
        constraintReasons: constraint.reasons,
        scorePopulation: scorePop,
        scoreAccessibility: scoreAcc,
        scoreSlope: scoreSlope,
        scoreSpatialPlanning: scorePlan,
        scoreLandslide: scoreLand,
        scoreFlood: scoreFlood,
        scoreSensitiveDistance: scoreSens,
        populationBase: basePop,
        populationProjected: forecast.pt,
        wasteGenerationDailyM3: Math.round(forecast.wasteGenerationDailyM3 * 10) / 10,
        nearestRoadDistanceM: Math.round(nearestRoadDistance),
        slopePercent: Math.round(slopeSimulated * 10) / 10,
        slopeCategory: slopeSimulated <= 8 ? 'Datar (0-8%)' : slopeSimulated <= 15 ? 'Landai (8-15%)' : slopeSimulated <= 25 ? 'Agak Curam (15-25%)' : 'Curam (25-40%)',
        spatialPlanningStatus: rtrwStatus,
        landslideRiskLevel: landslideRisk,
        floodRiskLevel: floodRisk,
        areaHa,
      };

      suitabilityFeaturesList.push(turf.feature(feat.geometry, suitabilityProps));
    });

    // 3. Evaluate Service Gap
    const gapResult = evaluateServiceGap(settlementUnits, coverageResult.unionBuffer);

    const metrics: AnalysisSummaryMetrics = {
      totalExistingTps: existingTps.length,
      totalPopulationBase: totalBasePop,
      totalPopulationProjected: totalProjectedPop,
      totalWasteDailyM3: Math.round(totalWasteM3 * 10) / 10,
      servedPopulation: gapResult.summary.servedPopulation,
      servedPopulationPercent: gapResult.summary.servedPercent,
      gapPopulation: gapResult.summary.unservedPopulation,
      gapPopulationPercent: gapResult.summary.unservedPercent,
      highlySuitableAreaHa: Math.round(highlySuitableHa),
      suitableAreaHa: Math.round(suitableHa),
      constrainedAreaHa: Math.round(constrainedHa),
      planningHorizonYear: targetYear,
    };

    return {
      suitabilityFeatures: turf.featureCollection(suitabilityFeaturesList) as SuitabilityFeatureCollection,
      coverageResult,
      gapResult,
      metrics,
    };
  }, [
    desaGeo,
    populationTimeseries,
    existingTps,
    weights,
    thresholds,
    forecasting,
    filter,
  ]);

  return {
    isLoading,
    weights,
    setWeights,
    updateWeight,
    thresholds,
    setThresholds,
    forecasting,
    setForecasting,
    filter,
    setFilter,
    existingTps,
    setExistingTps,
    kecamatanList,
    desaList,
    analysisResult,
  };
}
