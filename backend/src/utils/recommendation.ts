/**
 * Career Recommendation Engine
 *
 * Uses career weights stored in the DB to score careers against a
 * student's behavioral indicators.
 */

import type { SkillKey, SkillScores } from "../types/common";

export interface CareerWithWeights {
  id: string;
  slug: string;
  nameAr: string;
  descriptionAr: string;
  weights: Array<{ indicator: string; weight: number }>;
}

export interface RecommendationResult {
  careerId: string;
  slug: string;
  name: string;
  shortDescription: string;
  score: number;
  strengths: string[];
  reason: string;
}

export const SKILL_LABELS: Record<SkillKey, string> = {
  problemSolving: "حل المشكلات",
  analyticalThinking: "التفكير التحليلي",
  decisionMaking: "اتخاذ القرار",
  creativity: "الإبداع",
  communication: "التواصل",
  leadership: "القيادة",
  persistence: "المثابرة",
  timeManagement: "إدارة الوقت",
};

export function getCompatibilityTier(score: number): string {
  if (score >= 85) return "تطابق مرتفع جدًا";
  if (score >= 70) return "تطابق مرتفع";
  if (score >= 55) return "تطابق متوسط";
  return "تطابق مبدئي";
}

export function calculateCareerMatch(
  scores: SkillScores,
  weights: Array<{ indicator: string; weight: number }>
): { score: number; compatibilityTier: string } {
  if (!weights || weights.length === 0) {
    return { score: 70, compatibilityTier: getCompatibilityTier(70) };
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const w of weights) {
    const key = w.indicator as SkillKey;
    const studentVal = scores[key] ?? 70;
    weightedSum += studentVal * w.weight;
    totalWeight += w.weight;
  }

  const score = Math.round(totalWeight > 0 ? weightedSum / totalWeight : 70);
  return {
    score,
    compatibilityTier: getCompatibilityTier(score),
  };
}

/**
 * Compute compatibility scores for all careers against student indicators.
 * Returns the list sorted by descending score.
 */
export function computeCompatibility(
  careers: CareerWithWeights[],
  indicators: SkillScores
): RecommendationResult[] {
  return careers
    .map((career) => {
      const entries = career.weights.map((w) => ({
        key: w.indicator as SkillKey,
        weight: w.weight,
      }));

      const totalWeight = entries.reduce((s, e) => s + e.weight, 0) || 1;
      const score =
        entries.reduce((s, e) => s + (indicators[e.key] ?? 60) * e.weight, 0) /
        totalWeight;

      // Top 3 indicators by weight = strengths
      const sortedByWeight = [...entries].sort((a, b) => b.weight - a.weight);
      const strengths = sortedByWeight
        .slice(0, 3)
        .map((e) => SKILL_LABELS[e.key] || e.key);

      return {
        careerId: career.id,
        slug: career.slug,
        name: career.nameAr,
        shortDescription: career.descriptionAr,
        score: Math.round(score),
        strengths,
        reason: `تم ترشيح ${career.nameAr} لك بسبب أدائك المرتفع في ${strengths.join("، ")} أثناء المحاكاة والتقييم المبدئي.`,
      };
    })
    .sort((a, b) => b.score - a.score);
}
