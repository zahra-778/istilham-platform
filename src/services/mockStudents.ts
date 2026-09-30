import { request, delay } from "./apiClient";
import type { ActivityItem, Student, SkillScores, SkillKey } from "@/types";

const fallbackStudent: Student = {
  id: "st-1",
  name: "أحمد محمد",
  email: "ahmed@student.sa",
  stage: "الصف الثالث الثانوي",
  city: "الرياض",
  joinedAt: "١٢ سبتمبر ٢٠٢٥",
  assessmentProgress: 80,
  completedSimulations: 6,
  profileCompletion: 87,
  skills: {
    problemSolving: 87,
    analyticalThinking: 82,
    decisionMaking: 91,
    creativity: 74,
    communication: 79,
    leadership: 71,
    persistence: 88,
    timeManagement: 76,
  },
};

const fallbackActivities: ActivityItem[] = [
  {
    id: "a1",
    type: "simulation",
    title: "أكملت محاكاة هندسة البرمجيات",
    detail: "٨ تحديات — أداء قوي في اتخاذ القرار",
    date: "قبل ساعتين",
  },
  {
    id: "a2",
    type: "recommendation",
    title: "تم تحديث ترتيب التخصصات",
    detail: "هندسة البرمجيات في المرتبة الأولى بنسبة توافق ٩١٪",
    date: "أمس",
  },
  {
    id: "a3",
    type: "assessment",
    title: "أكملت القسم الرابع من التقييم المبدئي",
    detail: "قسم الإبداع وأسلوب العمل",
    date: "قبل ٣ أيام",
  },
  {
    id: "a4",
    type: "simulation",
    title: "استكملت محاكاة تحليل البيانات",
    detail: "٤٥٪ من التحديات مكتملة",
    date: "قبل ٥ أيام",
  },
];

export const studentsService = {
  async getCurrentStudent(): Promise<Student> {
    try {
      const dashboard = await request<any>("/students/me/dashboard");
      const s = dashboard.student;
      const bp = dashboard.currentCareerProfile || {};

      const skills: Record<SkillKey, number> = {
        problemSolving: bp.problemSolving || 75,
        analyticalThinking: bp.analyticalThinking || 75,
        decisionMaking: bp.decisionMaking || 75,
        creativity: bp.creativity || 75,
        communication: bp.communication || 75,
        leadership: bp.leadership || 75,
        persistence: bp.persistence || 75,
        timeManagement: bp.timeManagement || 75,
      };

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        stage: s.educationLevel || "الصف الثالث الثانوي",
        city: s.city || "الرياض",
        joinedAt: "حديثاً",
        assessmentProgress: dashboard.assessmentProgress?.hasCompletedInitial ? 100 : 0,
        completedSimulations: dashboard.simulations?.completedCount || 0,
        profileCompletion: s.profileCompletion || 85,
        skills,
      };
    } catch {
      return delay(fallbackStudent, 200);
    }
  },

  async getActivities(): Promise<ActivityItem[]> {
    try {
      const dashboard = await request<any>("/students/me/dashboard");
      if (dashboard.recentActivity && dashboard.recentActivity.length > 0) {
        return dashboard.recentActivity.map((a: any) => ({
          id: a.id,
          title: a.titleAr,
          detail: a.detailAr,
          date: new Date(a.createdAt).toLocaleDateString("ar-SA"),
          type: a.type?.toLowerCase() === "assessment" ? "assessment" : a.type?.toLowerCase() === "recommendation" ? "recommendation" : "simulation",
        }));
      }
      return fallbackActivities;
    } catch {
      return delay(fallbackActivities, 200);
    }
  },

  async updateProfile(data: { name?: string; educationLevel?: string; school?: string; city?: string }): Promise<any> {
    return request("/students/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
