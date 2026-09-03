import * as turf from '@turf/turf';
import { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';
import { ExistingTpsPoint } from '@/types';

export interface CoverageCalculationResult {
  bufferFeatures: FeatureCollection<Polygon | MultiPolygon>;
  unionBuffer: Feature<Polygon | MultiPolygon> | null;
  servedTpsCount: number;
}

/**
 * Generates service coverage buffer polygons around existing TPS locations
 * @param tpsPoints Array of active TPS locations
 * @param radiusMeters Radius in meters (e.g. 1000m = 1.0 km)
 */
export function calculateTpsServiceCoverage(
  tpsPoints: ExistingTpsPoint[],
  radiusMeters: number
): CoverageCalculationResult {
  if (!tpsPoints || tpsPoints.length === 0) {
    return {
      bufferFeatures: turf.featureCollection([]),
      unionBuffer: null,
      servedTpsCount: 0,
    };
  }

  const radiusKm = radiusMeters / 1000;
  const buffers: Feature<Polygon | MultiPolygon>[] = [];

  tpsPoints.forEach((tps) => {
    try {
      const pt = turf.point([tps.lng, tps.lat], {
        id: tps.id,
        name: tps.name,
        radiusM: radiusMeters,
        capacityM3: tps.capacityM3 || 6,
      });
      const buf = turf.buffer(pt, radiusKm, { units: 'kilometers', steps: 32 });
      if (buf) {
        buffers.push(buf);
      }
    } catch (e) {
      console.warn(`Gagal membuat buffer untuk TPS ${tps.name}:`, e);
    }
  });

  if (buffers.length === 0) {
    return {
      bufferFeatures: turf.featureCollection([]),
      unionBuffer: null,
      servedTpsCount: 0,
    };
  }

  // Combine into unified coverage boundary if possible
  let unionBuffer: Feature<Polygon | MultiPolygon> | null = null;
  try {
    if (buffers.length === 1) {
      unionBuffer = buffers[0];
    } else {
      let combined = buffers[0];
      for (let i = 1; i < buffers.length; i++) {
        const res = turf.union(turf.featureCollection([combined, buffers[i]]));
        if (res) combined = res;
      }
      unionBuffer = combined;
    }
  } catch (e) {
    // If union fails, fallback to first buffer
    unionBuffer = buffers[0];
  }

  return {
    bufferFeatures: turf.featureCollection(buffers),
    unionBuffer,
    servedTpsCount: tpsPoints.length,
  };
}

/**
 * Tests whether a point coordinate [lng, lat] is covered by the TPS buffer
 */
export function isPointCovered(
  pointLngLat: [number, number],
  coverageUnion: Feature<Polygon | MultiPolygon> | null
): boolean {
  if (!coverageUnion) return false;
  try {
    const pt = turf.point(pointLngLat);
    return turf.booleanPointInPolygon(pt, coverageUnion);
  } catch {
    return false;
  }
}
