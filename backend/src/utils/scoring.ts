/**
 * Assessment Scoring Algorithm
 *
 * Mirrors the logic in the frontend mockAssessments.ts,
 * but runs server-side against real data from the database.
 *
 * Each question contributes a bonus/penalty based on:
 *   bonus = (option.value - 3) * 4
 * Applied to the skill that the question measures.
 */

import type { SkillKey, SkillScores } from "../types/common";

const SKILL_KEYS: SkillKey[] = [
  "problemSolving",
  "analyticalThinking",
  "decisionMaking",
  "creativity",
  "communication",
  "leadership",
  "persistence",
  "timeManagement",
];

const BASE_SCORES: SkillScores = {
  problemSolving: 74,
  analyticalThinking: 71,
  decisionMaking: 76,
  creativity: 68,
  communication: 72,
  leadership: 66,
  persistence: 78,
  timeManagement: 70,
};

function clamp(value: number, min = 35, max = 98): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export interface ScoredAnswer {
  skill: SkillKey;
  optionValue: number; // 1–5
}

/**
 * Compute assessment scores from an array of scored answers.
 */
export function computeAssessmentScores(answers: ScoredAnswer[]): SkillScores {
  const scores: SkillScores = { ...BASE_SCORES };

  for (const answer of answers) {
    const bonus = (answer.optionValue - 3) * 4;
    scores[answer.skill] = clamp(scores[answer.skill] + bonus);
  }

  return scores;
}

/**
 * Generate a summary text based on the computed scores.
 * (Later this can call the Python AI service for personalised summaries.)
 */
export function generateAssessmentSummary(scores: SkillScores): string {
  const top = SKILL_KEYS.reduce((best, key) =>
    scores[key] > scores[best] ? key : best
  );

  const summaryMap: Record<SkillKey, string> = {
    problemSolving:
      "أظهرت نتائج التقييم المبدئي ميلًا واضحًا نحو حل المشكلات والتفكير الإبداعي في مواجهة التحديات.",
    analyticalThinking:
      "أظهرت نتائج التقييم المبدئي قدرة تحليلية مرتفعة وميلًا نحو التفكير المنهجي والمدروس.",
    decisionMaking:
      "أظهرت نتائج التقييم المبدئي قدرة ممتازة على اتخاذ القرار المدروس حتى في ظل المعلومات الناقصة.",
    creativity:
      "أظهرت نتائج التقييم المبدئي مستوى إبداعيًا مرتفعًا وقدرة على توليد أفكار جديدة ومبتكرة.",
    communication:
      "أظهرت نتائج التقييم المبدئي مهارات تواصل متميزة وقدرة على إيصال الأفكار بوضوح.",
    leadership:
      "أظهرت نتائج التقييم المبدئي ميولًا قيادية واضحة وقدرة على توجيه الفريق وحل النزاعات.",
    persistence:
      "أظهرت نتائج التقييم المبدئي مستوى مثابرة مرتفعًا وقدرة على مواصلة العمل رغم الصعوبات.",
    timeManagement:
      "أظهرت نتائج التقييم المبدئي مهارة في إدارة الوقت وتنظيم المهام وفق الأولويات.",
  };

  return summaryMap[top];
}

// ─── Simulation Scoring ──────────────────────────────────────────────────────

export interface SimulationEvent {
  challengeId: string;
  optionId: string;
  quality: number;       // 1–5, from ChallengeOption
  responseSeconds: number;
  attempts: number;
  changedDecision: boolean;
  usedHint: boolean;
  correct: boolean;
}

export interface SimulationIndicators extends SkillScores {}

export interface SimulationScoringResult {
  indicators: SimulationIndicators;
  totalTimeMinutes: number;
  correctAnswers: number;
  totalChallenges: number;
  summary: string;
}

/**
 * Compute behavioral indicators from simulation events.
 * Mirrors the logic in mockSimulations.ts submit().
 *
 * This is the scoring layer that will later be delegated to the
 * Python/FastAPI AI service (just replace this function with an HTTP call).
 */
export function computeSimulationScores(events: SimulationEvent[]): SimulationScoringResult {
  const total = events.length || 1;
  const avgQuality = events.reduce((sum, e) => sum + e.quality, 0) / total;
  const avgTime = events.reduce((s, e) => s + e.responseSeconds, 0) / total;
  const changed = events.filter((e) => e.changedDecision).length;
  const hints = events.filter((e) => e.usedHint).length;
  const correct = events.filter((e) => e.correct).length;
  const totalAttempts = events.reduce((s, e) => s + e.attempts, 0);

  const qualityBase = 55 + avgQuality * 7;

  const indicators: SimulationIndicators = {
    problemSolving:   clamp(qualityBase + (hints === 0 ? 5 : -3)),
    analyticalThinking: clamp(qualityBase + (avgTime > 12 ? 4 : -2)),
    decisionMaking:   clamp(qualityBase + (changed <= 1 ? 6 : -4)),
    creativity:       clamp(qualityBase - 8 + Math.random() * 8),
    communication:    clamp(qualityBase - 5 + Math.random() * 8),
    leadership:       clamp(qualityBase - 9 + Math.random() * 10),
    persistence:      clamp(qualityBase + (totalAttempts > total ? 6 : 2)),
    timeManagement:   clamp(90 - avgTime * 1.6),
  };

  return {
    indicators,
    totalTimeMinutes: Math.max(3, Math.round((avgTime * total) / 60)),
    correctAnswers: correct,
    totalChallenges: total,
    summary:
      "أظهرت أداءً قويًا في اتخاذ القرار وحل المشكلات، مع قدرة جيدة على التعامل مع التحديات والمواقف المختلفة، وميل إلى تحليل المعلومات قبل التصرف.",
  };
}

/**
 * Merge a new set of indicators with an existing behavioral profile.
 * Uses a weighted average: 70% existing + 30% new (recency bias).
 */
export function mergeIndicators(
  existing: SkillScores,
  fresh: SkillScores
): SkillScores {
  const merged = {} as SkillScores;
  for (const key of SKILL_KEYS) {
    const existingScore = existing[key] ?? 0;
    const freshScore = fresh[key] ?? 0;

    if (existingScore === 0) {
      merged[key] = freshScore;
    } else {
      merged[key] = Math.round(existingScore * 0.7 + freshScore * 0.3);
    }
  }
  return merged;
}
