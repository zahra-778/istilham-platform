import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { authService } from "@/services/mockAuth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "استعادة كلمة المرور | استلهام" },
      { name: "description", content: "استعد كلمة مرور حسابك في منصة استلهام عبر البريد الإلكتروني." },
      { property: "og:title", content: "استعادة كلمة المرور | استلهام" },
      { property: "og:description", content: "أرسل رابط استعادة كلمة المرور إلى بريدك الإلكتروني." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    setError("");
    setLoading(true);
    const result = await authService.requestPasswordReset(email);
    setLoading(false);
    setSent(true);
    toast.success(result.message);
  };

  return (
    <AuthLayout
      title="نسيت كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور."
      footer={
        <Link to="/login" className="font-bold text-teal hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      }
    >
      {sent ? (
        <div className="card-surface flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-9 w-9 text-teal" />
          <p className="text-base font-bold text-navy">تم إرسال الرابط بنجاح</p>
          <p className="text-sm text-muted-foreground">
            راجع بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.
          </p>
        </div>
      ) : (
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
            />
            {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            إرسال الرابط
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
