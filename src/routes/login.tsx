import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { authService } from "@/services/mockAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | استلهام" },
      { name: "description", content: "سجّل دخولك إلى منصة استلهام لمتابعة تقييمك ومحاكاتك المهنية." },
      { property: "og:title", content: "تسجيل الدخول | استلهام" },
      { property: "og:description", content: "ادخل إلى حسابك لمتابعة رحلتك المهنية على منصة استلهام." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("ahmed@student.sa");
  const [password, setPassword] = useState("Student@1234!");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!email.includes("@")) nextErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    if (password.length < 6) nextErrors.password = "كلمة المرور يجب ألا تقل عن ٦ أحرف";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const user = await authService.login(email, password);
      toast.success(`مرحبًا بعودتك، ${user.name}`);
      navigate({ to: user.role === "admin" ? "/admin" : "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="أدخل بياناتك للمتابعة إلى لوحة التحكم الخاصة بك."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link to="/register" className="font-bold text-teal hover:underline">
            إنشاء حساب جديد
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-navy">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-turquoise focus:ring-2 focus:ring-turquoise/25"
            placeholder="name@example.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="text-xs font-semibold text-destructive">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-navy">
              كلمة المرور
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-teal hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-turquoise focus:ring-2 focus:ring-turquoise/25"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? <p className="text-xs font-semibold text-destructive">{errors.password}</p> : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          تسجيل الدخول
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setEmail("ahmed@student.sa");
              setPassword("Student@1234!");
              setErrors({});
            }}
            className="rounded-xl border border-teal/30 bg-mint-soft/50 px-3 py-2 text-center text-xs font-bold text-navy transition hover:bg-mint-soft hover:border-teal"
          >
            🎓 تعبئة حساب الطالب
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@istilham.sa");
              setPassword("Admin@1234!");
              setErrors({});
            }}
            className="rounded-xl border border-navy/20 bg-navy/5 px-3 py-2 text-center text-xs font-bold text-navy transition hover:bg-navy/10 hover:border-navy/40"
          >
            🛡️ تعبئة حساب الإدارة
          </button>
        </div>

        <div className="space-y-2 rounded-xl bg-card border border-border/80 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="flex items-center justify-between">
            <span className="font-semibold text-navy">🎓 حساب الطالب:</span>
            <span className="font-mono text-[11px] text-navy font-bold">ahmed@student.sa</span>
          </p>
          <p className="flex items-center justify-between border-t border-border/50 pt-1.5">
            <span className="font-semibold text-navy">🛡️ حساب الإدارة:</span>
            <span className="font-mono text-[11px] text-navy font-bold">admin@istilham.sa</span>
          </p>
          <p className="text-[11px] text-muted-foreground text-center pt-1 border-t border-border/50">
            كلمة مرور الطالب: <span className="font-mono font-bold text-navy">Student@1234!</span> | الإدارة: <span className="font-mono font-bold text-navy">Admin@1234!</span>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
