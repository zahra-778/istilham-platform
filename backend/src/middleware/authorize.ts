import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import type { UserRole } from "../types/common";

/**
 * authorize — Role-based access control middleware factory.
 * Must be used AFTER authenticate().
 *
 * Usage:
 *   router.get('/admin/stats', authenticate, authorize('ADMIN'), handler)
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "مطلوب تسجيل الدخول.", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, "ليس لديك صلاحية للوصول إلى هذا المورد.", 403);
      return;
    }

    next();
  };
}
