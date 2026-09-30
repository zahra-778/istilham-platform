import { Router } from "express";
import { AssessmentsController } from "./assessments.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { answerQuestionSchema } from "./assessments.validator";

export const assessmentsRoutes = Router();
const controller = new AssessmentsController();

assessmentsRoutes.get("/", controller.getAll);
assessmentsRoutes.get("/:id", controller.getById);

// Attempt management
assessmentsRoutes.post("/:id/start", authenticate, controller.start);
assessmentsRoutes.post(
  "/attempts/:attemptId/answer",
  authenticate,
  validate(answerQuestionSchema),
  controller.answer
);
assessmentsRoutes.post("/attempts/:attemptId/complete", authenticate, controller.complete);
assessmentsRoutes.get("/attempts/:attemptId/result", authenticate, controller.getResult);
