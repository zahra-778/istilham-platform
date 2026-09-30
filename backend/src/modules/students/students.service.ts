import { StudentsRepository } from "./students.repository";
import { calculateCareerMatch } from "../../utils/recommendation";
import type { SkillScores } from "../../types/common";

export class StudentsService {
  private repo = new StudentsRepository();

  async getProfile(userId: string) {
    const user = await this.repo.getStudentProfile(userId);
    if (!user) throw new Error("الملف الشخصي غير موجود.");

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.studentProfile?.dateOfBirth,
      educationLevel: user.studentProfile?.educationLevel,
      school: user.studentProfile?.school,
      city: user.studentProfile?.city,
      profileCompletion: user.studentProfile?.profileCompletion || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      behavioralProfile: user.behavioralProfile,
    };
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      dateOfBirth?: string | null;
      educationLevel?: string | null;
      school?: string | null;
      city?: string | null;
    }
  ) {
    let completion = 40;
    if (data.educationLevel) completion += 20;
    if (data.school) completion += 20;
    if (data.city) completion += 20;

    await this.repo.updateStudentProfile(userId, {
      name: data.name,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      educationLevel: data.educationLevel,
      school: data.school,
      city: data.city,
      profileCompletion: Math.min(100, completion),
    });

    return this.getProfile(userId);
  }

  async getDashboard(userId: string) {
    const data = await this.repo.getDashboardData(userId);
    if (!data.user) throw new Error("المستخدم غير موجود.");

    const completedAssessments = data.attempts.filter((a) => a.status === "COMPLETED");
    const completedSimulations = data.sessions.filter((s) => s.status === "COMPLETED");

    // Match careers against student's behavioral profile
    const studentScores = (data.user.behavioralProfile || {
      problemSolving: 70,
      analyticalThinking: 70,
      decisionMaking: 70,
      creativity: 70,
      communication: 70,
      leadership: 70,
      persistence: 70,
      timeManagement: 70,
    }) as unknown as SkillScores;

    const recommendedCareers = data.careers.map((career) => {
      const match = calculateCareerMatch(
        studentScores,
        career.weights.map((w) => ({ indicator: w.indicator, weight: w.weight }))
      );
      return {
        id: career.id,
        slug: career.slug,
        nameAr: career.nameAr,
        descriptionAr: career.descriptionAr,
        icon: career.icon,
        matchScore: match.score,
        compatibilityTier: match.compatibilityTier,
        requiredSkills: career.requiredSkills,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return {
      student: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        profileCompletion: data.user.studentProfile?.profileCompletion || 0,
        educationLevel: data.user.studentProfile?.educationLevel,
        school: data.user.studentProfile?.school,
        city: data.user.studentProfile?.city || "الرياض",
      },
      assessmentProgress: {
        completedCount: completedAssessments.length,
        hasCompletedInitial: completedAssessments.length > 0,
        latestAttempt: data.attempts[0] || null,
      },
      simulations: {
        completedCount: completedSimulations.length,
        inProgressCount: data.sessions.filter((s) => s.status === "IN_PROGRESS").length,
        recentSessions: data.sessions.slice(0, 5),
      },
      currentCareerProfile: data.user.behavioralProfile,
      recommendedCareers: recommendedCareers.slice(0, 4),
      recentActivity: data.activities,
      progressStatistics: {
        totalSimulationsCompleted: completedSimulations.length,
        totalAssessmentsTaken: completedAssessments.length,
        skillPointsAverage: Math.round(
          Object.values(studentScores).reduce((a, b) => (typeof b === "number" ? a + b : a), 0) / 8
        ),
      },
    };
  }
}
