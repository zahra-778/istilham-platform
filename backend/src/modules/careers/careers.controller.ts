import { Request, Response } from "express";
import { CareersService } from "./careers.service";
import { sendSuccess, sendError } from "../../utils/response";

export class CareersController {
  private service = new CareersService();

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const careers = await this.service.getAllCareers();
      sendSuccess(res, careers, 200);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const career = await this.service.getCareerByIdOrSlug(req.params.id);
      sendSuccess(res, career, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const career = await this.service.createCareer(req.body);
      sendSuccess(res, career, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const career = await this.service.updateCareer(req.params.id, req.body);
      sendSuccess(res, career, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.deleteCareer(req.params.id);
      sendSuccess(res, { message: "تم حذف المهنة بنجاح." }, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };
}
