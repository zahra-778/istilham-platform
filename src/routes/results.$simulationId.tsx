import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BarChart2,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
  TrendingUp,
  Brain,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SkillBar } from "@/components/shared/SkillBar";
import { StatCard } from "@/components/shared/StatCard";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { simulationsService } from "@/services/mockSimulations";
import { authService } from "@/services/mockAuth";
import { getCareer } from "@/data/careers";
import { SKILL_LABELS, type SkillKey } from "@/types";
import { toArabicNumber, toArabicPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results/$simulationId")({
  head: () => ({
    meta: [
      { title: "التقرير والتحليل السلوكي للمحاكاة | استلهام" },
      { name: "description", content: "استعرض نتائج التحليل السلوكي ومؤشرات مهاراتك المستخلصة من المحاكاة المهنية." },
    ],
  }),
  component: SimulationResultsPage,
});

function SimulationResultsPage() {
  const { simulationId } = Route.useParams();
  const user = authService.getCurrentUser();

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["simulationResult", simulationId],
    queryFn: () => simulationsService.getResult(simulationId),
    enabled: Boolean(user),
  });

  const career = result ? getCareer(result.careerId) : null;

  if (isLoading) {
    return (
      <RequireAuth>
        <AppShell
          title="نتائج المحاكاة"
          breadcrumbs={[
            { label: "المحاكاة المهنية", to: "/simulations" },
            { label: "جاري تحليل النتائج..." },
          ]}
        >
          <LoadingState label="جاري استخراج المؤشرات السلوكية وتحليل القرارات..." />
        </AppShell>
      </RequireAuth>
    );
  }

  if (isError || !result) {
    return (
      <RequireAuth>
        <AppShell
          title="تعذر تحميل النتائج"
          breadcrumbs={[
            { label: "المحاكاة المهنية", to: "/simulations" },
            { label: "خطأ" },
          ]}
        >
          <ErrorState description="لم يتم العثور على تقرير نتائج لهذه المحاكاة." />
        </AppShell>
      </RequireAuth>
    );
  }

  const indicatorEntries = Object.entries(result.indicators) as [SkillKey, number][];
  const sortedIndicators = [...indicatorEntries].sort((a, b) => b[1] - a[1]);
  const topStrengths = sortedIndicators.slice(0, 3);
  const areasForGrowth = sortedIndicators.slice(-2);

  // Calculate average score
  const avgScore = Math.round(
    indicatorEntries.reduce((sum, [, val]) => sum + val, 0) / (indicatorEntries.length || 1),
  );

  return (
    <RequireAuth>
      <AppShell
        title="التقرير السلوكي للمحاكاة"
        subtitle={`نتائج أدائك في ${career ? career.name : "المحاكاة المهنية"}`}
        breadcrumbs={[
          { label: "المحاكاة المهنية", to: "/simulations" },
          { label: "تقرير النتائج" },
        ]}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/simulations/$simulationId"
            params={{ simulationId }}
            className="hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-navy transition-colors hover:bg-accent sm:inline-flex"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            إعادة المحاكاة
          </Link>
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-turquoise shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            التوصيات المهنية
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Hero Performance Header Banner */}
        <section className="card-surface relative overflow-hidden bg-navy p-6 sm:p-8 text-navy-foreground">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-turquoise/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-mint/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-turquoise">
                <Award className="h-4 w-4" />
                <span>تم إكمال التقييم والمحاكاة بنجاح</span>
              </div>
              <h2 className="text-2xl font-extrabold sm:text-3xl text-navy-foreground">
                أداء متميز في محاكاة {career?.name || "المسار المهني"}
              </h2>
              <p className="text-balance-ar max-w-2xl text-sm leading-relaxed text-navy-foreground/80">
                {result.summary}
              </p>
            </div>

            {/* Circular Performance Indicator */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-5 backdrop-blur-xs border border-white/10 text-center">
              <div className="relative grid h-24 w-24 place-items-center rounded-full border-4 border-turquoise bg-navy shadow-inner">
                <div className="text-center">
                  <span className="text-2xl font-extrabold text-turquoise">{toArabicPercent(avgScore)}</span>
                  <span className="block text-[10px] text-navy-foreground/70">متوسط الأداء</span>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold text-turquoise">توافق سلوكي واعد</p>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="القرارات المتميزة"
            value={`${toArabicNumber(result.correctAnswers)} / ${toArabicNumber(result.totalChallenges)}`}
            hint="خيارات عالية الفعالية"
            icon={CheckCircle2}
          />
          <StatCard
            label="الوقت المستغرق"
            value={`${toArabicNumber(result.totalTimeMinutes)} دقيقة`}
            hint="سرعة استجابة متزنة"
            icon={Clock}
          />
          <StatCard
            label="أبرز مهارة سلوكية"
            value={topStrengths[0] ? SKILL_LABELS[topStrengths[0][0]] : "حل المشكلات"}
            hint={topStrengths[0] ? `بنسبة ${toArabicPercent(topStrengths[0][1])}` : undefined}
            icon={TrendingUp}
          />
          <StatCard
            label="حالة التقرير"
            value="مكتمل"
            hint={result.completedAt}
            icon={FileText}
          />
        </section>

        {/* Behavioral Indicators & Detailed Skills Breakdown */}
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="card-surface p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-navy">المؤشرات السلوكية المقاسة</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  تم استخلاص هذه الدرجات من اختياراتك وزمن اتخاذ القرارات أثناء المحاكاة
                </p>
              </div>
              <BarChart2 className="h-5 w-5 text-teal shrink-0" />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {indicatorEntries.map(([key, value]) => (
                <SkillBar
                  key={key}
                  label={SKILL_LABELS[key]}
                  value={value}
                  description={
                    value >= 85
                      ? "أداء متقدم ومتقن"
                      : value >= 70
                        ? "مستوى جيد مع إمكانية التطور"
                        : "بحاجة إلى تعزيز وتدريب"
                  }
                />
              ))}
            </div>
          </div>

          {/* Key Takeaways & Strengths */}
          <div className="space-y-6">
            <div className="card-surface p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-navy">
                <Sparkles className="h-4 w-4 text-teal" />
                أبرز نقاط القوة المرصودة
              </h3>
              <div className="mt-4 space-y-3">
                {topStrengths.map(([key, val], i) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-xl bg-mint-soft/60 p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal text-xs font-bold text-primary-foreground">
                        {toArabicNumber(i + 1)}
                      </span>
                      <span className="text-sm font-bold text-navy">{SKILL_LABELS[key]}</span>
                    </div>
                    <span className="text-sm font-extrabold text-teal">{toArabicPercent(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-surface p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-navy">
                <Brain className="h-4 w-4 text-turquoise" />
                فرص النمو والتطوير
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">
                مهارات يمكنك صقلها لزيادة جاهزيتك المهنية:
              </p>
              <div className="mt-4 space-y-3">
                {areasForGrowth.map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-3"
                  >
                    <span className="text-sm font-bold text-navy">{SKILL_LABELS[key]}</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {toArabicPercent(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Action Next Steps CTA */}
        <section className="card-surface p-6 sm:p-8 bg-linear-to-br from-mint-soft/30 via-card to-mint-soft/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-navy">ما هي خطوتك التالية؟</h3>
              <p className="text-sm text-muted-foreground max-w-xl text-balance-ar">
                يمكنك الاطلاع على قائمة التخصصات المرتبة بناءً على هذه النتائج، أو استكشاف تفاصيل المسار الوظيفي لـ{" "}
                {career?.name || "هذا التخصص"}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {career && (
                <Link
                  to="/careers/$careerId"
                  params={{ careerId: career.id }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-navy hover:bg-accent transition-colors shadow-xs"
                >
                  <Compass className="h-4 w-4 text-teal" />
                  تفاصيل مسار {career.name}
                </Link>
              )}
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-turquoise transition-colors shadow-xs"
              >
                عرض التوصيات المهنية
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
    </RequireAuth>
  );
}
