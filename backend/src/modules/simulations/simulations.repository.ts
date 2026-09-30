import { prisma } from "../../config/prisma";
import type { SimulationScoringResult } from "../../utils/scoring";

export class SimulationsRepository {
  async findAll() {
    return prisma.simulation.findMany({
      where: { isActive: true },
      include: {
        career: { select: { id: true, slug: true, nameAr: true, icon: true } },
        _count: { select: { challenges: true } },
      },
    });
  }

  async findById(idOrSlug: string) {
    return prisma.simulation.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        career: true,
        challenges: {
          orderBy: { orderIndex: "asc" },
          include: {
            options: { orderBy: { orderIndex: "asc" } },
          },
        },
      },
    });
  }

  async startSession(studentId: string, simulationId: string) {
    return prisma.simulationSession.create({
      data: {
        studentId,
        simulationId,
        status: "IN_PROGRESS",
      },
      include: {
        simulation: {
          include: {
            career: true,
            challenges: {
              orderBy: { orderIndex: "asc" },
              include: { options: { orderBy: { orderIndex: "asc" } } },
            },
          },
        },
      },
    });
  }

  async findSessionById(sessionId: string) {
    return prisma.simulationSession.findUnique({
      where: { id: sessionId },
      include: {
        simulation: {
          include: {
            career: true,
            challenges: {
              orderBy: { orderIndex: "asc" },
              include: { options: true },
            },
          },
        },
        attempts: {
          include: {
            challenge: true,
            option: true,
          },
        },
        result: true,
      },
    });
  }

  async recordAttempt(data: {
    sessionId: string;
    challengeId: string;
    optionId: string;
    responseSeconds: number;
    attempts: number;
    changedDecision: boolean;
    usedHint: boolean;
    correct: boolean;
  }) {
    return prisma.challengeAttempt.upsert({
      where: {
        sessionId_challengeId: {
          sessionId: data.sessionId,
          challengeId: data.challengeId,
        },
      },
      update: {
        optionId: data.optionId,
        responseSeconds: data.responseSeconds,
        attempts: data.attempts,
        changedDecision: data.changedDecision,
        usedHint: data.usedHint,
        correct: data.correct,
        recordedAt: new Date(),
      },
      create: data,
    });
  }

  async completeSession(
    sessionId: string,
    studentId: string,
    simulationId: string,
    careerId: string,
    scoring: SimulationScoringResult
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Mark session complete
      await tx.simulationSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // 2. Create or update result
      const result = await tx.simulationResult.upsert({
        where: { sessionId },
        update: {
          summaryAr: scoring.summary,
          totalTimeMinutes: scoring.totalTimeMinutes,
          correctAnswers: scoring.correctAnswers,
          totalChallenges: scoring.totalChallenges,
          indicators: scoring.indicators as any,
          completedAt: new Date(),
        },
        create: {
          sessionId,
          studentId,
          simulationId,
          careerId,
          summaryAr: scoring.summary,
          totalTimeMinutes: scoring.totalTimeMinutes,
          correctAnswers: scoring.correctAnswers,
          totalChallenges: scoring.totalChallenges,
          indicators: scoring.indicators as any,
        },
      });

      // 3. Update student behavioral profile
      await tx.behavioralProfile.upsert({
        where: { userId: studentId },
        update: {
          problemSolving: scoring.indicators.problemSolving,
          analyticalThinking: scoring.indicators.analyticalThinking,
          decisionMaking: scoring.indicators.decisionMaking,
          creativity: scoring.indicators.creativity,
          communication: scoring.indicators.communication,
          leadership: scoring.indicators.leadership,
          persistence: scoring.indicators.persistence,
          timeManagement: scoring.indicators.timeManagement,
        },
        create: {
          userId: studentId,
          problemSolving: scoring.indicators.problemSolving,
          analyticalThinking: scoring.indicators.analyticalThinking,
          decisionMaking: scoring.indicators.decisionMaking,
          creativity: scoring.indicators.creativity,
          communication: scoring.indicators.communication,
          leadership: scoring.indicators.leadership,
          persistence: scoring.indicators.persistence,
          timeManagement: scoring.indicators.timeManagement,
        },
      });

      // 4. Log activity
      await tx.activityLog.create({
        data: {
          studentId,
          type: "SIMULATION",
          titleAr: "إكمال محاكاة مهنية",
          detailAr: `تم إكمال التحديات والمهام بنتيجة ${scoring.correctAnswers}/${scoring.totalChallenges}.`,
        },
      });

      return result;
    });
  }

  async findResultById(resultIdOrSessionId: string) {
    return prisma.simulationResult.findFirst({
      where: {
        OR: [{ id: resultIdOrSessionId }, { sessionId: resultIdOrSessionId }],
      },
      include: {
        simulation: {
          include: {
            career: {
              include: { weights: true },
            },
          },
        },
        session: {
          include: {
            attempts: {
              include: {
                challenge: true,
                option: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: {
    slug: string;
    careerId: string;
    titleAr: string;
    descriptionAr: string;
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    durationMinutes?: number;
    introAr: string;
    challenges?: Array<{
      situationAr: string;
      questionAr: string;
      hintAr?: string;
      options: Array<{
        textAr: string;
        quality: number;
      }>;
    }>;
  }) {
    return prisma.simulation.create({
      data: {
        slug: data.slug,
        careerId: data.careerId,
        titleAr: data.titleAr,
        descriptionAr: data.descriptionAr,
        difficulty: data.difficulty ?? "INTERMEDIATE",
        durationMinutes: data.durationMinutes ?? 20,
        introAr: data.introAr,
        challenges:
          data.challenges && data.challenges.length > 0
            ? {
                create: data.challenges.map((c, cIdx) => ({
                  orderIndex: cIdx,
                  situationAr: c.situationAr,
                  questionAr: c.questionAr,
                  hintAr: c.hintAr || "",
                  options: {
                    create: c.options.map((o, oIdx) => ({
                      orderIndex: oIdx,
                      textAr: o.textAr,
                      quality: o.quality,
                    })),
                  },
                })),
              }
            : undefined,
      },
      include: {
        career: true,
        challenges: {
          include: { options: true },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      slug?: string;
      careerId?: string;
      titleAr?: string;
      descriptionAr?: string;
      difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
      durationMinutes?: number;
      introAr?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.simulation.update({
      where: { id },
      data: {
        slug: data.slug,
        careerId: data.careerId,
        titleAr: data.titleAr,
        descriptionAr: data.descriptionAr,
        difficulty: data.difficulty,
        durationMinutes: data.durationMinutes,
        introAr: data.introAr,
        isActive: data.isActive,
      },
      include: {
        career: true,
        challenges: {
          include: { options: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.simulation.delete({
      where: { id },
    });
  }
}
