import { Router } from "express";
import { StudentsController } from "./students.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { updateProfileSchema } from "./students.validator";

export const studentsRoutes = Router();
const controller = new StudentsController();

studentsRoutes.use(authenticate);

// /api/students/me & aliases
studentsRoutes.get("/me", controller.getProfile);
studentsRoutes.put("/me", validate(updateProfileSchema), controller.updateProfile);
studentsRoutes.get("/me/dashboard", controller.getDashboard);

// Direct paths
studentsRoutes.get("/profile", controller.getProfile);
studentsRoutes.put("/profile", validate(updateProfileSchema), controller.updateProfile);
studentsRoutes.get("/dashboard", controller.getDashboard);
