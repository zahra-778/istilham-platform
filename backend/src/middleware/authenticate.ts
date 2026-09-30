import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";

/**
 * authenticate — JWT Bearer token middleware.
 * Verifies the token and attaches the decoded payload to req.user.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "مطلوب تسجيل الدخول للوصول إلى هذه الصفحة.", 401);
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, "جلسة منتهية أو رمز دخول غير صحيح، يرجى تسجيل الدخول مجددًا.", 401);
  }
}
