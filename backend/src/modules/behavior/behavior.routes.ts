import { Router } from "express";
import { BehaviorController } from "./behavior.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { trackEventSchema } from "./behavior.validator";

export const behaviorRoutes = Router();
const controller = new BehaviorController();

behaviorRoutes.use(authenticate);

behaviorRoutes.post("/events", validate(trackEventSchema), controller.track);
behaviorRoutes.post("/track", validate(trackEventSchema), controller.track);
behaviorRoutes.get("/profile", controller.getProfile);
