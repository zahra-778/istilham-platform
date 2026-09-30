import { Request, Response } from "express";
import { StudentsService } from "./students.service";
import { sendSuccess, sendError } from "../../utils/response";

export class StudentsController {
  private service = new StudentsService();

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.service.getProfile(req.user!.sub);
      sendSuccess(res, profile, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this.service.updateProfile(req.user!.sub, req.body);
      sendSuccess(res, updated, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboard = await this.service.getDashboard(req.user!.sub);
      sendSuccess(res, dashboard, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };
}
