import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  sendError(res, `المسار المطلوب (${req.originalUrl}) غير موجود.`, 404);
}
