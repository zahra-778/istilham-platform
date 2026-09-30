import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { aiService } from "../../services/ai.service";
import { sendSuccess, sendError } from "../../utils/response";

export class AdminController {
  private service = new AdminService();

  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getPlatformStats();
      sendSuccess(res, stats, 200);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  };

  getStudents = async (_req: Request, res: Response): Promise<void> => {
    try {
      const students = await this.service.getAllStudents();
      sendSuccess(res, students, 200);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  };

  updateStudentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive } = req.body;
      const updated = await this.service.updateStudentStatus(req.params.id, isActive);
      sendSuccess(res, updated, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  checkAiHealth = async (_req: Request, res: Response): Promise<void> => {
    try {
      const health = await aiService.checkAiHealth();
      sendSuccess(res, health, 200);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  };
}
