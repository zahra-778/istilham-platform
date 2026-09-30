import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "حدث خطأ غير متوقع في الخادم.";

  sendError(res, message, statusCode, process.env.NODE_ENV === "development" ? err.stack : undefined);
}
