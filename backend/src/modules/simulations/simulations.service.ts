import { SimulationsRepository } from "./simulations.repository";
import { computeSimulationScores, type SimulationEvent } from "../../utils/scoring";
import { prisma } from "../../config/prisma";

export class SimulationsService {
  private repo = new SimulationsRepository();

  async getSimulations() {
    return this.repo.findAll();
  }

  async getSimulationById(idOrSlug: string) {
    const sim = await this.repo.findById(idOrSlug);
    if (!sim) throw new Error("المحاكاة غير موجودة.");
    return sim;
  }

  async startSimulation(studentId: string, simulationId: string) {
    const sim = await this.repo.findById(simulationId);
    if (!sim) throw new Error("المحاكاة غير موجودة.");

    return this.repo.startSession(studentId, sim.id);
  }

  async recordAttempt(
    studentId: string,
    sessionId: string,
    challengeId: string,
    data: {
      optionId: string;
      responseSeconds: number;
      attempts: number;
      changedDecision: boolean;
      usedHint: boolean;
    }
  ) {
    const session = await this.repo.findSessionById(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error("جلسة المحاكاة غير صالحة.");
    }
    if (session.status === "COMPLETED") {
      throw new Error("تم إكمال هذه الجلسة مسبقًا.");
    }

    const option = await prisma.challengeOption.findUnique({
      where: { id: data.optionId },
    });

    const isCorrect = (option?.quality ?? 1) >= 4;

    return this.repo.recordAttempt({
      sessionId,
      challengeId,
      optionId: data.optionId,
      responseSeconds: data.responseSeconds,
      attempts: data.attempts,
      changedDecision: data.changedDecision,
      usedHint: data.usedHint,
      correct: isCorrect,
    });
  }

  async completeSimulation(studentId: string, sessionId: string) {
    const session = await this.repo.findSessionById(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error("جلسة المحاكاة غير صالحة.");
    }

    const events: SimulationEvent[] = session.attempts.map((a) => ({
      challengeId: a.challengeId,
      optionId: a.optionId,
      quality: a.option.quality,
      responseSeconds: a.responseSeconds,
      attempts: a.attempts,
      changedDecision: a.changedDecision,
      usedHint: a.usedHint,
      correct: a.correct,
    }));

    const scoring = computeSimulationScores(events);

    const result = await this.repo.completeSession(
      sessionId,
      studentId,
      session.simulationId,
      session.simulation.careerId,
      scoring
    );

    return result;
  }

  async getResult(resultIdOrSessionId: string) {
    const result = await this.repo.findResultById(resultIdOrSessionId);
    if (!result) throw new Error("نتيجة المحاكاة غير موجودة.");
    return result;
  }

  async createSimulation(data: {
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
    const existing = await this.repo.findById(data.slug);
    if (existing) {
      throw new Error("يوجد محاكاة بنفس الاسم اللطيف (Slug) مسبقاً.");
    }
    return this.repo.create(data);
  }

  async updateSimulation(
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
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("المحاكاة غير موجودة.");
    }
    return this.repo.update(id, data);
  }

  async deleteSimulation(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("المحاكاة غير موجودة.");
    }
    return this.repo.delete(id);
  }
}
