import { AssessmentsRepository } from "./assessments.repository";
import { computeAssessmentScores, generateAssessmentSummary } from "../../utils/scoring";
import type { SkillKey } from "../../types/common";

export class AssessmentsService {
  private repo = new AssessmentsRepository();

  async getAssessments() {
    return this.repo.findAll();
  }

  async getAssessmentById(id: string) {
    const assessment = await this.repo.findById(id);
    if (!assessment) throw new Error("التقييم غير موجود.");
    return assessment;
  }

  async startAssessment(studentId: string, assessmentId: string) {
    const assessment = await this.repo.findById(assessmentId);
    if (!assessment) throw new Error("التقييم غير موجود.");

    return this.repo.startAttempt(studentId, assessmentId);
  }

  async answerQuestion(studentId: string, attemptId: string, questionId: string, optionId: string) {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt || attempt.studentId !== studentId) {
      throw new Error("محاولة التقييم غير صالحة.");
    }
    if (attempt.status === "COMPLETED") {
      throw new Error("تم إكمال هذا التقييم مسبقًا.");
    }

    return this.repo.saveAnswer(attemptId, questionId, optionId);
  }

  async completeAssessment(studentId: string, attemptId: string) {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt || attempt.studentId !== studentId) {
      throw new Error("محاولة التقييم غير صالحة.");
    }

    const scoredAnswers = attempt.answers.map((a) => ({
      skill: a.question.skill as SkillKey,
      optionValue: a.option.value,
    }));

    const scores = computeAssessmentScores(scoredAnswers);
    const summary = generateAssessmentSummary(scores);

    await this.repo.completeAttempt(attemptId, studentId, scores);

    return {
      attemptId,
      scores,
      summary,
      completedAt: new Date(),
    };
  }

  async getAttemptResult(studentId: string, attemptId: string) {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt || attempt.studentId !== studentId) {
      throw new Error("محاولة التقييم غير صالحة.");
    }

    const scoredAnswers = attempt.answers.map((a) => ({
      skill: a.question.skill as SkillKey,
      optionValue: a.option.value,
    }));

    const scores = computeAssessmentScores(scoredAnswers);
    const summary = generateAssessmentSummary(scores);

    return {
      attemptId: attempt.id,
      assessmentTitle: attempt.assessment.titleAr,
      status: attempt.status,
      scores,
      summary,
      totalAnswered: attempt.answers.length,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    };
  }
}
