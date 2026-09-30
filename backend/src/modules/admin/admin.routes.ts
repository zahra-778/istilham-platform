import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

export const adminRoutes = Router();
const controller = new AdminController();

adminRoutes.use(authenticate, authorize("ADMIN"));

adminRoutes.get("/stats", controller.getStats);
adminRoutes.get("/analytics", controller.getStats);
adminRoutes.get("/students", controller.getStudents);
adminRoutes.get("/users", controller.getStudents);
adminRoutes.patch("/students/:id/status", controller.updateStudentStatus);
adminRoutes.get("/ai-health", controller.checkAiHealth);
