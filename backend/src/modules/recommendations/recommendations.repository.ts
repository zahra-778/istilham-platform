import { prisma } from "../../config/prisma";
import type { SkillScores } from "../../types/common";

export class RecommendationsRepository {
  async getStudentProfile(studentId: string) {
    return prisma.user.findUnique({
      where: { id: studentId },
      include: {
        behavioralProfile: true,
        assessmentAttempts: {
          where: { status: "COMPLETED" },
          orderBy: { completedAt: "desc" },
          take: 1,
          include: {
            answers: {
              include: { question: true, option: true },
            },
          },
        },
        simulationSessions: {
          include: {
            simulation: true,
            attempts: {
              include: {
                challenge: true,
                option: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async getAllCareersWithWeights() {
    return prisma.career.findMany({
      where: { isActive: true },
      include: {
        weights: true,
        simulations: { select: { id: true, titleAr: true, slug: true } },
      },
    });
  }

  async getCareerByIdOrSlug(idOrSlug: string) {
    return prisma.career.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        weights: true,
        simulations: true,
      },
    });
  }

  async updateBehavioralProfile(userId: string, scores: Partial<Record<SkillScores[keyof SkillScores] extends number ? string : string, number>>) {
    return prisma.behavioralProfile.upsert({
      where: { userId },
      update: {
        ...(scores.problemSolving !== undefined && scores.problemSolving !== null ? { problemSolving: Number(scores.problemSolving) } : {}),
        ...(scores.analyticalThinking !== undefined && scores.analyticalThinking !== null ? { analyticalThinking: Number(scores.analyticalThinking) } : {}),
        ...(scores.decisionMaking !== undefined && scores.decisionMaking !== null ? { decisionMaking: Number(scores.decisionMaking) } : {}),
        ...(scores.creativity !== undefined && scores.creativity !== null ? { creativity: Number(scores.creativity) } : {}),
        ...(scores.communication !== undefined && scores.communication !== null ? { communication: Number(scores.communication) } : {}),
        ...(scores.leadership !== undefined && scores.leadership !== null ? { leadership: Number(scores.leadership) } : {}),
        ...(scores.persistence !== undefined && scores.persistence !== null ? { persistence: Number(scores.persistence) } : {}),
        ...(scores.timeManagement !== undefined && scores.timeManagement !== null ? { timeManagement: Number(scores.timeManagement) } : {}),
      },
      create: {
        userId,
        problemSolving: Number(scores.problemSolving || 70),
        analyticalThinking: Number(scores.analyticalThinking || 70),
        decisionMaking: Number(scores.decisionMaking || 70),
        creativity: Number(scores.creativity || 70),
        communication: Number(scores.communication || 70),
        leadership: Number(scores.leadership || 70),
        persistence: Number(scores.persistence || 70),
        timeManagement: Number(scores.timeManagement || 70),
      },
    });
  }
}
