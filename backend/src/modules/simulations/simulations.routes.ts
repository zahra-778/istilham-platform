import { Router } from "express";
import { SimulationsController } from "./simulations.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import {
  recordAttemptSchema,
  createSimulationSchema,
  updateSimulationSchema,
} from "./simulations.validator";

export const simulationsRoutes = Router();
const controller = new SimulationsController();

// Public / Student endpoints
simulationsRoutes.get("/", controller.getAll);
simulationsRoutes.get("/:id", controller.getById);

// Admin endpoints
simulationsRoutes.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createSimulationSchema),
  controller.create
);
simulationsRoutes.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateSimulationSchema),
  controller.update
);
simulationsRoutes.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.delete
);

// Session endpoints
simulationsRoutes.post("/:id/start", authenticate, controller.start);
simulationsRoutes.post(
  "/sessions/:sessionId/challenges/:challengeId/attempt",
  authenticate,
  validate(recordAttemptSchema),
  controller.recordAttempt
);
simulationsRoutes.post(
  "/sessions/:sessionId/complete",
  authenticate,
  controller.complete
);
simulationsRoutes.get(
  "/sessions/:sessionId/result",
  authenticate,
  controller.getResult
);
simulationsRoutes.get(
  "/results/:id",
  authenticate,
  controller.getResult
);

