import { prisma } from "../../config/prisma";

export class AdminService {
  async getPlatformStats() {
    const [
      totalUsers,
      totalStudents,
      totalCareers,
      totalSimulations,
      totalAssessmentsCompleted,
      totalSimulationsCompleted,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.career.count({ where: { isActive: true } }),
      prisma.simulation.count({ where: { isActive: true } }),
      prisma.assessmentAttempt.count({ where: { status: "COMPLETED" } }),
      prisma.simulationSession.count({ where: { status: "COMPLETED" } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          studentProfile: {
            select: { profileCompletion: true, educationLevel: true, school: true },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalCareers,
      totalSimulations,
      totalAssessmentsCompleted,
      totalSimulationsCompleted,
      recentUsers,
    };
  }

  async getAllStudents() {
    return prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        studentProfile: true,
        behavioralProfile: true,
        _count: {
          select: {
            assessmentAttempts: true,
            simulationSessions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStudentStatus(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }
}
