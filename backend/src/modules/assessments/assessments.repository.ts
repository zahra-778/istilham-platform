import { prisma } from "../../config/prisma";
import type { SkillScores } from "../../types/common";

export class AssessmentsRepository {
  async findAll() {
    return prisma.assessment.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            options: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });
  }

  async startAttempt(studentId: string, assessmentId: string) {
    return prisma.assessmentAttempt.create({
      data: {
        studentId,
        assessmentId,
        status: "IN_PROGRESS",
      },
      include: {
        assessment: {
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
              include: {
                options: { orderBy: { orderIndex: "asc" } },
              },
            },
          },
        },
      },
    });
  }

  async findAttemptById(attemptId: string) {
    return prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: true,
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });
  }

  async saveAnswer(attemptId: string, questionId: string, optionId: string) {
    return prisma.assessmentAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: { optionId, answeredAt: new Date() },
      create: {
        attemptId,
        questionId,
        optionId,
      },
    });
  }

  async completeAttempt(attemptId: string, studentId: string, scores: SkillScores) {
    return prisma.$transaction(async (tx) => {
      const attempt = await tx.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Update student's behavioral profile
      await tx.behavioralProfile.upsert({
        where: { userId: studentId },
        update: {
          problemSolving: scores.problemSolving,
          analyticalThinking: scores.analyticalThinking,
          decisionMaking: scores.decisionMaking,
          creativity: scores.creativity,
          communication: scores.communication,
          leadership: scores.leadership,
          persistence: scores.persistence,
          timeManagement: scores.timeManagement,
        },
        create: {
          userId: studentId,
          problemSolving: scores.problemSolving,
          analyticalThinking: scores.analyticalThinking,
          decisionMaking: scores.decisionMaking,
          creativity: scores.creativity,
          communication: scores.communication,
          leadership: scores.leadership,
          persistence: scores.persistence,
          timeManagement: scores.timeManagement,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          studentId,
          type: "ASSESSMENT",
          titleAr: "إكمال التقييم المبدئي",
          detailAr: "تم تحليل وتحديث السمات المهنية والمهارات بنجاح.",
        },
      });

      return attempt;
    });
  }
}
