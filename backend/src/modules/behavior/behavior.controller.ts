import { Request, Response } from "express";
import { BehaviorService } from "./behavior.service";
import { sendSuccess, sendError } from "../../utils/response";

export class BehaviorController {
  private service = new BehaviorService();

  track = async (req: Request, res: Response): Promise<void> => {
    try {
      const event = await this.service.trackEvent(req.user!.sub, req.body);
      sendSuccess(res, event, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.service.getBehavioralProfile(req.user!.sub);
      sendSuccess(res, profile, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };
}
