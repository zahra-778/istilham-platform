import { Router } from "express";
import { ChallengesController } from "./challenges.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { createChallengeSchema } from "./challenges.validator";

export const challengesRoutes = Router();
const controller = new ChallengesController();

challengesRoutes.get("/", controller.getAll);
challengesRoutes.get("/:id", controller.getById);

// Admin create challenge
challengesRoutes.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createChallengeSchema),
  controller.create
);
