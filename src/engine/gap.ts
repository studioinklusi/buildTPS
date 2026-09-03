import * as turf from '@turf/turf';
import { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';
import { isPointCovered } from './coverage';

export interface GapSummary {
  totalSettlements: number;
  unservedSettlementsCount: number;
  servedSettlementsCount: number;
  totalPopulation: number;
  servedPopulation: number;
  unservedPopulation: number;
  servedPercent: number;
  unservedPercent: number;
  unservedWasteDailyM3: number;
}

export interface SettlementUnit {
  id: string;
  name: string;
  kecamatan: string;
  centroid: [number, number]; // [lng, lat]
  populationBase: number;
  populationProjected: number;
  wasteGenerationDailyM3: number;
  geometry: Polygon | MultiPolygon;
}

/**
 * Calculates service gap by evaluating which settlement units are outside the coverage zone
 */
export function evaluateServiceGap(
  settlements: SettlementUnit[],
  coverageUnion: Feature<Polygon | MultiPolygon> | null
): {
  gapFeatures: FeatureCollection<Polygon | MultiPolygon>;
  summary: GapSummary;
} {
  const gapPolygons: Feature<Polygon | MultiPolygon>[] = [];

  let totalPop = 0;
  let servedPop = 0;
  let unservedPop = 0;
  let unservedWasteM3 = 0;
  let servedCount = 0;
  let unservedCount = 0;

  settlements.forEach((s) => {
    totalPop += s.populationProjected;
    const covered = isPointCovered(s.centroid, coverageUnion);

    if (covered) {
      servedCount++;
      servedPop += s.populationProjected;
    } else {
      unservedCount++;
      unservedPop += s.populationProjected;
      unservedWasteM3 += s.wasteGenerationDailyM3;

      // Add to gap feature collection
      gapPolygons.push(
        turf.feature(s.geometry, {
          id: s.id,
          name: s.name,
          kecamatan: s.kecamatan,
          population: s.populationProjected,
          wasteDailyM3: s.wasteGenerationDailyM3,
          status: 'Belum Terlayani TPS (Service Gap)',
        })
      );
    }
  });

  const total = settlements.length || 1;
  const servedPercent = totalPop > 0 ? (servedPop / totalPop) * 100 : 0;
  const unservedPercent = totalPop > 0 ? (unservedPop / totalPop) * 100 : 100;

  return {
    gapFeatures: turf.featureCollection(gapPolygons),
    summary: {
      totalSettlements: settlements.length,
      unservedSettlementsCount: unservedCount,
      servedSettlementsCount: servedCount,
      totalPopulation: totalPop,
      servedPopulation: servedPop,
      unservedPopulation: unservedPop,
      servedPercent: Math.round(servedPercent * 10) / 10,
      unservedPercent: Math.round(unservedPercent * 10) / 10,
      unservedWasteDailyM3: Math.round(unservedWasteM3 * 10) / 10,
    },
  };
}
