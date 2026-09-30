import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  Award,
  Edit3,
  CheckCircle2,
  Sparkles,
  Gamepad2,
  ClipboardList,
  Compass,
  Activity,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SkillBar } from "@/components/shared/SkillBar";
import { StatCard } from "@/components/shared/StatCard";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { studentsService } from "@/services/mockStudents";
import { recommendationsService } from "@/services/mockRecommendations";
import { authService } from "@/services/mockAuth";
import { SKILL_LABELS, type SkillKey } from "@/types";
import { toArabicNumber, toArabicPercent } from "@/utils/format";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "الملف الشخصي والمهاري | استلهام" },
      { name: "description", content: "استعرض بياناتك الشخصية ومؤشراتك السلوكية وسجل أنشطتك على منصة استلهام." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const homeCrumb = isAdmin
    ? { label: "لوحة تحكم الإدارة", to: "/admin" }
    : { label: "لوحة التحكم", to: "/dashboard" };

  const studentQuery = useQuery({
    queryKey: ["studentProfile"],
    queryFn: studentsService.getCurrentStudent,
  });

  const activitiesQuery = useQuery({
    queryKey: ["studentActivities"],
    queryFn: studentsService.getActivities,
  });

  const rankingQuery = useQuery({
    queryKey: ["studentRanking"],
    queryFn: recommendationsService.getRanking,
  });

  const student = studentQuery.data;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    stage: "",
    email: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        city: student.city || "الرياض",
        stage: student.stage || "الصف الثالث الثانوي",
        email: student.email || "",
      });
    }
  }, [student]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentsService.updateProfile({
        name: formData.name,
        educationLevel: formData.stage,
        city: formData.city,
      });
      toast.success("تم تحديث بيانات الملف الشخصي بنجاح في قاعدة البيانات!");
      await studentQuery.refetch();
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || "تعذر حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  if (studentQuery.isLoading) {
    return (
      <AppShell
        title="الملف الشخصي"
        breadcrumbs={[homeCrumb, { label: "الملف الشخصي" }]}
      >
        <LoadingState label="جاري تحميل بيانات الملف الشخصي..." />
      </AppShell>
    );
  }

  if (studentQuery.isError || !student) {
    return (
      <AppShell
        title="خطأ في الملف الشخصي"
        breadcrumbs={[homeCrumb, { label: "الملف الشخصي" }]}
      >
        <ErrorState description="تعذر تحميل بيانات الملف الشخصي." />
      </AppShell>
    );
  }

  const badges = [
    { title: "مستكشف المسارات", desc: "أكمل ٥ محاكاة مهنية واقعية", icon: Compass, earned: true },
    { title: "صانع قرارات سريع", desc: "متوسط زمن اتخاذ القرار أقل من ١٥ ثانية", icon: Zap, earned: true },
    { title: "محلل بيانات واعد", desc: "حقق أكثر من ٨٥٪ في التفكير التحليلي", icon: Sparkles, earned: true },
    { title: "مثابر ومتقن", desc: "أكمل التقييم المبدئي بنسبة ١٠٠٪", icon: Award, earned: false },
  ];

  return (
    <AppShell
      title="الملف الشخصي والمهاري"
      subtitle="إدارة بياناتك ومتابعة نمو مؤشراتك السلوكية"
      breadcrumbs={[
        homeCrumb,
        { label: "الملف الشخصي" },
      ]}
      actions={
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-navy transition-colors hover:bg-accent shadow-xs"
        >
          <Edit3 className="h-3.5 w-3.5 text-teal" />
          تعديل البيانات
        </button>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Student Info Card */}
        <section className="card-surface p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-mint text-2xl font-black text-teal shadow-xs">
                  {student.name.charAt(0)}
                </span>
                <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full bg-teal text-primary-foreground text-xs font-bold shadow-xs">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-navy sm:text-2xl">{student.name}</h2>
                  <span className="rounded-full bg-mint-soft px-3 py-0.5 text-xs font-bold text-teal">
                    حساب طالب مفعل
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-teal" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-teal" />
                    {student.stage}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-teal" />
                    {student.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal" />
                    انضم في {student.joinedAt}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center justify-between sm:items-end border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
              <span className="text-xs font-semibold text-muted-foreground">اكتمال الملف الشخصي</span>
              <span className="text-2xl font-black text-teal">{toArabicPercent(student.profileCompletion)}</span>
            </div>
          </div>
        </section>

        {/* Quick KPI Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="التقييم المبدئي"
            value={toArabicPercent(student.assessmentProgress)}
            hint="مكتمل ٤ من ٥ أقسام"
            icon={ClipboardList}
          />
          <StatCard
            label="المحاكاة المنجزة"
            value={`${toArabicNumber(student.completedSimulations)} محاكاة`}
            hint="من أصل ٨ تخصصات"
            icon={Gamepad2}
          />
          <StatCard
            label="أفضل توافق تخصصي"
            value={rankingQuery.data?.[0]?.name ?? "هندسة البرمجيات"}
            hint={`بنسبة توافق ${toArabicPercent(rankingQuery.data?.[0]?.score ?? 91)}`}
            icon={Sparkles}
          />
        </section>

        {/* Behavioral Radar / Skills Profile */}
        <section className="card-surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-navy">الملف السلوكي الشامل</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                تحديث تلقائي مستمر بناءً على أدائك في مختلف المحاكيات
              </p>
            </div>
            <Link to="/simulations" className="text-xs font-bold text-teal hover:underline">
              تعزيز المهارات
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {(Object.keys(student.skills) as SkillKey[]).map((key) => (
              <SkillBar
                key={key}
                label={SKILL_LABELS[key]}
                value={student.skills[key]}
                description={
                  student.skills[key] >= 85
                    ? "نقطة قوة بارزة تميز قراراتك"
                    : student.skills[key] >= 75
                      ? "مهارة متزنة وجاهزة للتطبيق"
                      : "مجال واعد لمزيد من الممارسة"
                }
              />
            ))}
          </div>
        </section>

        {/* Badges & Achievements */}
        <section className="card-surface p-6">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-teal">
              <Award className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-navy">الأوسمة والإنجازات المهنية</h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className={cn(
                  "flex flex-col items-center rounded-2xl border p-4 text-center transition-all",
                  badge.earned
                    ? "border-turquoise/30 bg-mint-soft/30 shadow-xs"
                    : "border-border/60 bg-muted/40 opacity-50",
                )}
              >
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-2xl",
                    badge.earned ? "bg-teal text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <badge.icon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-bold text-navy">{badge.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{badge.desc}</p>
                <span className="mt-3 text-[10px] font-bold text-teal">
                  {badge.earned ? "مكتمل ✓" : "قيد الإنجاز"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Log */}
        <section className="card-surface p-6">
          <h3 className="text-base font-bold text-navy border-b border-border pb-3">سجل الأنشطة والمحاكاة</h3>
          <ul className="mt-4 divide-y divide-border">
            {(activitiesQuery.data ?? []).map((activity) => (
              <li key={activity.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-mint-soft text-teal">
                  <Activity className="h-4 w-4" />
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

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الملف الشخصي</DialogTitle>
            <DialogDescription>
              قم بتحديث معلوماتك الأكاديمية والمدينة لضمان دقة الترشيحات.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">الاسم الكامل</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-sm text-navy focus:border-teal focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-sm text-navy focus:border-teal focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">المرحلة الدراسية</label>
              <input
                type="text"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-sm text-navy focus:border-teal focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">المدينة</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-sm text-navy focus:border-teal focus:outline-hidden"
                required
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-navy hover:bg-accent"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-turquoise disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                حفظ التعديلات
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
