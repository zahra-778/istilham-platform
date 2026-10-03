import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Lock, LogIn, UserPlus, ShieldAlert, ArrowRight } from "lucide-react";
import { authService } from "@/services/mockAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/shared/Logo";

export function RequireAuth({
  children,
  role = "any",
}: {
  children: ReactNode;
  role?: "any" | "admin" | "student";
}) {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Case 1: Not logged in at all
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="mb-6">
          <Logo size="lg" />
        </div>
        <div className="w-full max-w-md card-surface p-8 text-center space-y-6 shadow-xl border border-border">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-mint-soft text-teal">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-navy sm:text-2xl">
              تسجيل الدخول مطلوب
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              يرجى تسجيل الدخول إلى حسابك للوصول إلى هذه الصفحة واستكمال رحلتك المهنية على منصة استلهام.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-bold text-white transition hover:bg-turquoise shadow-md"
            >
              <LogIn className="h-4 w-4" />
              تسجيل الدخول الآن
            </Link>

            <Link
              to="/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-navy transition hover:bg-accent"
            >
              <UserPlus className="h-4 w-4 text-teal" />
              إنشاء حساب جديد
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-navy pt-2"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Admin required but logged in as student
  if (role === "admin" && currentUser.role !== "admin") {
    return (
      <AppShell title="غير مصرح" breadcrumbs={[{ label: "لوحة التحكم", to: "/dashboard" }, { label: "الإدارة" }]}>
        <div className="card-surface mx-auto max-w-lg flex flex-col items-center justify-center gap-5 p-10 text-center shadow-xl">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-navy sm:text-xl">هذه الصفحة مخصصة لمدراء النظام فقط</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              أنت مسجل حالياً بحساب طالب. يرجى تسجيل الدخول بحساب مسؤول للوصول إلى أدوات إدارة النظام والتخصصات.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="rounded-xl bg-teal px-5 py-2.5 text-xs font-bold text-white hover:bg-turquoise transition"
            >
              الذهاب للوحة تحكم الطالب
            </button>
            <button
              onClick={() => {
                authService.logout();
                navigate({ to: "/login" });
              }}
              className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-navy hover:bg-accent transition"
            >
              تسجيل الدخول كمسؤول
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return <>{children}</>;
}
