import { request, delay } from "./apiClient";
import { careers } from "@/data/careers";
import { SKILL_LABELS, type Recommendation, type SkillKey } from "@/types";

const fallbackIndicators: Record<SkillKey, number> = {
  problemSolving: 87,
  analyticalThinking: 82,
  decisionMaking: 91,
  creativity: 74,
  communication: 79,
  leadership: 71,
  persistence: 88,
  timeManagement: 76,
};

export function computeCompatibility(indicators: Record<SkillKey, number>): Recommendation[] {
  return careers
    .map<Recommendation>((career) => {
      const entries = Object.entries(career.weights) as [SkillKey, number][];
      const totalWeight = entries.reduce((s, [, w]) => s + w, 0) || 1;
      const score = entries.reduce((s, [key, w]) => s + (indicators[key] ?? 60) * w, 0) / totalWeight;

      const strengths = entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => SKILL_LABELS[key]);

      return {
        careerId: career.id,
        name: career.name,
        score: Math.round(score),
        shortDescription: career.shortDescription,
        strengths,
        reason: `تم ترشيح ${career.name} لك بسبب أدائك المرتفع في ${strengths.join("، ")} أثناء المحاكاة والتقييم المبدئي.`,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function formatStrength(s: any): string {
  if (!s) return "";
  if (typeof s === "string") return SKILL_LABELS[s as SkillKey] || s;
  return s.name_ar || SKILL_LABELS[s.indicator as SkillKey] || s.name || s.indicator || "";
}

export const recommendationsService = {
  async getIndicators(): Promise<Record<SkillKey, number>> {
    try {
      const res = await request<any>("/behavior/profile");
      if (res) {
        return {
          problemSolving: res.problemSolving || 75,
          analyticalThinking: res.analyticalThinking || 75,
          decisionMaking: res.decisionMaking || 75,
          creativity: res.creativity || 75,
          communication: res.communication || 75,
          leadership: res.leadership || 75,
          persistence: res.persistence || 75,
          timeManagement: res.timeManagement || 75,
        };
      }
    } catch {
      // Fallback
    }
    return delay(fallbackIndicators, 200);
  },

  async getRanking(): Promise<Recommendation[]> {
    try {
      const res = await request<any>("/recommendations");
      if (res && res.recommendations && res.recommendations.length > 0) {
        return res.recommendations.map((r: any) => ({
          careerId: r.slug || r.careerId,
          name: r.nameAr || r.name,
          score: Math.round(r.matchScore || r.score),
          shortDescription: r.descriptionAr || r.shortDescription || "",
          strengths: (r.strengths || []).map(formatStrength).filter(Boolean),
          reason: r.reason || `تم ترشيح ${r.nameAr || r.name} بنسبة توافق ${Math.round(r.matchScore || r.score)}٪ بناءً على أدائك.`,
        }));
      }
    } catch {
      // Fallback
    }
    return delay(computeCompatibility(fallbackIndicators), 300);
  },

  async getForCareer(careerId: string): Promise<Recommendation & Record<string, any>> {
    try {
      const res = await request<any>(`/recommendations/career-match/${careerId}`);
      if (res && res.career) {
        const strengths = (res.strengths || []).map((s: any) =>
          typeof s === "string" ? (SKILL_LABELS[s as SkillKey] || s) : (s?.name_ar || s?.name || s?.indicator || "")
        ).filter(Boolean);

        // Find a simulation slug from the career simulations list
        let simulationSlug: string | undefined;
        try {
          const simsRes = await request<any>("/simulations");
          // backend returns array directly
          const simsArr: any[] = Array.isArray(simsRes) ? simsRes : (simsRes?.simulations || simsRes?.data || []);
          const sim = simsArr.find(
            (s: any) => s.careerId === res.career.id || s.career?.id === res.career.id
          );
          if (sim) simulationSlug = sim.slug || sim.id;
        } catch { /* ignore */ }

        return {
          careerId: res.career.slug || res.career.id,
          name: res.career.nameAr,
          score: Math.round(res.matchScore),
          shortDescription: res.career.descriptionAr,
          strengths,
          reason: `نسبة توافق ${Math.round(res.matchScore)}٪ مع مسار ${res.career.nameAr}.`,
          compatibilityTier: res.compatibilityTier,
          // Full career detail fields for the career detail page
          career: {
            id: res.career.id,
            nameAr: res.career.nameAr,
            descriptionAr: res.career.descriptionAr,
            aboutAr: res.career.aboutAr,
            requiredSkills: res.career.requiredSkills || [],
            traits: res.career.traits || [],
            jobs: res.career.jobs || [],
            growthSkills: res.career.growthSkills || [],
            nextSteps: res.career.nextSteps || [],
          },
          simulationSlug,
          indicatorAnalysis: res.indicatorAnalysis || [],
        };
      }
    } catch { /* Fallback */ }

    // Fallback to local computed data
    const found = computeCompatibility(fallbackIndicators).find((r) => r.careerId === careerId);
    if (!found) throw new Error("لم يتم العثور على التخصص المطلوب.");
    return delay(found as any, 250);
  },
};
