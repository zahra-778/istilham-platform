import { prisma } from "../../config/prisma";

export class StudentsRepository {
  async getStudentProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        behavioralProfile: true,
      },
    });
  }

  async updateStudentProfile(
    userId: string,
    data: {
      name?: string;
      dateOfBirth?: Date | null;
      educationLevel?: string | null;
      school?: string | null;
      city?: string | null;
      profileCompletion?: number;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: data.name },
        });
      }

      const profile = await tx.studentProfile.upsert({
        where: { userId },
        update: {
          dateOfBirth: data.dateOfBirth,
          educationLevel: data.educationLevel,
          school: data.school,
          city: data.city,
          profileCompletion: data.profileCompletion,
        },
        create: {
          userId,
          dateOfBirth: data.dateOfBirth,
          educationLevel: data.educationLevel,
          school: data.school,
          city: data.city,
          profileCompletion: data.profileCompletion || 50,
        },
      });

      return profile;
    });
  }

  async getDashboardData(userId: string) {
    const [user, attempts, sessions, activities, careers] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true, behavioralProfile: true },
      }),
      prisma.assessmentAttempt.findMany({
        where: { studentId: userId },
        include: { assessment: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.simulationSession.findMany({
        where: { studentId: userId },
        include: { simulation: { include: { career: true } }, result: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.findMany({
        where: { studentId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.career.findMany({
        where: { isActive: true },
        include: { weights: true },
        take: 6,
      }),
    ]);

    return { user, attempts, sessions, activities, careers };
  }
}
