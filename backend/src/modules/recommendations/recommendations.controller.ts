import { Request, Response } from "express";
import { RecommendationsService } from "./recommendations.service";
import { sendSuccess, sendError } from "../../utils/response";

export class RecommendationsController {
  private service = new RecommendationsService();

  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const recommendations = await this.service.getRecommendations(req.user!.sub);
      sendSuccess(res, recommendations, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  getCareerMatch = async (req: Request, res: Response): Promise<void> => {
    try {
      const match = await this.service.getCareerMatchDetail(
        req.user!.sub,
        req.params.careerId
      );
      sendSuccess(res, match, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };
}
