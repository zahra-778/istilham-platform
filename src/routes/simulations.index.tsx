import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Layers, Play, Signal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { simulationsService } from "@/services/mockSimulations";
import { toArabicNumber, toArabicPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulations/")({
  head: () => ({
    meta: [
      { title: "المحاكاة المهنية | استلهام" },
      { name: "description", content: "استعرض المحاكاة المهنية المتاحة في مختلف التخصصات وابدأ التجربة." },
      { property: "og:title", content: "المحاكاة المهنية | استلهام" },
      { property: "og:description", content: "جرّب مواقف عمل واقعية في تخصصات متعددة." },
    ],
  }),
  component: SimulationsPage,
});

const difficultyStyles: Record<string, string> = {
  مبتدئ: "bg-mint-soft text-teal",
  متوسط: "bg-mint text-navy",
  متقدم: "bg-navy text-navy-foreground",
};

function SimulationsPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["simulations"], queryFn: simulationsService.list });

  return (
    <AppShell
      title="المحاكاة المهنية"
      subtitle="اختر تخصصًا وعش تجربة عمل واقعية"
      breadcrumbs={[{ label: "لوحة التحكم", to: "/dashboard" }, { label: "المحاكاة المهنية" }]}
    >
      {isLoading ? (
        <LoadingState label="جارٍ تحميل المحاكاة المتاحة..." />
      ) : isError || !data ? (
        <ErrorState />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((simulation) => (
            <article
              key={simulation.id}
              className="card-surface flex flex-col p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-lg font-extrabold text-navy">{simulation.title}</h2>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold",
                    difficultyStyles[simulation.difficulty] ?? "bg-muted text-navy",
                  )}
                >
                  {simulation.difficulty}
                </span>
              </div>
              <p className="text-balance-ar mt-3 flex-1 text-sm text-muted-foreground">{simulation.description}</p>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-background p-2.5">
                  <Clock className="mx-auto h-4 w-4 text-teal" />
                  <p className="mt-1 text-[11px] font-bold text-navy">{simulation.duration}</p>
                </div>
                <div className="rounded-xl bg-background p-2.5">
                  <Layers className="mx-auto h-4 w-4 text-teal" />
                  <p className="mt-1 text-[11px] font-bold text-navy">
                    {toArabicNumber(simulation.challenges.length)} تحديات
                  </p>
                </div>
                <div className="rounded-xl bg-background p-2.5">
                  <Signal className="mx-auto h-4 w-4 text-teal" />
                  <p className="mt-1 text-[11px] font-bold text-navy">{toArabicPercent(simulation.progress)}</p>
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-teal" style={{ width: `${simulation.progress}%` }} />
              </div>

              <div className="mt-5 flex gap-2">
                <Link
                  to="/simulations/$simulationId"
                  params={{ simulationId: simulation.id }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise"
                >
                  <Play className="h-4 w-4" />
                  {simulation.progress > 0 && simulation.progress < 100
                    ? "استكمال المحاكاة"
                    : simulation.progress === 100
                      ? "إعادة المحاكاة"
                      : "ابدأ المحاكاة"}
                </Link>
                {simulation.progress === 100 ? (
                  <Link
                    to="/results/$simulationId"
                    params={{ simulationId: simulation.id }}
                    className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-accent"
                  >
                    عرض النتائج
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
