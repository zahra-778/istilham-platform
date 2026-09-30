import { request, delay } from "./apiClient";
import { assessmentQuestions } from "@/data/questions";
import type { AssessmentQuestion, SkillKey } from "@/types";

export interface AssessmentSubmission {
  answers: Record<string, string>;
}

export interface AssessmentOutcome {
  scores: Record<SkillKey, number>;
  completion: number;
  summary: string;
}

export const assessmentsService = {
  async getQuestions(): Promise<AssessmentQuestion[]> {
    try {
      const list = await request<any[]>("/assessments");
      if (list && list.length > 0) {
        const assessmentId = list[0].id;
        const detail = await request<any>(`/assessments/${assessmentId}`);
        if (detail && detail.questions && detail.questions.length > 0) {
          return detail.questions.map((q: any) => ({
            id: q.id,
            skill: q.skill as SkillKey,
            section: q.sectionAr,
            text: q.textAr,
            options: q.options.map((o: any) => ({
              id: o.id,
              text: o.textAr,
              value: o.value,
            })),
          }));
        }
      }
      return assessmentQuestions;
    } catch {
      return delay(assessmentQuestions, 300);
    }
  },

  async submit(submission: AssessmentSubmission): Promise<AssessmentOutcome> {
    try {
      const list = await request<any[]>("/assessments");
      const assessmentId = list?.[0]?.id || "default";

      // 1. Start attempt
      const attempt = await request<any>(`/assessments/${assessmentId}/start`, {
        method: "POST",
      });
      const attemptId = attempt?.id;

      // 2. Submit answers
      if (attemptId) {
        for (const [questionId, optionId] of Object.entries(submission.answers)) {
          await request(`/assessments/attempts/${attemptId}/answer`, {
            method: "POST",
            body: JSON.stringify({ questionId, optionId }),
          }).catch(() => null);
        }

        // 3. Complete attempt
        const result = await request<any>(`/assessments/attempts/${attemptId}/complete`, {
          method: "POST",
        });

        if (result && result.scores) {
          return {
            scores: result.scores,
            completion: 100,
            summary: result.summary,
          };
        }
      }
    } catch {
      // Fallback local calculation
    }

    const base: Record<SkillKey, number> = {
      problemSolving: 74,
      analyticalThinking: 71,
      decisionMaking: 76,
      creativity: 68,
      communication: 72,
      leadership: 66,
      persistence: 78,
      timeManagement: 70,
    };

    for (const question of assessmentQuestions) {
      const chosen = submission.answers[question.id];
      const option = question.options.find((o) => o.id === chosen);
      if (!option) continue;
      const bonus = (option.value - 3) * 4;
      base[question.skill] = Math.max(35, Math.min(98, base[question.skill] + bonus));
    }

    return delay(
      {
        scores: base,
        completion: 100,
        summary:
          "أظهرت نتائج التقييم المبدئي ميلًا واضحًا نحو التفكير المنهجي واتخاذ القرار المدروس، مع قدرة جيدة على تنظيم الوقت والمثابرة عند مواجهة المهام الصعبة.",
      },
      600
    );
  },
};
