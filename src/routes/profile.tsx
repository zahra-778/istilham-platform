import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  KeyRound,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SkillBar } from "@/components/shared/SkillBar";
import { StatCard } from "@/components/shared/StatCard";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { studentsService } from "@/services/mockStudents";
import { recommendationsService } from "@/services/mockRecommendations";
import { adminCrudService } from "@/services/adminCrudService";
import { authService } from "@/services/mockAuth";
import { SKILL_LABELS, type SkillKey, type AuthUser } from "@/types";
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
      { title: "الملف الشخصي | استلهام" },
      { name: "description", content: "استعرض بياناتك الشخصية وإعدادات حسابك على منصة استلهام." },
    ],
  }),
  component: ProfilePage,
});

export function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const handleUserUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<AuthUser | null>;
      setCurrentUser(customEvent.detail ?? authService.getCurrentUser());
    };
    window.addEventListener("istilham-user-updated", handleUserUpdated);
    return () => {
      window.removeEventListener("istilham-user-updated", handleUserUpdated);
    };
  }, []);

  const isAdmin = currentUser?.role === "admin";
  const homeCrumb = isAdmin
    ? { label: "لوحة تحكم الإدارة", to: "/admin" }
    : { label: "لوحة التحكم", to: "/dashboard" };

  return (
    <RequireAuth>
      {isAdmin && currentUser ? (
        <AdminProfileView currentUser={currentUser} homeCrumb={homeCrumb} />
      ) : (
        <StudentProfileView currentUser={currentUser} homeCrumb={homeCrumb} />
      )}
    </RequireAuth>
  );
}

// ─── Admin Profile View ───────────────────────────────────────────────────────
function AdminProfileView({
  currentUser,
  homeCrumb,
}: {
  currentUser: AuthUser;
  homeCrumb: { label: string; to: string };
}) {
  const { data: careers = [] } = useQuery({
    queryKey: ["adminCareers"],
    queryFn: adminCrudService.getCareers,
  });
  const { data: sims = [] } = useQuery({
    queryKey: ["adminSimulations"],
    queryFn: adminCrudService.getSimulations,
  });
  const { data: students = [] } = useQuery({
    queryKey: ["adminStudentsList"],
    queryFn: adminCrudService.getStudents,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
  }, [currentUser.name]);

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentsService.updateProfile({ name: name.trim() });
      authService.updateLocalUser({ name: name.trim() });
      toast.success("تم تحديث بيانات المسؤول بنجاح");
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || "تعذر حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title="الملف الشخصي للمسؤول"
      subtitle="بيانات حساب الإدارة والصلاحيات والنظام"
      breadcrumbs={[homeCrumb, { label: "الملف الشخصي" }]}
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
        {/* Admin Info Card */}
        <section className="card-surface p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-navy text-2xl font-black text-white shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full bg-teal text-white text-xs font-bold shadow-xs">
                  🛡️
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-navy sm:text-2xl">{currentUser.name}</h2>
                  <span className="rounded-full bg-teal/15 text-teal px-3 py-0.5 text-xs font-bold border border-teal/20">
                    مسؤول النظام (Administrator)
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-teal" />
                    {currentUser.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-teal" />
                    صلاحيات إدارية كاملة
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    الحساب نشط
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center justify-between sm:items-end border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
              <span className="text-xs font-semibold text-muted-foreground">نوع الصلاحية</span>
              <span className="text-lg font-black text-teal">مدير عام المنصة</span>
            </div>
          </div>
        </section>

        {/* Quick Management Shortcuts */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/admin"
            className="card-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] group border-r-4 border-r-teal"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">التخصصات الأكاديمية</span>
              <Compass className="h-4 w-4 text-teal group-hover:scale-110 transition-transform" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{toArabicNumber(careers.length)} تخصص</p>
            <p className="mt-1 text-[11px] text-teal font-semibold">إدارة التخصصات والمهارات ←</p>
          </Link>

          <Link
            to="/admin"
            className="card-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] group border-r-4 border-r-turquoise"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">سيناريوهات المحاكاة</span>
              <Gamepad2 className="h-4 w-4 text-turquoise group-hover:scale-110 transition-transform" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{toArabicNumber(sims.length)} محاكاة</p>
            <p className="mt-1 text-[11px] text-teal font-semibold">إدارة التحديات والقرارات ←</p>
          </Link>

          <Link
            to="/admin"
            className="card-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] group border-r-4 border-r-navy"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">الطلاب المسجلون</span>
              <User className="h-4 w-4 text-navy group-hover:scale-110 transition-transform" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{toArabicNumber(students.length)} طالب</p>
            <p className="mt-1 text-[11px] text-teal font-semibold">إدارة الحسابات والحالات ←</p>
          </Link>
        </section>

        {/* Admin Permissions & System Scope */}
        <section className="card-surface p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal" />
              <h3 className="text-base font-bold text-navy">نطاق الصلاحيات الإدارية الممنوحة</h3>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">إصدار النظام ١.٠</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 p-3.5 bg-accent/20 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-navy">إدارة التخصصات والمسارات المهنية</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  إضافة، تعديل وحذف التخصصات وضبط أوزان المؤشرات السلوكية المطلوبة لكل تخصص.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 p-3.5 bg-accent/20 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-navy">بناء سيناريوهات ومواقف المحاكاة</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  إنشاء التحديات والقرارات التفاعلية وربطها بالتخصصات وتحديد مستويات جودة الإجابات.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 p-3.5 bg-accent/20 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-navy">إدارة الطلاب وتفعيل الحسابات</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  استعراض قوائم الطلاب المسجلين والتحكم في تفعيل أو إيقاف الحسابات عند الحاجة.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 p-3.5 bg-accent/20 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-navy">الربط الذكي والتحليل عبر الـ AI</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  متابعة دقة التوصيات ونسب التوافق المحسوبة تلقائياً بواسطة خوارزميات الذكاء الاصطناعي.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Edit Admin Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المسؤول</DialogTitle>
            <DialogDescription>
              تحديث الاسم الظاهر للمسؤول في النظام.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAdmin} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-sm text-navy focus:border-teal focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full rounded-xl border border-input bg-muted/60 p-2.5 text-sm text-muted-foreground cursor-not-allowed"
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

// ─── Student Profile View ─────────────────────────────────────────────────────
function StudentProfileView({
  currentUser,
  homeCrumb,
}: {
  currentUser: AuthUser | null;
  homeCrumb: { label: string; to: string };
}) {
  const studentQuery = useQuery({
    queryKey: ["studentProfile"],
    queryFn: studentsService.getCurrentStudent,
    enabled: Boolean(currentUser && currentUser.role !== "admin"),
  });

  const activitiesQuery = useQuery({
    queryKey: ["studentActivities"],
    queryFn: studentsService.getActivities,
    enabled: Boolean(currentUser && currentUser.role !== "admin"),
  });

  const rankingQuery = useQuery({
    queryKey: ["studentRanking"],
    queryFn: recommendationsService.getRanking,
    enabled: Boolean(currentUser && currentUser.role !== "admin"),
  });

  const queryClient = useQueryClient();
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
        name: formData.name.trim(),
        educationLevel: formData.stage.trim(),
        city: formData.city.trim(),
      });
      authService.updateLocalUser({ name: formData.name.trim() });
      toast.success("تم تحديث بيانات الملف الشخصي بنجاح!");
      await queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["student"] });
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
