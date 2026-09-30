import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Sparkles,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Play,
  TrendingUp,
  Brain,
  Layers,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { recommendationsService } from "@/services/mockRecommendations";
import { simulations } from "@/data/simulations";
import { toArabicNumber, toArabicPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "التوصيات المهنية المرتبة | استلهام" },
      {
        name: "description",
        content: "قائمة التخصصات والمسارات المهنية الأكثر توافقًا مع أسلوبك السلوكي وقدراتك التحليلية.",
      },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const rankingQuery = useQuery({
    queryKey: ["recommendationsRanking"],
    queryFn: recommendationsService.getRanking,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterScore, setFilterScore] = useState<"all" | "high" | "medium">("all");

  const items = rankingQuery.data || [];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterScore === "high") return matchesSearch && item.score >= 80;
    if (filterScore === "medium") return matchesSearch && item.score >= 60 && item.score < 80;
    return matchesSearch;
  });

  const topMatch = items[0];

  return (
    <AppShell
      title="التوصيات المهنية"
      subtitle="قائمة مرتبة بأكثر التخصصات توافقًا مع مؤشراتك السلوكية"
      breadcrumbs={[
        { label: "لوحة التحكم", to: "/dashboard" },
        { label: "التوصيات المهنية" },
      ]}
    >
      {rankingQuery.isLoading ? (
        <LoadingState label="جاري حساب مصفوفة التوافق واستخراج التوصيات..." />
      ) : rankingQuery.isError || !rankingQuery.data ? (
        <ErrorState description="تعذر تحميل التوصيات المهنية في الوقت الحالي." />
      ) : (
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top Recommendation Highlight Card */}
          {topMatch && (
            <section className="card-surface relative overflow-hidden bg-navy p-6 sm:p-8 text-navy-foreground">
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-turquoise/20 blur-3xl" />
              <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-turquoise/20 px-3.5 py-1 text-xs font-bold text-turquoise">
                    <Sparkles className="h-4 w-4" />
                    <span>التخصص الأعلى توافقًا معك (المرتبة الأولى)</span>
                  </div>
                  <h2 className="text-2xl font-extrabold sm:text-3xl text-navy-foreground">{topMatch.name}</h2>
                  <p className="text-balance-ar max-w-2xl text-sm leading-relaxed text-navy-foreground/80">
                    {topMatch.reason}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(topMatch.strengths || []).map((str: any, idx: number) => {
                      const label = typeof str === "string" ? str : (str?.name_ar || str?.name || str?.indicator || `مهارة ${idx + 1}`);
                      const key = typeof str === "string" ? `${str}-${idx}` : (str?.indicator || idx);
                      return (
                        <span
                          key={key}
                          className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-turquoise"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-5 backdrop-blur-xs border border-white/10 text-center">
                  <span className="text-3xl font-black text-turquoise">{toArabicPercent(topMatch.score)}</span>
                  <span className="mt-1 text-xs text-navy-foreground/70">نسبة التوافق المقدرة</span>
                  <Link
                    to="/careers/$careerId"
                    params={{ careerId: topMatch.careerId }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-turquoise px-4 py-2 text-xs font-bold text-navy hover:bg-mint transition-colors"
                  >
                    استكشاف المسار
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Search & Filter Bar */}
          <section className="card-surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن تخصص معين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background py-2.5 pr-10 pl-4 text-sm font-medium text-navy placeholder:text-muted-foreground focus:border-teal focus:outline-hidden focus:ring-2 focus:ring-teal/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  تصفية:
                </span>
                <button
                  type="button"
                  onClick={() => setFilterScore("all")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                    filterScore === "all" ? "bg-teal text-primary-foreground" : "bg-muted text-navy hover:bg-accent",
                  )}
                >
                  الكل ({toArabicNumber(items.length)})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterScore("high")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                    filterScore === "high" ? "bg-teal text-primary-foreground" : "bg-muted text-navy hover:bg-accent",
                  )}
                >
                  توافق عالي (٨٠٪+)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterScore("medium")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                    filterScore === "medium" ? "bg-teal text-primary-foreground" : "bg-muted text-navy hover:bg-accent",
                  )}
                >
                  توافق متوسط (٦٠-٧٩٪)
                </button>
              </div>
            </div>
          </section>

          {/* Recommendations List */}
          <section className="space-y-4">
            {filteredItems.map((career, index) => {
              const matchedSim = simulations.find((s) => s.careerId === career.careerId);

              return (
                <article
                  key={career.careerId}
                  className="card-surface p-5 sm:p-6 transition-all hover:border-turquoise/50 hover:shadow-[var(--shadow-lift)]"
                >
                  <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                    {/* Rank Badge */}
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-soft text-base font-extrabold text-teal">
                        {toArabicNumber(index + 1)}
                      </span>
                    </div>

                    {/* Information & Reasoning */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-bold text-navy">{career.name}</h3>
                        <span className="rounded-full bg-mint-soft px-2.5 py-0.5 text-[11px] font-bold text-teal">
                          توافق {toArabicPercent(career.score)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{career.shortDescription}</p>
                      <p className="text-xs text-navy/75 leading-relaxed bg-background p-2.5 rounded-xl border border-border/60">
                        {career.reason}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-xs font-semibold text-muted-foreground ml-1">المهارات المتوافقة:</span>
                        {(career.strengths || []).map((str: any, idx: number) => {
                          const label = typeof str === "string" ? str : (str?.name_ar || str?.name || str?.indicator || `مهارة ${idx + 1}`);
                          const key = typeof str === "string" ? `${str}-${idx}` : (str?.indicator || idx);
                          return (
                            <span
                              key={key}
                              className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-navy"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions & Score Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row md:flex-col shrink-0">
                      <div className="w-32 hidden md:block">
                        <div className="flex justify-between text-xs font-bold text-navy mb-1">
                          <span>التوافق</span>
                          <span>{toArabicPercent(career.score)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              career.score >= 80 ? "bg-teal" : "bg-turquoise",
                            )}
                            style={{ width: `${career.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to="/careers/$careerId"
                          params={{ careerId: career.careerId }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-navy hover:bg-accent transition-colors"
                        >
                          <Compass className="h-3.5 w-3.5 text-teal" />
                          التفاصيل
                        </Link>
                        {matchedSim ? (
                          <Link
                            to="/simulations/$simulationId"
                            params={{ simulationId: matchedSim.id }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-turquoise transition-colors shadow-xs"
                          >
                            <Play className="h-3.5 w-3.5" />
                            المحاكاة
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="card-surface p-12 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <h4 className="mt-3 text-base font-bold text-navy">لم يتم العثور على نتائج</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  جرب تغيير عبارة البحث أو إزالة معايير التصفية.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
