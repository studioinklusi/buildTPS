import { WeightConfig, SuitabilityCategory } from '@/types';

export interface CriterionScoreInputs {
  scorePopulation: number;
  scoreAccessibility: number;
  scoreSlope: number;
  scoreSpatialPlanning: number;
  scoreLandslide: number;
  scoreFlood: number;
  scoreSensitiveDistance: number;
}

export interface WlcCalculationResult {
  finalScore: number;
  category: SuitabilityCategory;
  isConstrained: boolean;
}

/**
 * Categorizes a final 0 - 100 score into standard planning suitability classes
 */
export function categorizeScore(score: number, isConstrained: boolean): SuitabilityCategory {
  if (isConstrained || score < 20) {
    return 'Tidak Sesuai (Constraint)';
  }
  if (score >= 80) return 'Sangat Sesuai';
  if (score >= 60) return 'Sesuai';
  if (score >= 40) return 'Cukup Sesuai';
  return 'Kurang Sesuai';
}

/**
 * Calculates final suitability score using Weighted Linear Combination (WLC)
 * Formula: S = Sum( Score_i * Weight_i / 100 )
 */
export function calculateWlcScore(
  scores: CriterionScoreInputs,
  weights: WeightConfig,
  isConstrained: boolean
): WlcCalculationResult {
  if (isConstrained) {
    return {
      finalScore: 0,
      category: 'Tidak Sesuai (Constraint)',
      isConstrained: true,
    };
  }

  // Ensure weights sum to 100 (normalize if needed)
  const totalWeight =
    weights.population +
    weights.accessibility +
    weights.slope +
    weights.spatialPlanning +
    weights.landslideRisk +
    weights.floodRisk +
    weights.sensitiveDistance;

  const wPop = weights.population / (totalWeight || 1);
  const wAcc = weights.accessibility / (totalWeight || 1);
  const wSlope = weights.slope / (totalWeight || 1);
  const wPlan = weights.spatialPlanning / (totalWeight || 1);
  const wLand = weights.landslideRisk / (totalWeight || 1);
  const wFlood = weights.floodRisk / (totalWeight || 1);
  const wSens = weights.sensitiveDistance / (totalWeight || 1);

  const rawScore =
    scores.scorePopulation * wPop +
    scores.scoreAccessibility * wAcc +
    scores.scoreSlope * wSlope +
    scores.scoreSpatialPlanning * wPlan +
    scores.scoreLandslide * wLand +
    scores.scoreFlood * wFlood +
    scores.scoreSensitiveDistance * wSens;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const category = categorizeScore(finalScore, isConstrained);

  return {
    finalScore,
    category,
    isConstrained: false,
  };
}
