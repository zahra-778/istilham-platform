export type SkillKey =
  | "problemSolving"
  | "analyticalThinking"
  | "decisionMaking"
  | "creativity"
  | "communication"
  | "leadership"
  | "persistence"
  | "timeManagement";

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

export type SkillScores = Partial<Record<SkillKey, number>>;

export interface Student {
  id: string;
  name: string;
  email: string;
  stage: string;
  city: string;
  joinedAt: string;
  assessmentProgress: number;
  completedSimulations: number;
  profileCompletion: number;
  skills: Record<SkillKey, number>;
}

export interface Career {
  id: string;
  name: string;
  shortDescription: string;
  about: string;
  icon: string;
  requiredSkills: string[];
  traits: string[];
  jobs: string[];
  growthSkills: string[];
  nextSteps: string[];
  weights: SkillScores;
}

export interface AssessmentQuestion {
  id: string;
  skill: SkillKey;
  section: string;
  text: string;
  options: { id: string; text: string; value: number }[];
}

export interface SimulationChallenge {
  id: string;
  situation: string;
  question: string;
  options: { id: string; text: string; quality: number }[];
  hint: string;
}

export interface Simulation {
  id: string;
  careerId: string;
  title: string;
  description: string;
  difficulty: "مبتدئ" | "متوسط" | "متقدم";
  duration: string;
  intro: string;
  progress: number;
  challenges: SimulationChallenge[];
}

export interface BehaviorEvent {
  challengeId: string;
  optionId: string;
  responseSeconds: number;
  attempts: number;
  changedDecision: boolean;
  usedHint: boolean;
  correct: boolean;
}

export interface SimulationResult {
  simulationId: string;
  careerId: string;
  completedAt: string;
  indicators: Record<SkillKey, number>;
  summary: string;
  totalTimeMinutes: number;
  correctAnswers: number;
  totalChallenges: number;
  events: BehaviorEvent[];
}

export interface Recommendation {
  careerId: string;
  name: string;
  score: number;
  shortDescription: string;
  strengths: string[];
  reason: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  date: string;
  type: "simulation" | "assessment" | "recommendation";
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
}
