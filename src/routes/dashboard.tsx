import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Gamepad2,
  Sparkles,
  UserCheck,
  Play,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { SkillBar } from "@/components/shared/SkillBar";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { studentsService } from "@/services/mockStudents";
import { recommendationsService } from "@/services/mockRecommendations";
import { authService } from "@/services/mockAuth";
import { SKILL_LABELS, type SkillKey } from "@/types";
import { toArabicNumber, toArabicPercent } from "@/utils/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم الطالب | استلهام" },
      { name: "description", content: "تابع تقدمك في التقييم والمحاكاة المهنية وتخصصاتك المقترحة." },
      { property: "og:title", content: "لوحة تحكم الطالب | استلهام" },
      { property: "og:description", content: "ملخص شامل لتقدمك المهني ونتائج محاكاتك." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate({ to: "/admin" });
    }
  }, [user, navigate]);

  const studentQuery = useQuery({ queryKey: ["student"], queryFn: studentsService.getCurrentStudent, enabled: Boolean(user && user.role !== "admin") });
  const activitiesQuery = useQuery({ queryKey: ["activities"], queryFn: studentsService.getActivities, enabled: Boolean(user) });
  const rankingQuery = useQuery({ queryKey: ["ranking"], queryFn: recommendationsService.getRanking, enabled: Boolean(user) });

  const student = studentQuery.data;

  return (
    <RequireAuth>
      <AppShell
        title="لوحة تحكم الطالب"
        subtitle="متابعة تقدمك في رحلة الإرشاد المهني"
        breadcrumbs={[{ label: "الرئيسية", to: "/" }, { label: "لوحة التحكم" }]}
      actions={
        <Link
          to="/simulations"
          className="hidden items-center gap-2 rounded-xl bg-teal px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise sm:inline-flex"
        >
          <Play className="h-4 w-4" />
          بدء محاكاة جديدة
        </Link>
      }
    >
      {studentQuery.isLoading ? (
        <LoadingState />
      ) : studentQuery.isError || !student ? (
        <ErrorState />
      ) : (
        <div className="space-y-6">
          <section className="card-surface relative overflow-hidden bg-navy p-6 sm:p-8">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-turquoise/20 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-turquoise">مرحبًا بعودتك</p>
                <h2 className="mt-2 text-2xl font-extrabold text-navy-foreground sm:text-3xl">{student.name}</h2>
                <p className="text-balance-ar mt-3 max-w-xl text-sm text-navy-foreground/75">
                  أنت على بعد خطوة واحدة من إكمال ملفك المهني. أكمل محاكاة الأمن السيبراني لرفع دقة الترشيحات الخاصة بك.
                </p>
              </div>
              <Link
                to="/simulations"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-turquoise px-5 py-3 text-sm font-bold text-navy transition-colors hover:bg-mint"
              >
                بدء محاكاة جديدة
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="نسبة إكمال التقييم"
              value={toArabicPercent(student.assessmentProgress)}
              hint="بقي قسم واحد"
              icon={ClipboardList}
            />
            <StatCard
              label="المحاكاة المكتملة"
              value={toArabicNumber(student.completedSimulations)}
              hint="+٢ هذا الأسبوع"
              icon={Gamepad2}
            />
            <StatCard
              label="مستوى اكتمال الملف المهني"
              value={toArabicPercent(student.profileCompletion)}
              hint="ملف شبه مكتمل"
              icon={UserCheck}
            />
            <StatCard
              label="أعلى نسبة توافق"
              value={toArabicPercent(rankingQuery.data?.[0]?.score ?? 91)}
              hint={rankingQuery.data?.[0]?.name ?? "هندسة البرمجيات"}
              icon={Sparkles}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="card-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-navy">مؤشراتك السلوكية</h3>
                <Link to="/profile" className="text-xs font-bold text-teal hover:underline">
                  عرض الملف الكامل
                </Link>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {(Object.keys(student.skills) as SkillKey[]).map((key) => (
                  <SkillBar key={key} label={SKILL_LABELS[key]} value={student.skills[key]} />
                ))}
              </div>
            </div>

            <div className="card-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-navy">التخصصات المقترحة</h3>
                <Link to="/recommendations" className="text-xs font-bold text-teal hover:underline">
                  عرض الكل
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {(rankingQuery.data ?? []).slice(0, 5).map((item, index) => (
                  <Link
                    key={item.careerId}
                    to="/careers/$careerId"
                    params={{ careerId: item.careerId }}
                    className="flex items-center gap-3 rounded-2xl border border-border p-3.5 transition-colors hover:border-turquoise hover:bg-mint-soft/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint-soft text-sm font-extrabold text-teal">
                      {toArabicNumber(index + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-navy">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">نسبة التوافق {toArabicPercent(item.score)}</span>
                    </span>
                    <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-teal" style={{ width: `${item.score}%` }} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="card-surface p-6">
            <h3 className="text-lg font-bold text-navy">آخر الأنشطة</h3>
            <ul className="mt-5 space-y-4">
              {(activitiesQuery.data ?? []).map((activity) => (
                <li key={activity.id} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint-soft">
                    <Activity className="h-4 w-4 text-teal" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{activity.date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </AppShell>
    </RequireAuth>
  );
}
