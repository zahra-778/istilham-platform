import { prisma } from "../../config/prisma";

export class ChallengesRepository {
  async findAll() {
    return prisma.simulationChallenge.findMany({
      include: {
        simulation: { select: { id: true, titleAr: true, slug: true } },
        options: { orderBy: { orderIndex: "asc" } },
      },
      orderBy: { orderIndex: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.simulationChallenge.findUnique({
      where: { id },
      include: {
        simulation: { include: { career: true } },
        options: { orderBy: { orderIndex: "asc" } },
      },
    });
  }

  async createChallenge(data: {
    simulationId: string;
    situationAr: string;
    questionAr: string;
    hintAr: string;
    orderIndex: number;
    options: Array<{ textAr: string; quality: number; orderIndex: number }>;
  }) {
    return prisma.simulationChallenge.create({
      data: {
        simulationId: data.simulationId,
        situationAr: data.situationAr,
        questionAr: data.questionAr,
        hintAr: data.hintAr,
        orderIndex: data.orderIndex,
        options: {
          create: data.options,
        },
      },
      include: { options: true },
    });
  }
}
