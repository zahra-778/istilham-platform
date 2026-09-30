import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { registerSchema, loginSchema } from "./auth.validator";

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post("/register", validate(registerSchema), controller.register);
authRoutes.post("/login", validate(loginSchema), controller.login);
authRoutes.post("/logout", controller.logout);
authRoutes.get("/me", authenticate, controller.me);
