import { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  details?: unknown
): Response {
  return res.status(statusCode).json({ success: false, error: message, ...(details ? { details } : {}) });
}
