import { request, setToken, removeToken, USER_STORAGE_KEY } from "./apiClient";
import type { AuthUser } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await request<{
      token: string;
      user: { id: string; name: string; email: string; role: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const user: AuthUser = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      role: res.user.role.toLowerCase() as "student" | "admin",
    };

    setToken(res.token);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  async register(
    name: string,
    email: string,
    password = "Password123!",
    educationLevel?: string
  ): Promise<AuthUser> {
    const res = await request<{
      token: string;
      user: { id: string; name: string; email: string; role: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        educationLevel,
      }),
    });

    const user: AuthUser = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      role: res.user.role.toLowerCase() as "student" | "admin",
    };

    setToken(res.token);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return { message: `تم إرسال رابط استعادة كلمة المرور إلى ${email}` };
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  updateLocalUser(updatedFields: Partial<AuthUser>): AuthUser | null {
    if (typeof window === "undefined") return null;
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updatedFields };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("istilham-user-updated", { detail: updated }));
    return updated;
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    } finally {
      removeToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("istilham-user-updated", { detail: null }));
      }
    }
  },
};

