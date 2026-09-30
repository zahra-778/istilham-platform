import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response";

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      sendSuccess(res, result, 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      sendSuccess(res, result, 200);
    } catch (err: any) {
      sendError(res, err.message, 401);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    // JWT is stateless; client removes token. Endpoint provided for API conformance.
    sendSuccess(res, { message: "تم تسجيل الخروج بنجاح." }, 200);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "غير مصرح.", 401);
        return;
      }
      const user = await this.service.getMe(req.user.sub);
      sendSuccess(res, user, 200);
    } catch (err: any) {
      sendError(res, err.message, 404);
    }
  };
}
