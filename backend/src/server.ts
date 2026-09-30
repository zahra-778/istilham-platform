import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { aiService } from "./services/ai.service";

const app = createApp();
const PORT = env.PORT || 4000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Istilham Backend Server is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);

  if (aiService.isConfigured()) {
    console.log(`🤖 Checking Istilham AI Microservice connection...`);
    const health = await aiService.checkAiHealth();
    if (health.status === "healthy") {
      console.log(`✅ AI Microservice is ONLINE at: ${health.url}`);
    } else {
      console.warn(`⚠️ AI Microservice warning (${health.status}) at: ${health.url}`);
      console.warn(`   Backend will use the internal recommendation engine as fallback.`);
    }
  } else {
    console.log(`ℹ️ Istilham AI Microservice not configured. Running with internal recommendation engine.`);
  }
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database disconnected. Process exited.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
