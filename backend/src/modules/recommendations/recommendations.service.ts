import { RecommendationsRepository } from "./recommendations.repository";
import { calculateCareerMatch } from "../../utils/recommendation";
import { aiService, type BehaviorEventItem, type CareerProfileItem } from "../../services/ai.service";
import type { SkillKey, SkillScores } from "../../types/common";

const SKILL_NAMES_AR: Record<string, string> = {
  problemSolving: "حل المشكلات",
  analyticalThinking: "التفكير التحليلي",
  decisionMaking: "اتخاذ القرار",
  creativity: "الإبداع",
  communication: "التواصل",
  leadership: "القيادة",
  persistence: "المثابرة",
  timeManagement: "إدارة الوقت",
};

function formatSkillLabel(val: any): string {
  if (!val) return "";
  if (typeof val === "string") {
    return SKILL_NAMES_AR[val] || val;
  }
  if (typeof val === "object") {
    return val.name_ar || SKILL_NAMES_AR[val.indicator] || val.name || val.indicator || "";
  }
  return String(val);
}

export class RecommendationsService {
  private repo = new RecommendationsRepository();

  private getDefaultScores(): SkillScores {
    return {
      problemSolving: 70,
      analyticalThinking: 70,
      decisionMaking: 70,
      creativity: 70,
      communication: 70,
      leadership: 70,
      persistence: 70,
      timeManagement: 70,
    };
  }

  async getRecommendations(studentId: string) {
    const student = await this.repo.getStudentProfile(studentId);
    if (!student) throw new Error("المستخدم غير موجود.");

    const defaultScores = this.getDefaultScores();
    const studentBehavioralScores: SkillScores = (student.behavioralProfile as any) || defaultScores;
    const careers = await this.repo.getAllCareersWithWeights();

    // ────────────────────────────────────────────────────────────
    // 1. Prepare Data for AI Service
    // ────────────────────────────────────────────────────────────
    const assessmentScores: Record<string, number> = {};
    if (student.assessmentAttempts && student.assessmentAttempts.length > 0) {
      const latestAttempt = student.assessmentAttempts[0];
      for (const ans of latestAttempt.answers) {
        const skill = ans.question.skill;
        assessmentScores[skill] = (ans.option.value / 5) * 100;
      }
    }
    // Fill remaining with student behavioral profile or defaults
    for (const key of Object.keys(defaultScores)) {
      if (assessmentScores[key] === undefined) {
        assessmentScores[key] = studentBehavioralScores[key as SkillKey] || 70;
      }
    }

    // Extract behavior events from simulation sessions
    const behaviorEvents: BehaviorEventItem[] = [];
    if (student.simulationSessions && student.simulationSessions.length > 0) {
      for (const session of student.simulationSessions) {
        for (const attempt of session.attempts) {
          behaviorEvents.push({
            responseSeconds: attempt.responseSeconds || 12,
            attempts: attempt.attempts || 1,
            correct: attempt.correct,
            changedDecision: attempt.changedDecision,
            usedHint: attempt.usedHint,
            creativeAction: false,
            requestedTeamHelp: false,
            explainedDecision: false,
            leadershipAction: false,
            expectedResponseTime: 15,
            simulation_id: session.simulationId,
            challenge_type: "logic",
            metadata: {
              challengeId: attempt.challengeId,
              optionId: attempt.optionId,
            },
          });
        }
      }
    }

    // Prepare career profiles
    const careerProfiles: CareerProfileItem[] = careers.map((c) => ({
      career_id: c.id,
      career_name: c.nameAr,
      weights: Object.fromEntries(c.weights.map((w) => [w.indicator, w.weight])),
    }));

    // Career lookup map
    const careerMap = new Map(careers.map((c) => [c.id, c]));

    // ────────────────────────────────────────────────────────────
    // 2. Try Calling AI Microservice (if configured)
    // ────────────────────────────────────────────────────────────
    if (aiService.isConfigured()) {
      try {
        const aiResult = await aiService.analyzeStudent({
          student_id: studentId,
          assessmentScores,
          behaviorEvents,
          careerProfiles,
        });

        if (aiResult && aiResult.recommendations && aiResult.recommendations.length > 0) {
          // Persist AI-analyzed behavioral profile to PostgreSQL DB
          if (aiResult.behavioral_profile) {
            try {
              await this.repo.updateBehavioralProfile(studentId, aiResult.behavioral_profile as any);
            } catch (saveErr: any) {
              console.warn("⚠️ Could not persist AI behavioral profile:", saveErr.message);
            }
          }

          const aiRecommendations = aiResult.recommendations.map((rec) => {
            const career = careerMap.get(rec.career_id);
            const formattedStrengths = (rec.strengths || []).map(formatSkillLabel).filter(Boolean);
            const formattedDevAreas = (rec.developmentAreas || []).map(formatSkillLabel).filter(Boolean);

            return {
              careerId: rec.career_id,
              slug: career?.slug || rec.career_id,
              nameAr: rec.career_name || career?.nameAr || "",
              descriptionAr: career?.descriptionAr || "",
              icon: career?.icon || "Briefcase",
              matchScore: Math.round(rec.score),
              compatibilityTier: rec.score >= 85 ? "تطابق مرتفع جدًا (AI)" : rec.score >= 70 ? "تطابق مرتفع (AI)" : "تطابق متوسط (AI)",
              dataCoverage: rec.dataCoverage,
              evidenceQuality: rec.evidenceQuality,
              strengths: formattedStrengths,
              developmentAreas: formattedDevAreas,
              requiredSkills: career?.requiredSkills || [],
              traits: career?.traits || [],
              simulationsCount: career?.simulations?.length || 0,
            };
          }).sort((a, b) => b.matchScore - a.matchScore);

          return {
            source: "istilham_ai_service",
            confidence: aiResult.confidence,
            dataQuality: aiResult.data_quality,
            studentScores: aiResult.behavioral_profile || studentBehavioralScores,
            simulationAnalysis: aiResult.simulation_analysis,
            strengths: (aiResult.strengths || []).map(formatSkillLabel).filter(Boolean),
            recommendations: aiRecommendations,
            topCareer: aiRecommendations[0] || null,
            generatedAt: new Date(),
          };
        }
      } catch (aiError: any) {
        console.warn(`⚠️ [AI Service Warning] Fallback to rule engine: ${aiError.message}`);
      }
    }

    // ────────────────────────────────────────────────────────────
    // 3. Fallback: Internal Rule-based Recommendation Engine
    // ────────────────────────────────────────────────────────────
    const matched = careers.map((career) => {
      const match = calculateCareerMatch(
        studentBehavioralScores,
        career.weights.map((w) => ({ indicator: w.indicator, weight: w.weight }))
      );

      const strengths = career.weights
        .filter((w) => (studentBehavioralScores[w.indicator as SkillKey] || 0) >= 75)
        .map((w) => formatSkillLabel(w.indicator));

      return {
        careerId: career.id,
        slug: career.slug,
        nameAr: career.nameAr,
        descriptionAr: career.descriptionAr,
        icon: career.icon,
        matchScore: match.score,
        compatibilityTier: match.compatibilityTier,
        strengths: strengths.length > 0 ? strengths : career.weights.map((w) => formatSkillLabel(w.indicator)).slice(0, 3),
        requiredSkills: career.requiredSkills,
        traits: career.traits,
        simulationsCount: career.simulations.length,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return {
      source: "rule_based_fallback",
      studentScores: studentBehavioralScores,
      recommendations: matched,
      topCareer: matched[0] || null,
      generatedAt: new Date(),
    };
  }

  async getCareerMatchDetail(studentId: string, careerIdOrSlug: string) {
    const career = await this.repo.getCareerByIdOrSlug(careerIdOrSlug);
    if (!career) throw new Error("المهنة غير موجودة.");

    // Fetch full recommendations for this student (AI or fallback) to guarantee exact match score consistency!
    const recsResult = await this.getRecommendations(studentId);
    const matchedRec = recsResult.recommendations.find(
      (r: any) => r.careerId === career.id || r.slug === career.slug || r.careerId === career.slug
    );

    const scores: SkillScores = (recsResult.studentScores as any) || this.getDefaultScores();
    const matchScore = matchedRec ? matchedRec.matchScore : 70;
    const compatibilityTier = matchedRec ? matchedRec.compatibilityTier : (matchScore >= 80 ? "تطابق مرتفع" : "تطابق متوسط");

    // Identify strengths and improvement areas
    const weightMap = new Map(career.weights.map((w) => [w.indicator, w.weight]));
    const analysis = Object.entries(scores).map(([key, score]) => {
      const weight = weightMap.get(key as any) || 0;
      const numScore = Number(score) || 0;
      return {
        indicator: key,
        nameAr: formatSkillLabel(key),
        score: numScore,
        weight,
        impact: Math.round(numScore * weight),
        status: numScore >= 75 ? "STRONG" : numScore >= 60 ? "MODERATE" : "NEEDS_IMPROVEMENT",
      };
    });

    return {
      career: {
        id: career.id,
        slug: career.slug,
        nameAr: career.nameAr,
        descriptionAr: career.descriptionAr,
        aboutAr: career.aboutAr,
        icon: career.icon,
        requiredSkills: career.requiredSkills,
        growthSkills: career.growthSkills,
        nextSteps: career.nextSteps,
        traits: career.traits,
        jobs: career.jobs,
      },
      matchScore,
      compatibilityTier,
      indicatorAnalysis: analysis,
      strengths: matchedRec?.strengths?.length ? matchedRec.strengths : analysis.filter((a) => a.status === "STRONG").map((a) => a.nameAr),
      improvementAreas: analysis.filter((a) => a.status === "NEEDS_IMPROVEMENT").map((a) => a.nameAr),
    };
  }
}
