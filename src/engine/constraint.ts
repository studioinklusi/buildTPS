import { ThresholdConfig } from '@/types';

export interface ConstraintEvaluation {
  isConstrained: boolean;
  reasons: string[];
}

/**
 * Evaluates whether a location/unit violates hard physical or regulatory constraints.
 * Any violation leads to immediate elimination (Skor = 0 / Tidak Layak).
 */
export function evaluateHardConstraints(
  slopePercent: number,
  spatialPlanningStatus: string,
  riverDistanceM: number,
  waterbodyDistanceM: number,
  thresholds: ThresholdConfig
): ConstraintEvaluation {
  const reasons: string[] = [];

  // Constraint 1: Kemiringan Lereng > maxSlopePercent (default: 40%)
  if (slopePercent > thresholds.maxSlopePercent) {
    reasons.push(`Kemiringan lereng (${slopePercent.toFixed(1)}%) melebihi ambang batas maksimal ${thresholds.maxSlopePercent}% (Rawan Longsor Parah)`);
  }

  // Constraint 2: Status Pola Ruang RTRW merupakan Kawasan Lindung
  const statusClean = spatialPlanningStatus.toLowerCase();
  if (statusClean.includes('lindung') || statusClean.includes('konservasi') || statusClean.includes('cagar')) {
    reasons.push(`Status RTRW (${spatialPlanningStatus}) merupakan Kawasan Lindung/Konservasi yang dilarang dialihfungsikan`);
  }

  // Constraint 3: Sempadan Sungai (< 50 meter)
  if (riverDistanceM < thresholds.riverBuffer) {
    reasons.push(`Berada di dalam sempadan sungai (${riverDistanceM.toFixed(0)}m < ${thresholds.riverBuffer}m buffer sempadan)`);
  }

  // Constraint 4: Sempadan Waduk / Badan Air (< 100 meter)
  if (waterbodyDistanceM < thresholds.waterbodyBuffer) {
    reasons.push(`Berada terlalu dekat dengan badan air/waduk (${waterbodyDistanceM.toFixed(0)}m < ${thresholds.waterbodyBuffer}m buffer)`);
  }

  return {
    isConstrained: reasons.length > 0,
    reasons,
  };
}
