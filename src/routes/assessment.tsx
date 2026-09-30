import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState, ErrorState } from "@/components/shared/States";
import { SkillBar } from "@/components/shared/SkillBar";
import { assessmentsService, type AssessmentOutcome } from "@/services/mockAssessments";
import { SKILL_LABELS, type SkillKey } from "@/types";
import { toArabicNumber, toArabicPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "التقييم المبدئي | استلهام" },
      { name: "description", content: "قيّم أسلوب تفكيرك وطريقة عملك عبر تقييم مبدئي قصير ومتعدد المراحل." },
      { property: "og:title", content: "التقييم المبدئي | استلهام" },
      { property: "og:description", content: "أسئلة قصيرة تقيس مهاراتك الأساسية قبل بدء المحاكاة." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ["assessment-questions"],
    queryFn: assessmentsService.getQuestions,
  });

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [outcome, setOutcome] = useState<AssessmentOutcome | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => assessmentsService.submit({ answers }),
    onSuccess: (data) => {
      setOutcome(data);
      toast.success("تم إكمال التقييم المبدئي بنجاح");
    },
    onError: () => toast.error("تعذّر إرسال إجاباتك، حاول مرة أخرى"),
  });

  if (isLoading) {
    return (
      <AppShell title="التقييم المبدئي" breadcrumbs={[{ label: "لوحة التحكم", to: "/dashboard" }, { label: "التقييم" }]}>
        <LoadingState label="جارٍ تجهيز أسئلة التقييم..." />
      </AppShell>
    );
  }

  if (isError || !questions) {
    return (
      <AppShell title="التقييم المبدئي">
        <ErrorState />
      </AppShell>
    );
  }

  const total = questions.length;
  const current = questions[step]!;
  const selected = answers[current.id];
  const progress = Math.round(((step + (selected ? 1 : 0)) / total) * 100);

  if (outcome) {
    return (
      <AppShell
        title="نتيجة التقييم المبدئي"
        subtitle="ملخص مهاراتك الأساسية"
        breadcrumbs={[{ label: "لوحة التحكم", to: "/dashboard" }, { label: "التقييم المبدئي" }]}
      >
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="card-surface flex flex-col items-center gap-3 p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-teal" />
            <h2 className="text-xl font-extrabold text-navy">اكتمل التقييم المبدئي</h2>
            <p className="text-balance-ar max-w-lg text-sm text-muted-foreground">{outcome.summary}</p>
          </div>

          <div className="card-surface p-6">
            <h3 className="text-lg font-bold text-navy">مؤشرات مهاراتك</h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {(Object.keys(outcome.scores) as SkillKey[]).map((key) => (
                <SkillBar key={key} label={SKILL_LABELS[key]} value={outcome.scores[key]} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/simulations"
              className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-turquoise"
            >
              ابدأ المحاكاة المهنية
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-navy hover:bg-accent"
            >
              عرض النتائج والتوصيات
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="التقييم المبدئي"
      subtitle={`السؤال ${toArabicNumber(step + 1)} من ${toArabicNumber(total)}`}
      breadcrumbs={[{ label: "لوحة التحكم", to: "/dashboard" }, { label: "التقييم المبدئي" }]}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-navy">{current.section}</span>
            <span className="font-bold text-teal">{toArabicPercent(progress)}</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-teal transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="card-surface p-6 sm:p-8">
          <h2 className="text-balance-ar text-xl font-extrabold text-navy">{current.text}</h2>
          <div className="mt-6 space-y-3">
            {current.options.map((option) => {
              const active = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: option.id }))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-right text-sm font-semibold transition-all",
                    active
                      ? "border-turquoise bg-mint-soft/70 text-navy shadow-[var(--shadow-card)]"
                      : "border-border bg-card text-navy hover:border-turquoise/60 hover:bg-accent/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                      active ? "border-teal bg-teal" : "border-border",
                    )}
                  >
                    {active ? <span className="h-1.5 w-1.5 rounded-full bg-card" /> : null}
                  </span>
                  <span className="min-w-0">{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-accent disabled:opacity-40"
          >
            <ArrowRight className="h-4 w-4" />
            السابق
          </button>

          {step === total - 1 ? (
            <button
              type="button"
              disabled={!selected || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise disabled:opacity-50"
            >
              {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              إنهاء التقييم
            </button>
          ) : (
            <button
              type="button"
              disabled={!selected}
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise disabled:opacity-50"
            >
              التالي
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
