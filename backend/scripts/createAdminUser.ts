import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Add connect_timeout to DATABASE_URL if not present
let dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl.includes("connect_timeout")) {
  dbUrl += (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=30";
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function runWithRetry(fn: () => Promise<void>, retries = 5, delayMs = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Attempt ${i} of ${retries}...`);
      await fn();
      return;
    } catch (err: any) {
      console.warn(`Attempt ${i} failed: ${err.message}`);
      if (i === retries) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

async function createAdmin() {
  const email = "istilham29@gmail.com".toLowerCase().trim();
  const name = "زهره حسين";
  const tempPassword = "Istilham@2026!";

  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "ADMIN",
      passwordHash,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("SUCCESS! Admin user created/updated:", {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tempPassword,
  });
}

runWithRetry(createAdmin)
  .then(() => console.log("Done!"))
  .catch((err) => console.error("Final error:", err))
  .finally(async () => {
    await prisma.$disconnect();
  });
