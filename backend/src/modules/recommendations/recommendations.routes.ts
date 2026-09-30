import { Router } from "express";
import { RecommendationsController } from "./recommendations.controller";
import { authenticate } from "../../middleware/authenticate";

export const recommendationsRoutes = Router();
const controller = new RecommendationsController();

recommendationsRoutes.use(authenticate);

recommendationsRoutes.get("/", controller.getRecommendations);
recommendationsRoutes.get("/career-match/:careerId", controller.getCareerMatch);
