import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { authService } from "@/services/mockAuth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب | استلهام" },
      { name: "description", content: "أنشئ حسابك في منصة استلهام وابدأ رحلتك نحو اختيار التخصص المناسب." },
      { property: "og:title", content: "إنشاء حساب | استلهام" },
      { property: "og:description", content: "سجّل الآن وابدأ أول محاكاة مهنية واقعية." },
    ],
  }),
  component: RegisterPage,
});

const stages = ["الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي", "خريج"];

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", stage: "الثالث الثانوي", password: "" });
  type FieldErrors = { name?: string; email?: string; password?: string };
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (form.name.trim().length < 3) nextErrors.name = "يرجى إدخال الاسم الكامل";
    if (!form.email.includes("@")) nextErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    if (form.password.length < 6) nextErrors.password = "كلمة المرور يجب ألا تقل عن ٦ أحرف";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await authService.register(form.name, form.email);
      toast.success("تم إنشاء الحساب بنجاح، مرحبًا بك في استلهام");
      navigate({ to: "/assessment" });
    } catch {
      toast.error("تعذّر إنشاء الحساب، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-turquoise focus:ring-2 focus:ring-turquoise/25";

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="سجّل بياناتك وابدأ التقييم المبدئي خلال دقائق."
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="font-bold text-teal hover:underline">
            تسجيل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-navy">
            الاسم الكامل
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="مثال: أحمد محمد"
          />
          {errors.name ? <p className="text-xs font-semibold text-destructive">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-navy">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="name@example.com"
          />
          {errors.email ? <p className="text-xs font-semibold text-destructive">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="stage" className="text-sm font-semibold text-navy">
            المرحلة الدراسية
          </label>
          <select
            id="stage"
            value={form.stage}
            onChange={(e) => update("stage", e.target.value)}
            className={inputClass}
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-navy">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
          {errors.password ? <p className="text-xs font-semibold text-destructive">{errors.password}</p> : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إنشاء الحساب
        </button>
      </form>
    </AuthLayout>
  );
}
