import { Request, Response } from "express";
import { SimulationsService } from "./simulations.service";
import { sendSuccess, sendError } from "../../utils/response";

export class SimulationsController {
  private service = new SimulationsService();

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const simulations = await this.service.getSimulations();
      sendSuccess(res, simulations, 200);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const sim = await this.service.getSimulationById(req.params.id);
      sendSuccess(res, sim, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };

  start = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.service.startSimulation(req.user!.sub, req.params.id);
      sendSuccess(res, session, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  recordAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, challengeId } = req.params;
      const attempt = await this.service.recordAttempt(
        req.user!.sub,
        sessionId,
        challengeId,
        req.body
      );
      sendSuccess(res, attempt, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  complete = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.completeSimulation(req.user!.sub, req.params.sessionId);
      sendSuccess(res, result, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  getResult = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getResult(req.params.id || req.params.sessionId);
      sendSuccess(res, result, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const simulation = await this.service.createSimulation(req.body);
      sendSuccess(res, simulation, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const simulation = await this.service.updateSimulation(req.params.id, req.body);
      sendSuccess(res, simulation, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.deleteSimulation(req.params.id);
      sendSuccess(res, { message: "تم حذف المحاكاة بنجاح." }, 200);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };
}
