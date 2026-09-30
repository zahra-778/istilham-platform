import axios from "axios";
import { env } from "../config/env";

export interface IndicatorDefinition {
  indicator_id: string;
  name: string;
  name_ar?: string;
  calculation_type:
    | "manual"
    | "accuracy"
    | "persistence"
    | "response_time"
    | "creative_action"
    | "communication"
    | "leadership";
  config?: Record<string, any>;
}

export interface BehaviorEventItem {
  responseSeconds: number;
  attempts: number;
  correct: boolean;
  changedDecision: boolean;
  usedHint: boolean;
  creativeAction?: boolean;
  requestedTeamHelp?: boolean;
  explainedDecision?: boolean;
  leadershipAction?: boolean;
  expectedResponseTime?: number;
  simulation_id?: string;
  challenge_type?: string;
  metadata?: Record<string, any>;
}

export interface CareerProfileItem {
  career_id: string;
  career_name: string;
  weights: Record<string, number>;
}

export interface AnalyzeStudentPayload {
  student_id: string;
  indicators?: IndicatorDefinition[];
  assessmentScores: Record<string, number>;
  behaviorEvents: BehaviorEventItem[];
  careerProfiles: CareerProfileItem[];
}

export interface AiRecommendationItem {
  career_id: string;
  career_name: string;
  score: number;
  dataCoverage?: number;
  evidenceQuality?: string;
  strengths?: string[];
  developmentAreas?: string[];
}

export interface AiAnalysisResult {
  student_id: string;
  behavioral_profile: Record<string, number | null>;
  simulation_analysis: Record<string, number | null>;
  strengths: Array<{ indicator: string; name: string; score: number }>;
  recommendations: AiRecommendationItem[];
  confidence: number;
  data_quality?: {
    availableIndicators?: number;
    totalIndicators?: number;
    indicatorCoverage?: number;
    behaviorEvents?: number;
    careersAnalyzed?: number;
  };
}

export const DEFAULT_AI_INDICATORS: IndicatorDefinition[] = [
  {
    indicator_id: "problemSolving",
    name: "Problem Solving",
    name_ar: "حل المشكلات",
    calculation_type: "accuracy",
    config: {},
  },
  {
    indicator_id: "analyticalThinking",
    name: "Analytical Thinking",
    name_ar: "التفكير التحليلي",
    calculation_type: "accuracy",
    config: {},
  },
  {
    indicator_id: "decisionMaking",
    name: "Decision Making",
    name_ar: "اتخاذ القرار",
    calculation_type: "response_time",
    config: {},
  },
  {
    indicator_id: "creativity",
    name: "Creativity",
    name_ar: "الإبداع",
    calculation_type: "creative_action",
    config: {},
  },
  {
    indicator_id: "communication",
    name: "Communication",
    name_ar: "التواصل",
    calculation_type: "communication",
    config: {},
  },
  {
    indicator_id: "leadership",
    name: "Leadership",
    name_ar: "القيادة",
    calculation_type: "leadership",
    config: {},
  },
  {
    indicator_id: "persistence",
    name: "Persistence",
    name_ar: "المثابرة",
    calculation_type: "persistence",
    config: {},
  },
  {
    indicator_id: "timeManagement",
    name: "Time Management",
    name_ar: "إدارة الوقت",
    calculation_type: "response_time",
    config: {},
  },
];

/**
 * Normalizes career indicator weights so they sum to exactly 1.0
 */
export function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, val]) => sum + (val || 0), 0);
  if (total <= 0) return weights;

  const normalized: Record<string, number> = {};
  for (const [key, val] of entries) {
    normalized[key] = parseFloat((val / total).toFixed(4));
  }
  return normalized;
}

export class AiService {
  private getBaseUrl(): string | null {
    const url = env.ISTILHAM_AI_URL || process.env.ISTILHAM_AI_URL;
    if (!url || !url.trim()) return null;
    return url.replace(/\/+$/, "");
  }

  isConfigured(): boolean {
    return this.getBaseUrl() !== null;
  }

  async checkAiHealth(): Promise<{ status: string; url: string; data?: any }> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) {
      return { status: "unconfigured", url: "" };
    }

    try {
      const res = await axios.get(`${baseUrl}/health`, {
        timeout: 10000,
      });
      return { status: "healthy", url: baseUrl, data: res.data };
    } catch (err: any) {
      return {
        status: "unreachable",
        url: baseUrl,
        data: err.response?.data || err.message,
      };
    }
  }

  async analyzeStudent(payload: AnalyzeStudentPayload): Promise<AiAnalysisResult> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) {
      throw new Error("ISTILHAM_AI_URL is not configured.");
    }

    // Ensure weights sum to 1.0 for all career profiles
    const formattedCareerProfiles = payload.careerProfiles.map((cp) => ({
      career_id: cp.career_id,
      career_name: cp.career_name,
      weights: normalizeWeights(cp.weights),
    }));

    const requestBody = {
      student_id: payload.student_id,
      indicators: payload.indicators || DEFAULT_AI_INDICATORS,
      assessment_scores: { scores: payload.assessmentScores },
      behavior_events: payload.behaviorEvents,
      career_profiles: formattedCareerProfiles,
    };

    try {
      const res = await axios.post(`${baseUrl}/analyze`, requestBody, {
        headers: { "Content-Type": "application/json" },
        timeout: 120000, // 2 minutes timeout for complex AI analysis
      });

      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return res.data;
    } catch (err: any) {
      if (err.response) {
        const message = err.response.data?.detail || err.response.data?.message || "AI service returned an error";
        throw new Error(`AI Service Error (${err.response.status}): ${message}`);
      }
      if (err.code === "ECONNABORTED") {
        throw new Error("AI service request timed out after 120 seconds.");
      }
      throw new Error(`Could not reach AI service at ${baseUrl}. Please check the Cloudflare Tunnel URL.`);
    }
  }
}

export const aiService = new AiService();
