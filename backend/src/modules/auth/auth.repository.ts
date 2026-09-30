import { prisma } from "../../config/prisma";
import type { Role, User } from "@prisma/client";

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        behavioralProfile: true,
      },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
    educationLevel?: string;
    school?: string;
    city?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role || "STUDENT",
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: user.id,
          educationLevel: data.educationLevel,
          school: data.school,
          city: data.city,
          profileCompletion: 25,
        },
      });

      await tx.behavioralProfile.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });
  }
}
