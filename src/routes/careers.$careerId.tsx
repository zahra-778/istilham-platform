import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  CheckCircle,
  Compass,
  Play,
  Sparkles,
  TrendingUp,
  UserCheck,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { recommendationsService } from "@/services/mockRecommendations";
import { toArabicNumber, toArabicPercent } from "@/utils/format";

interface CareerDetail {
  id?: string;
  nameAr: string;
  descriptionAr?: string;
  aboutAr?: string;
  requiredSkills?: string[];
  traits?: string[];
  jobs?: string[];
  growthSkills?: string[];
  nextSteps?: string[];
}

interface CareerDetailData {
  careerId: string;
  name: string;
  score: number;
  shortDescription?: string;
  strengths?: string[];
  reason?: string;
  compatibilityTier?: string;
  career?: CareerDetail;
  simulationSlug?: string;
  indicatorAnalysis?: any[];
}

export const Route = createFileRoute("/careers/$careerId")({
  head: () => ({
    meta: [
      { title: "تفاصيل المسار والتخصص المهني | استلهام" },
      { name: "description", content: "دليل شامل حول طبيعة التخصص والمهارات المطلوبة والفرص الوظيفية المستقبلية." },
    ],
  }),
  component: CareerDetailPage,
});

function CareerDetailPage() {
  const { careerId } = Route.useParams();

  const compatQuery = useQuery<CareerDetailData>({
    queryKey: ["careerCompatibility", careerId],
    queryFn: () => recommendationsService.getForCareer(careerId) as Promise<CareerDetailData>,
  });

  if (compatQuery.isLoading) {
    return (
      <AppShell
        title="جارٍ تحميل التخصص..."
        breadcrumbs={[
          { label: "التوصيات المهنية", to: "/recommendations" },
          { label: "..." },
        ]}
      >
        <LoadingState label="جارٍ تحميل تفاصيل التخصص ونسبة التوافق..." />
      </AppShell>
    );
  }

  if (compatQuery.isError || !compatQuery.data) {
    return (
      <AppShell
        title="خطأ في تحميل التخصص"
        breadcrumbs={[
          { label: "التوصيات المهنية", to: "/recommendations" },
          { label: "غير متوفر" },
        ]}
      >
        <ErrorState description="لم يتم العثور على التخصص أو تعذّر تحميل بيانات التوافق." />
      </AppShell>
    );
  }

  const compat = compatQuery.data;
  const career = compat.career;

  const careerName    = career?.nameAr ?? compat.name;
  const subtitle      = career?.descriptionAr ?? compat.shortDescription ?? "";
  const tier          = compat.score >= 80 ? "توافق مرتفع" : compat.score >= 65 ? "توافق متوسط" : "توافق منخفض";
  const requiredSkills: string[] = career?.requiredSkills ?? [];
  const traits: string[]         = career?.traits ?? [];
  const jobs: string[]           = career?.jobs ?? [];
  const growthSkills: string[]   = career?.growthSkills ?? [];
  const nextSteps: string[]      = career?.nextSteps ?? [];
  const strengths: string[]      = compat.strengths ?? [];
  const simulationSlug           = compat.simulationSlug;

  return (
    <AppShell
      title={careerName}
      subtitle={subtitle}
      breadcrumbs={[
        { label: "التوصيات المهنية", to: "/recommendations" },
        { label: careerName },
      ]}
      actions={
        simulationSlug ? (
          <Link
            to="/simulations/$simulationId"
            params={{ simulationId: simulationSlug }}
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-turquoise shadow-xs"
          >
            <Play className="h-3.5 w-3.5" />
            بدء محاكاة {careerName}
          </Link>
        ) : null
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Hero */}
        <section className="card-surface relative overflow-hidden bg-navy p-6 sm:p-8 text-navy-foreground">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-turquoise/20 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-turquoise">
                <Compass className="h-4 w-4" />
                <span>دليل المسار المهني</span>
              </div>
              <h2 className="text-2xl font-extrabold sm:text-3xl text-navy-foreground">{careerName}</h2>
              <p className="text-balance-ar max-w-2xl text-sm leading-relaxed text-navy-foreground/80">
                {career?.aboutAr ?? subtitle}
              </p>
              {strengths.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {strengths.map((s, i) => (
                    <span key={`${s}-${i}`} className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-turquoise">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-5 backdrop-blur-xs border border-white/10 text-center shrink-0">
              <span className="text-3xl font-black text-turquoise">{toArabicPercent(compat.score)}</span>
              <span className="mt-1 text-xs text-navy-foreground/70">نسبة توافقك مع التخصص</span>
              <span className="mt-2 rounded-full bg-mint-soft/20 px-2.5 py-0.5 text-[11px] font-bold text-turquoise">
                {compat.compatibilityTier ?? tier}
              </span>
            </div>
          </div>
        </section>

        {/* Skills & Traits */}
        {(requiredSkills.length > 0 || traits.length > 0) && (
          <section className="grid gap-6 md:grid-cols-2">
            {requiredSkills.length > 0 && (
              <div className="card-surface p-6">
                <div className="flex items-center gap-2.5 border-b border-border pb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-teal">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-navy">المهارات الأساسية المطلوبة</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {requiredSkills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2.5 text-sm font-medium text-navy">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {traits.length > 0 && (
              <div className="card-surface p-6">
                <div className="flex items-center gap-2.5 border-b border-border pb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-teal">
                    <UserCheck className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-navy">السمات الشخصية المناسبة</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {traits.map((trait) => (
                    <span key={trait} className="rounded-xl border border-turquoise/30 bg-mint-soft/60 px-3.5 py-1.5 text-xs font-bold text-teal">
                      {trait}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  تساعد هذه السمات في التفوق والاستمتاع ببيئة العمل والتحديات اليومية الخاصة بهذا المجال.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Jobs & Growth */}
        {(jobs.length > 0 || growthSkills.length > 0) && (
          <section className="grid gap-6 md:grid-cols-2">
            {jobs.length > 0 && (
              <div className="card-surface p-6">
                <div className="flex items-center gap-2.5 border-b border-border pb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-teal">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-navy">المسميات والفرص الوظيفية</h3>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {jobs.map((job) => (
                    <div key={job} className="flex items-center gap-2 rounded-xl bg-background border border-border/80 p-3 text-xs font-bold text-navy">
                      <span className="h-2 w-2 rounded-full bg-teal shrink-0" />
                      <span>{job}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {growthSkills.length > 0 && (
              <div className="card-surface p-6">
                <div className="flex items-center gap-2.5 border-b border-border pb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-teal">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-navy">مهارات التطور المستقبلي</h3>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">مهارات تصنع فارقًا في سرعة ترقيتك وتميزك المهني:</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {growthSkills.map((growth) => (
                    <span key={growth} className="rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-navy">
                      {growth}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <section className="card-surface p-6">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-teal">
                <Target className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-navy">خطة الخطوات القادمة المقترحة لك</h3>
            </div>
            <div className="mt-4 space-y-3">
              {nextSteps.map((step, idx) => (
                <div key={step} className="flex items-start gap-3 rounded-xl bg-background border border-border p-3.5">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal text-xs font-extrabold text-primary-foreground shrink-0">
                    {toArabicNumber(idx + 1)}
                  </span>
                  <p className="text-sm font-semibold text-navy leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Simulation CTA */}
        {simulationSlug && (
          <section className="card-surface p-6 sm:p-8 bg-linear-to-l from-navy to-navy/95 text-navy-foreground">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-turquoise">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>محاكاة تفاعلية واقعية</span>
                </div>
                <h3 className="text-xl font-extrabold text-navy-foreground">
                  جرّب يومًا حقيقيًا في حياة {careerName}
                </h3>
                <p className="text-xs text-navy-foreground/75 max-w-xl">
                  اختبر قدراتك في سيناريوهات حقيقية وقِس توافقك الفعلي مع هذا المسار المهني.
                </p>
              </div>
              <Link
                to="/simulations/$simulationId"
                params={{ simulationId: simulationSlug }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-turquoise px-6 py-3 text-sm font-bold text-navy hover:bg-mint transition-colors shrink-0"
              >
                <Play className="h-4 w-4" />
                ابدأ المحاكاة الآن
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
