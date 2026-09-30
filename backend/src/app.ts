import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRoutes } from "./modules/auth/auth.routes";
import { studentsRoutes } from "./modules/students/students.routes";
import { careersRoutes } from "./modules/careers/careers.routes";
import { assessmentsRoutes } from "./modules/assessments/assessments.routes";
import { simulationsRoutes } from "./modules/simulations/simulations.routes";
import { challengesRoutes } from "./modules/challenges/challenges.routes";
import { recommendationsRoutes } from "./modules/recommendations/recommendations.routes";
import { behaviorRoutes } from "./modules/behavior/behavior.routes";
import { adminRoutes } from "./modules/admin/admin.routes";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

export function createApp(): Express {
  const app = express();

  // Security & Utility Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "healthy", service: "istilham-backend", timestamp: new Date().toISOString() });
  });

  // API router registry function
  const registerRoutes = (prefix: string) => {
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/students`, studentsRoutes);
    app.use(`${prefix}/careers`, careersRoutes);
    app.use(`${prefix}/assessments`, assessmentsRoutes);
    app.use(`${prefix}/simulations`, simulationsRoutes);
    app.use(`${prefix}/challenges`, challengesRoutes);
    app.use(`${prefix}/recommendations`, recommendationsRoutes);
    app.use(`${prefix}/behavior`, behaviorRoutes);
    app.use(`${prefix}/admin`, adminRoutes);
  };

  // Mount under both /api and /api/v1 for backwards/forwards compatibility
  registerRoutes("/api");
  registerRoutes("/api/v1");

  // Catch-all 404 & Global Error Handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
