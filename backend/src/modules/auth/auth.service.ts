import { AuthRepository } from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import type { UserRole } from "../../types/common";

export class AuthService {
  private repo = new AuthRepository();

  async register(data: {
    name: string;
    email: string;
    password: string;
    educationLevel?: string;
    school?: string;
    city?: string;
  }) {
    const existing = await this.repo.findByEmail(data.email.toLowerCase().trim());
    if (existing) {
      throw new Error("البريد الإلكتروني مسجل مسبقًا.");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await this.repo.createUser({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      educationLevel: data.educationLevel,
      school: data.school,
      city: data.city,
    });

    const token = signToken({
      sub: user.id,
      role: user.role as UserRole,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.repo.findByEmail(data.email.toLowerCase().trim());
    if (!user || !user.isActive) {
      throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }

    const token = signToken({
      sub: user.id,
      role: user.role as UserRole,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new Error("المستخدم غير موجود.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile,
      behavioralProfile: user.behavioralProfile,
    };
  }
}
