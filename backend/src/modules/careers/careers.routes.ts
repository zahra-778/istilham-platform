import { Router } from "express";
import { CareersController } from "./careers.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { createCareerSchema, updateCareerSchema } from "./careers.validator";

export const careersRoutes = Router();
const controller = new CareersController();

// Public / Student endpoints
careersRoutes.get("/", controller.getAll);
careersRoutes.get("/:id", controller.getById);

// Admin endpoints
careersRoutes.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCareerSchema),
  controller.create
);
careersRoutes.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateCareerSchema),
  controller.update
);
careersRoutes.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.delete
);
