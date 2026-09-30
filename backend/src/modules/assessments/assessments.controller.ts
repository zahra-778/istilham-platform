import { Request, Response } from "express";
import { AssessmentsService } from "./assessments.service";
import { sendSuccess, sendError } from "../../utils/response";

export class AssessmentsController {
  private service = new AssessmentsService();

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const assessments = await this.service.getAssessments();
      sendSuccess(res, assessments, 200);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const assessment = await this.service.getAssessmentById(req.params.id);
      sendSuccess(res, assessment, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };

  start = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.startAssessment(req.user!.sub, req.params.id);
      sendSuccess(res, result, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  answer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId, optionId } = req.body;
      const answer = await this.service.answerQuestion(
        req.user!.sub,
        req.params.attemptId,
        questionId,
        optionId
      );
      sendSuccess(res, answer, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  complete = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.completeAssessment(req.user!.sub, req.params.attemptId);
      sendSuccess(res, result, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  getResult = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getAttemptResult(req.user!.sub, req.params.attemptId);
      sendSuccess(res, result, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };
}
