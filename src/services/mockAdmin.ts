import { request, delay } from "./apiClient";

export const adminService = {
  async getOverview(): Promise<any> {
    try {
      const stats = await request<any>("/admin/stats");
      if (stats) {
        return {
          totalStudents: stats.totalStudents || 1,
          completedAssessments: stats.totalAssessmentsCompleted || 0,
          completedSimulations: stats.totalSimulationsCompleted || 0,
          averageCompatibility: 88,
          studentsGrowth: "+١٥٪ هذا الشهر",
          simulationsGrowth: "+١٠٪ هذا الشهر",
        };
      }
    } catch {
      // Fallback
    }

    return delay(
      {
        totalStudents: 4218,
        completedAssessments: 3496,
        completedSimulations: 9127,
        averageCompatibility: 84,
        studentsGrowth: "+١٢٪ عن الشهر الماضي",
        simulationsGrowth: "+٨٪ عن الشهر الماضي",
      },
      300
    );
  },

  getTopCareers: () =>
    delay(
      [
        { name: "هندسة البرمجيات", value: 31 },
        { name: "تحليل البيانات", value: 22 },
        { name: "الأمن السيبراني", value: 17 },
        { name: "إدارة الأعمال", value: 13 },
        { name: "التسويق", value: 10 },
        { name: "التصميم الجرافيكي", value: 7 },
      ],
      300
    ),

  getMonthlyPerformance: () =>
    delay(
      [
        { month: "يناير", simulations: 620, completion: 71 },
        { month: "فبراير", simulations: 740, completion: 74 },
        { month: "مارس", simulations: 810, completion: 78 },
        { month: "أبريل", simulations: 905, completion: 80 },
        { month: "مايو", simulations: 1030, completion: 83 },
        { month: "يونيو", simulations: 1180, completion: 86 },
      ],
      300
    ),

  async getRecentStudents(): Promise<any[]> {
    try {
      const students = await request<any[]>("/admin/students");
      if (students && students.length > 0) {
        return students.map((s) => ({
          id: s.id,
          name: s.name,
          stage: s.studentProfile?.educationLevel || "الثالث الثانوي",
          assessment: s._count?.assessmentAttempts ? 100 : 0,
          simulations: s._count?.simulationSessions || 0,
          top: "هندسة البرمجيات",
        }));
      }
    } catch {
      // Fallback
    }

    return delay(
      [
        { id: "s-901", name: "سارة الحربي", stage: "الثالث الثانوي", assessment: 100, simulations: 7, top: "تحليل البيانات" },
        { id: "s-902", name: "عبدالله القحطاني", stage: "الثاني الثانوي", assessment: 80, simulations: 4, top: "هندسة البرمجيات" },
        { id: "s-903", name: "ريم الدوسري", stage: "الثالث الثانوي", assessment: 60, simulations: 3, top: "التصميم الجرافيكي" },
        { id: "s-904", name: "فيصل العنزي", stage: "الأول الثانوي", assessment: 40, simulations: 2, top: "الأمن السيبراني" },
        { id: "s-905", name: "نورة الشمري", stage: "الثالث الثانوي", assessment: 100, simulations: 9, top: "الطب" },
      ],
      300
    );
  },
};
