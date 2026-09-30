import { Request, Response } from "express";
import { ChallengesService } from "./challenges.service";
import { sendSuccess, sendError } from "../../utils/response";

export class ChallengesController {
  private service = new ChallengesService();

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const challenges = await this.service.getChallenges();
      sendSuccess(res, challenges, 200);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const challenge = await this.service.getChallengeById(req.params.id);
      sendSuccess(res, challenge, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const challenge = await this.service.createChallenge(req.body);
      sendSuccess(res, challenge, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };
}
