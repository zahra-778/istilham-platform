import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Gamepad2,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingState } from "@/components/shared/States";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { adminService } from "@/services/mockAdmin";
import {
  adminCrudService,
  type CareerItem,
  type SimulationItem,
  type StudentItem,
  type CareerPayload,
  type SimulationPayload,
} from "@/services/adminCrudService";
import { authService } from "@/services/mockAuth";
import { toArabicNumber, toArabicPercent } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم الإدارة | استلهام" },
      { name: "description", content: "إدارة شاملة للمنصة: التخصصات، المحاكاة، الطلاب، والإحصائيات." },
    ],
  }),
  component: AdminDashboardPage,
});

// ─── Constants ──────────────────────────────────────────────────────────────
const CHART_COLORS = ["#0D9488", "#14B8A6", "#5EEAD4", "#0F172A", "#64748B", "#94A3B8"];
const TABS = [
  { id: "careers", label: "إدارة التخصصات", icon: Briefcase },
  { id: "simulations", label: "إدارة المحاكاة", icon: Gamepad2 },
  { id: "students", label: "إدارة الطلاب", icon: Users },
  { id: "analytics", label: "الإحصائيات والنمو", icon: BarChart3 },
] as const;
type TabId = typeof TABS[number]["id"];

const SKILL_INDICATORS = [
  { key: "problemSolving", label: "حل المشكلات" },
  { key: "analyticalThinking", label: "التفكير التحليلي" },
  { key: "decisionMaking", label: "اتخاذ القرار" },
  { key: "creativity", label: "الإبداع" },
  { key: "communication", label: "التواصل" },
  { key: "leadership", label: "القيادة" },
  { key: "persistence", label: "المثابرة" },
  { key: "timeManagement", label: "إدارة الوقت" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function TagsInput({ value, onChange, placeholder }: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder || "اكتب ثم اضغط Enter"}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-navy focus:border-teal focus:outline-hidden"
        />
        <button type="button" onClick={add} className="rounded-lg bg-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-turquoise">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-lg bg-mint-soft px-2.5 py-1 text-xs font-semibold text-teal">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Career Form Modal ────────────────────────────────────────────────────────
function CareerFormModal({
  career,
  onClose,
  onSave,
  isSaving,
}: {
  career?: CareerItem | null;
  onClose: () => void;
  onSave: (data: CareerPayload) => void;
  isSaving: boolean;
}) {
  const isEdit = !!career;
  const [form, setForm] = useState<CareerPayload>({
    slug: career?.slug || "",
    nameAr: career?.nameAr || "",
    descriptionAr: career?.descriptionAr || "",
    aboutAr: career?.aboutAr || "",
    icon: career?.icon || "Briefcase",
    requiredSkills: career?.requiredSkills || [],
    traits: career?.traits || [],
    jobs: career?.jobs || [],
    growthSkills: career?.growthSkills || [],
    nextSteps: career?.nextSteps || [],
    weights: career?.weights
      ? Object.fromEntries(career.weights.map((w) => [w.indicator, w.weight]))
      : {},
  });

  const set = (k: keyof CareerPayload, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-xs p-4">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-background shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-extrabold text-navy">
            {isEdit ? `تعديل: ${career!.nameAr}` : "إضافة تخصص جديد"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSave(form); }}
          className="space-y-5 px-6 py-5"
        >
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            {!isEdit && (
              <div className="sm:col-span-2">
                <label className="label-sm">المعرف الإنجليزي (slug)</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s/g, "-"))}
                  placeholder="مثال: software-engineering"
                  className="input-field mt-1"
                />
              </div>
            )}
            <div>
              <label className="label-sm">اسم التخصص بالعربية *</label>
              <input required value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} className="input-field mt-1" />
            </div>
            <div>
              <label className="label-sm">الأيقونة</label>
              <input value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="Briefcase" className="input-field mt-1" />
            </div>
          </div>

          <div>
            <label className="label-sm">الوصف المختصر *</label>
            <textarea required rows={2} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className="input-field mt-1 resize-none" />
          </div>

          <div>
            <label className="label-sm">نبذة تفصيلية عن التخصص *</label>
            <textarea required rows={3} value={form.aboutAr} onChange={(e) => set("aboutAr", e.target.value)} className="input-field mt-1 resize-none" />
          </div>

          {/* Arrays */}
          {([
            ["requiredSkills", "المهارات المطلوبة"],
            ["traits", "السمات الشخصية"],
            ["jobs", "المسميات الوظيفية"],
            ["growthSkills", "مهارات النمو"],
            ["nextSteps", "الخطوات التالية"],
          ] as [keyof CareerPayload, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="label-sm">{label}</label>
              <div className="mt-1">
                <TagsInput
                  value={(form[key] as string[]) || []}
                  onChange={(v) => set(key, v)}
                  placeholder={`أضف ${label}...`}
                />
              </div>
            </div>
          ))}

          {/* Weights */}
          <div>
            <label className="label-sm block mb-2">أوزان المؤشرات (٠–١٠٠)</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {SKILL_INDICATORS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.weights?.[key] ?? ""}
                    onChange={(e) => set("weights", { ...form.weights, [key]: Number(e.target.value) })}
                    className="input-field w-full py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-navy hover:bg-accent">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2 text-xs font-bold text-white hover:bg-turquoise disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isEdit ? "حفظ التعديلات" : "إنشاء التخصص"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onClose, isDeleting }: {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background border border-border p-6 shadow-2xl text-center space-y-4">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
          <Trash2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-extrabold text-navy">تأكيد الحذف</h3>
        <p className="text-sm text-muted-foreground">
          هل أنت متأكد من حذف <span className="font-bold text-navy">"{name}"</span>؟ لن يُعرض بعد الآن للطلاب.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-navy hover:bg-accent">إلغاء</button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Careers ─────────────────────────────────────────────────────────────
function CareersTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CareerItem | null>(null);
  const [deleting, setDeleting] = useState<CareerItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: careers = [], isLoading } = useQuery({
    queryKey: ["adminCareers"],
    queryFn: adminCrudService.getCareers,
  });

  const createMut = useMutation({
    mutationFn: (p: CareerPayload) => adminCrudService.createCareer(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminCareers"] }); setFormOpen(false); toast.success("تم إنشاء التخصص بنجاح"); },
    onError: (e: any) => toast.error(e.message || "فشل إنشاء التخصص"),
  });

  const updateMut = useMutation({
    mutationFn: (p: CareerPayload & { id: string }) => adminCrudService.updateCareer(p.id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminCareers"] }); setEditing(null); toast.success("تم تحديث التخصص"); },
    onError: (e: any) => toast.error(e.message || "فشل تحديث التخصص"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminCrudService.deleteCareer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminCareers"] }); setDeleting(null); toast.success("تم حذف التخصص"); },
    onError: (e: any) => toast.error(e.message || "فشل حذف التخصص"),
  });

  const filtered = careers.filter((c) =>
    c.nameAr.includes(search) || c.slug.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث بالاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 rounded-lg border border-input bg-background py-2 pr-8 pl-3 text-xs text-navy focus:border-teal focus:outline-hidden"
          />
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-2 text-xs font-bold text-white hover:bg-turquoise"
        >
          <Plus className="h-4 w-4" />
          إضافة تخصص
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState label="جاري تحميل التخصصات..." />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-accent/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">التخصص</th>
                  <th className="px-4 py-3 font-semibold">المهارات</th>
                  <th className="px-4 py-3 font-semibold">المحاكاة</th>
                  <th className="px-4 py-3 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <>
                    <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            className="text-muted-foreground hover:text-navy"
                          >
                            {expandedId === c.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                          <div>
                            <p className="font-bold text-navy">{c.nameAr}</p>
                            <p className="text-[11px] text-muted-foreground">{c.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-mint-soft px-2 py-0.5 font-bold text-teal">
                          {toArabicNumber(c.requiredSkills?.length || 0)} مهارة
                        </span>
                      </td>
                      <td className="px-4 py-3 text-navy">
                        {toArabicNumber(c.simulations?.length || 0)} محاكاة
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditing(c)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-border text-navy hover:bg-accent"
                            title="تعديل"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleting(c)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr key={`${c.id}-expanded`} className="bg-accent/10">
                        <td colSpan={4} className="px-6 py-4">
                          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{c.descriptionAr}</p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {c.traits?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-bold text-teal mb-1.5">السمات:</p>
                                <div className="flex flex-wrap gap-1">{c.traits.map((t) => <span key={t} className="rounded-md bg-mint-soft px-2 py-0.5 text-[11px] text-teal">{t}</span>)}</div>
                              </div>
                            )}
                            {c.jobs?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-bold text-teal mb-1.5">الوظائف:</p>
                                <div className="flex flex-wrap gap-1">{c.jobs.map((j) => <span key={j} className="rounded-md bg-background border border-border px-2 py-0.5 text-[11px] text-navy">{j}</span>)}</div>
                              </div>
                            )}
                            {(c.weights?.length ?? 0) > 0 && (
                              <div>
                                <p className="text-[11px] font-bold text-teal mb-1.5">الأوزان:</p>
                                <div className="space-y-1">
                                  {(c.weights ?? []).slice(0, 4).map((w) => (
                                    <div key={w.indicator} className="flex items-center gap-2">
                                      <span className="text-[10px] text-muted-foreground w-24">{SKILL_INDICATORS.find((s) => s.key === w.indicator)?.label || w.indicator}</span>
                                      <div className="flex-1 h-1.5 rounded-full bg-border">
                                        <div className="h-1.5 rounded-full bg-teal" style={{ width: `${Math.min(w.weight, 100)}%` }} />
                                      </div>
                                      <span className="text-[10px] font-bold text-navy w-6">{w.weight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">لا توجد تخصصات تطابق البحث</div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {(formOpen || editing) && (
        <CareerFormModal
          career={editing}
          isSaving={createMut.isPending || updateMut.isPending}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) updateMut.mutate({ ...data, id: editing.id });
            else createMut.mutate(data);
          }}
        />
      )}
      {deleting && (
        <DeleteModal
          name={deleting.nameAr}
          isDeleting={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

// ─── Simulation Form Modal ─────────────────────────────────────────────────
function SimulationFormModal({
  sim,
  careers,
  onClose,
  onSave,
  isSaving,
}: {
  sim: SimulationItem | null;
  careers: CareerItem[];
  onClose: () => void;
  onSave: (payload: SimulationPayload) => void;
  isSaving: boolean;
}) {
  const isEdit = Boolean(sim);
  const [form, setForm] = useState<SimulationPayload>({
    titleAr: sim?.titleAr || "",
    slug: sim?.slug || "",
    careerId: sim?.career?.id || careers[0]?.id || "",
    descriptionAr: sim?.descriptionAr || "",
    introAr: (sim as any)?.introAr || "",
    difficulty: ((sim?.difficulty as any) || "INTERMEDIATE") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    durationMinutes: sim?.durationMinutes || 20,
    challenges: [
      {
        situationAr: "",
        questionAr: "",
        hintAr: "",
        options: [
          { textAr: "", quality: 5 },
          { textAr: "", quality: 3 },
          { textAr: "", quality: 1 },
        ],
      },
    ],
  });

  const set = <K extends keyof SimulationPayload>(key: K, value: SimulationPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addChallenge = () => {
    const prev = form.challenges ?? [];
    setForm((f) => ({
      ...f,
      challenges: [
        ...prev,
        {
          situationAr: "",
          questionAr: "",
          hintAr: "",
          options: [
            { textAr: "", quality: 5 },
            { textAr: "", quality: 3 },
            { textAr: "", quality: 1 },
          ],
        },
      ],
    }));
  };

  const removeChallenge = (index: number) => {
    const list = [...(form.challenges ?? [])];
    list.splice(index, 1);
    setForm((f) => ({ ...f, challenges: list }));
  };

  const updateChallenge = (
    index: number,
    field: "situationAr" | "questionAr" | "hintAr",
    val: string
  ) => {
    const list = [...(form.challenges ?? [])];
    const target = list[index];
    if (!target) return;
    list[index] = { ...target, [field]: val };
    setForm((f) => ({ ...f, challenges: list }));
  };

  const updateOption = (
    cIndex: number,
    oIndex: number,
    field: "textAr" | "quality",
    val: string | number
  ) => {
    const list = [...(form.challenges ?? [])];
    const challenge = list[cIndex];
    if (!challenge) return;
    const opts = [...challenge.options];
    const opt = opts[oIndex];
    if (!opt) return;
    opts[oIndex] = { ...opt, [field]: val } as { textAr: string; quality: number };
    list[cIndex] = { ...challenge, options: opts };
    setForm((f) => ({ ...f, challenges: list }));
  };

  const addOption = (cIndex: number) => {
    const list = [...(form.challenges ?? [])];
    const challenge = list[cIndex];
    if (!challenge) return;
    list[cIndex] = {
      ...challenge,
      options: [...challenge.options, { textAr: "", quality: 3 }],
    };
    setForm((f) => ({ ...f, challenges: list }));
  };

  const removeOption = (cIndex: number, oIndex: number) => {
    const list = [...(form.challenges ?? [])];
    const challenge = list[cIndex];
    if (!challenge) return;
    if (challenge.options.length <= 2) {
      toast.error("يجب إبقاء خيارين على الأقل");
      return;
    }
    const opts = [...challenge.options];
    opts.splice(oIndex, 1);
    list[cIndex] = { ...challenge, options: opts };
    setForm((f) => ({ ...f, challenges: list }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.careerId) {
      toast.error("يرجى اختيار التخصص المرتبط بالمحاكاة");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-background border border-border p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-base font-extrabold text-navy">
            {isEdit ? "تعديل المحاكاة المهنية" : "إضافة محاكاة مهنية جديدة"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-sm">عنوان المحاكاة (بالعربية) *</label>
              <input
                required
                type="text"
                value={form.titleAr}
                onChange={(e) => set("titleAr", e.target.value)}
                placeholder="مثال: محاكاة حملة تسويقية رقمية"
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="label-sm">الاسم اللطيف (Slug) *</label>
              <input
                required
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="مثال: digital-marketing-campaign"
                className="input-field mt-1 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-sm">التخصص المرتبط *</label>
              <select
                required
                value={form.careerId}
                onChange={(e) => set("careerId", e.target.value)}
                className="input-field mt-1"
              >
                <option value="">اختر التخصص...</option>
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-sm">مستوى الصعوبة</label>
              <select
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value as any)}
                className="input-field mt-1"
              >
                <option value="BEGINNER">مبتدئ (سهل)</option>
                <option value="INTERMEDIATE">متوسط</option>
                <option value="ADVANCED">متقدم (صعب)</option>
              </select>
            </div>
            <div>
              <label className="label-sm">المدة التقديرية (بالدقائق)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", Number(e.target.value))}
                className="input-field mt-1"
              />
            </div>
          </div>

          <div>
            <label className="label-sm">الوصف المختصر للمحاكاة *</label>
            <textarea
              required
              rows={2}
              value={form.descriptionAr}
              onChange={(e) => set("descriptionAr", e.target.value)}
              placeholder="وصف سريع يظهر في بطاقة المحاكاة..."
              className="input-field mt-1 resize-none"
            />
          </div>

          <div>
            <label className="label-sm">المقدمة وسياق بيئة العمل *</label>
            <textarea
              required
              rows={3}
              value={form.introAr}
              onChange={(e) => set("introAr", e.target.value)}
              placeholder="مرحباً بك! أنت اليوم مسؤول في الفريق وستواجه مواقف حقيقية..."
              className="input-field mt-1 resize-none"
            />
          </div>

          {/* Challenges Section */}
          {!isEdit && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-navy">تحديات وسيناريوهات المحاكاة</h4>
                  <p className="text-[11px] text-muted-foreground">أضف المواقف والخيارات التفاعلية للطالب</p>
                </div>
                <button
                  type="button"
                  onClick={addChallenge}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal/10 px-3 py-1.5 text-xs font-bold text-teal hover:bg-teal hover:text-white transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة تحدٍ جديد
                </button>
              </div>

              {form.challenges?.map((c, cIdx) => (
                <div key={cIdx} className="rounded-xl border border-border/80 bg-accent/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-teal px-2 py-0.5 text-[11px] font-bold text-white">
                      التحدي رقم {toArabicNumber(cIdx + 1)}
                    </span>
                    {(form.challenges?.length ?? 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChallenge(cIdx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="حذف هذا التحدي"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="label-sm">سياق الموقف (Situation) *</label>
                    <textarea
                      required
                      rows={2}
                      value={c.situationAr}
                      onChange={(e) => updateChallenge(cIdx, "situationAr", e.target.value)}
                      placeholder="حدث عطل مفاجئ في الخادم خلال ساعات الذروة..."
                      className="input-field mt-1 resize-none bg-background text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label-sm">السؤال المطلوب من الطالب *</label>
                      <input
                        required
                        type="text"
                        value={c.questionAr}
                        onChange={(e) => updateChallenge(cIdx, "questionAr", e.target.value)}
                        placeholder="ما هو أول إجراء يجب عليك اتخاذه؟"
                        className="input-field mt-1 bg-background text-xs"
                      />
                    </div>
                    <div>
                      <label className="label-sm">تلميح اختياري (Hint)</label>
                      <input
                        type="text"
                        value={c.hintAr || ""}
                        onChange={(e) => updateChallenge(cIdx, "hintAr", e.target.value)}
                        placeholder="فكر في تقليل أثر الانقطاع على المستخدمين أولاً"
                        className="input-field mt-1 bg-background text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="label-sm">القرارات والخيارات التفاعلية</label>
                      <button
                        type="button"
                        onClick={() => addOption(cIdx)}
                        className="text-[11px] font-bold text-teal hover:underline"
                      >
                        + إضافة خيار
                      </button>
                    </div>
                    {c.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          required
                          type="text"
                          value={opt.textAr}
                          onChange={(e) => updateOption(cIdx, oIdx, "textAr", e.target.value)}
                          placeholder={`نص الخيار ${oIdx + 1}...`}
                          className="input-field flex-1 bg-background text-xs"
                        />
                        <select
                          value={opt.quality}
                          onChange={(e) => updateOption(cIdx, oIdx, "quality", Number(e.target.value))}
                          className="input-field w-32 bg-background text-xs"
                          title="جودة القرار (1 إلى 5)"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (مثالي)</option>
                          <option value={4}>⭐⭐⭐⭐ (جيد جداً)</option>
                          <option value={3}>⭐⭐⭐ (متوسط)</option>
                          <option value={2}>⭐⭐ (ضعيف)</option>
                          <option value={1}>⭐ (غير ملائم)</option>
                        </select>
                        {c.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(cIdx, oIdx)}
                            className="text-muted-foreground hover:text-red-500 p-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-navy hover:bg-accent"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2 text-xs font-bold text-white hover:bg-turquoise disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isEdit ? "حفظ التعديلات" : "إنشاء المحاكاة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tab: Simulations ─────────────────────────────────────────────────────────
function SimulationsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SimulationItem | null>(null);
  const [deleting, setDeleting] = useState<SimulationItem | null>(null);

  const { data: sims = [], isLoading } = useQuery({
    queryKey: ["adminSimulations"],
    queryFn: adminCrudService.getSimulations,
  });

  const { data: careers = [] } = useQuery({
    queryKey: ["adminCareers"],
    queryFn: adminCrudService.getCareers,
  });

  const createMut = useMutation({
    mutationFn: adminCrudService.createSimulation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSimulations"] });
      toast.success("تم إنشاء المحاكاة المهنية بنجاح!");
      setFormOpen(false);
    },
    onError: (e: any) => toast.error(e.message || "فشل إنشاء المحاكاة"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => adminCrudService.updateSimulation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSimulations"] });
      toast.success("تم تحديث بيانات المحاكاة بنجاح!");
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message || "فشل تحديث المحاكاة"),
  });

  const deleteMut = useMutation({
    mutationFn: adminCrudService.deleteSimulation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSimulations"] });
      toast.success("تم حذف المحاكاة بنجاح!");
      setDeleting(null);
    },
    onError: (e: any) => toast.error(e.message || "فشل حذف المحاكاة"),
  });

  const filtered = sims.filter((s) =>
    s.titleAr.includes(search) || (s.career?.nameAr && s.career.nameAr.includes(search)) || s.slug.includes(search)
  );

  const diffColor: Record<string, string> = {
    BEGINNER: "text-emerald-600 bg-emerald-50",
    EASY: "text-emerald-600 bg-emerald-50",
    INTERMEDIATE: "text-amber-600 bg-amber-50",
    MEDIUM: "text-amber-600 bg-amber-50",
    ADVANCED: "text-red-600 bg-red-50",
    HARD: "text-red-600 bg-red-50",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث باسم المحاكاة أو التخصص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pr-8 pl-3 text-xs text-navy focus:border-teal focus:outline-hidden"
          />
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2 text-xs font-bold text-white hover:bg-turquoise transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة محاكاة جديدة
        </button>
      </div>

      {isLoading ? (
        <LoadingState label="جاري تحميل المحاكاة..." />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-accent/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">عنوان المحاكاة</th>
                  <th className="px-4 py-3 font-semibold">التخصص</th>
                  <th className="px-4 py-3 font-semibold">الصعوبة</th>
                  <th className="px-4 py-3 font-semibold">المدة</th>
                  <th className="px-4 py-3 font-semibold">التحديات</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-navy">{s.titleAr}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{s.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-navy font-medium">{s.career?.nameAr || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${diffColor[s.difficulty] || "text-muted-foreground bg-muted"}`}>
                        {s.difficulty === "BEGINNER" || s.difficulty === "EASY"
                          ? "مبتدئ"
                          : s.difficulty === "ADVANCED" || s.difficulty === "HARD"
                          ? "متقدم"
                          : "متوسط"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy">{toArabicNumber(s.durationMinutes)} دقيقة</td>
                    <td className="px-4 py-3 text-navy">{toArabicNumber(s._count?.challenges || 0)} تحدي</td>
                    <td className="px-4 py-3">
                      {s.isActive
                        ? <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold"><CheckCircle2 className="h-3.5 w-3.5" />مفعّل</span>
                        : <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]"><XCircle className="h-3.5 w-3.5" />معطّل</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditing(s)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-navy transition-colors"
                          title="تعديل المحاكاة"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(s)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="حذف المحاكاة"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">لا توجد محاكاة تطابق البحث</div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {(formOpen || editing) && (
        <SimulationFormModal
          sim={editing}
          careers={careers}
          isSaving={createMut.isPending || updateMut.isPending}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) updateMut.mutate({ ...data, id: editing.id });
            else createMut.mutate(data);
          }}
        />
      )}
      {deleting && (
        <DeleteModal
          name={deleting.titleAr}
          isDeleting={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

// ─── Tab: Students ─────────────────────────────────────────────────────────────
function StudentsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["adminStudentsList"],
    queryFn: adminCrudService.getStudents,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminCrudService.toggleStudentStatus(id, isActive),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminStudentsList"] }); toast.success("تم تحديث حالة الطالب"); },
    onError: (e: any) => toast.error(e.message || "فشل تحديث الحالة"),
  });

  const filtered = students.filter((s) =>
    s.name.includes(search) || s.email.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="ابحث بالاسم أو البريد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 rounded-lg border border-input bg-background py-2 pr-8 pl-3 text-xs text-navy focus:border-teal focus:outline-hidden"
        />
      </div>

      {isLoading ? (
        <LoadingState label="جاري تحميل الطلاب..." />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-accent/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">الطالب</th>
                  <th className="px-4 py-3 font-semibold">البريد الإلكتروني</th>
                  <th className="px-4 py-3 font-semibold">المدينة</th>
                  <th className="px-4 py-3 font-semibold">المحاكاة</th>
                  <th className="px-4 py-3 font-semibold">تاريخ التسجيل</th>
                  <th className="px-4 py-3 font-semibold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-navy">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.educationLevel || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-navy">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.city || "—"}</td>
                    <td className="px-4 py-3 text-navy">{toArabicNumber(s._count?.simulationResults || 0)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleMut.mutate({ id: s.id, isActive: !s.isActive })}
                          disabled={toggleMut.isPending}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold transition-colors ${
                            s.isActive
                              ? "bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-600"
                              : "bg-red-50 text-red-600 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                          title={s.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                        >
                          {s.isActive
                            ? <><Eye className="h-3 w-3" />مفعّل</>
                            : <><EyeOff className="h-3 w-3" />موقوف</>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">لا يوجد طلاب</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Analytics ───────────────────────────────────────────────────────────
function AnalyticsTab() {
  const overviewQuery = useQuery({ queryKey: ["adminOverview"], queryFn: adminService.getOverview });
  const topCareersQuery = useQuery({ queryKey: ["adminTopCareers"], queryFn: adminService.getTopCareers });
  const monthlyQuery = useQuery({ queryKey: ["adminMonthly"], queryFn: adminService.getMonthlyPerformance });

  const overview = overviewQuery.data;
  const topCareers = topCareersQuery.data || [];
  const monthlyData = monthlyQuery.data || [];

  if (overviewQuery.isLoading) return <LoadingState label="جاري تحميل الإحصائيات..." />;

  return (
    <div className="space-y-6">
      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي الطلاب" value={toArabicNumber(overview.totalStudents)} hint={overview.studentsGrowth} icon={Users} />
          <StatCard label="التقييمات المكتملة" value={toArabicNumber(overview.completedAssessments)} hint="٨٣٪ من المسجلين" icon={ClipboardList} />
          <StatCard label="المحاكاة المنجزة" value={toArabicNumber(overview.completedSimulations)} hint={overview.simulationsGrowth} icon={Gamepad2} />
          <StatCard label="متوسط التوافق" value={toArabicPercent(overview.averageCompatibility)} hint="دقة توجيه عالية" icon={Sparkles} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-navy">نمو المحاكاة الشهري</h3>
              <p className="text-xs text-muted-foreground mt-0.5">حجم التفاعل الشهري مع التحديات</p>
            </div>
            <TrendingUp className="h-5 w-5 text-teal shrink-0" />
          </div>
          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "12px", border: "none", fontSize: "12px", textAlign: "right", direction: "rtl" }} formatter={(val: any) => [toArabicNumber(val), "المحاكاة"]} />
                <Area type="monotone" dataKey="simulations" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#simGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <h3 className="text-base font-bold text-navy">أكثر التخصصات إقبالاً</h3>
          </div>
          <div className="mt-6 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topCareers} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
                  {topCareers.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "12px", border: "none", fontSize: "12px" }} formatter={(val: any) => [`${toArabicNumber(val)}٪`, "نسبة الطلاب"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {topCareers.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs font-semibold text-navy">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("careers");

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

  const tabContent: Record<TabId, ReactElement> = {
    careers: <CareersTab />,
    simulations: <SimulationsTab />,
    students: <StudentsTab />,
    analytics: <AnalyticsTab />,
  };

  return (
    <RequireAuth role="admin">
      <AppShell
        title="لوحة تحكم الإدارة"
        subtitle="إدارة شاملة للتخصصات والمحاكاة والطلاب ومؤشرات المنصة"
        breadcrumbs={[{ label: "الرئيسية", to: "/" }, { label: "لوحة الإدارة" }]}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Admin Header Quick Stats Banner */}
          <div className="card-surface relative overflow-hidden bg-navy p-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-teal/20 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-teal/20 px-3 py-1 text-xs font-bold text-turquoise mb-2 border border-teal/30">
                  <ShieldCheck className="h-4 w-4" />
                  مساحة إدارة النظام (Admin Console)
                </div>
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                  مرحباً بك في لوحة تحكم استلهام
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  يمكنك من هنا إضافة وتعديل التخصصات وسيناريوهات المحاكاة التفاعلية، وإدارة حسابات الطلاب ومتابعة إحصائيات المنصة.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 text-center min-w-[100px]">
                  <p className="text-lg font-extrabold text-turquoise">{toArabicNumber(careers.length)}</p>
                  <p className="text-[11px] text-slate-300">تخصص مسجل</p>
                </div>
                <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 text-center min-w-[100px]">
                  <p className="text-lg font-extrabold text-mint">{toArabicNumber(sims.length)}</p>
                  <p className="text-[11px] text-slate-300">محاكاة نشطة</p>
                </div>
                <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 text-center min-w-[100px]">
                  <p className="text-lg font-extrabold text-white">{toArabicNumber(students.length)}</p>
                  <p className="text-[11px] text-slate-300">طالب مسجل</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="card-surface flex gap-1 p-1.5 shadow-xs border border-border">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`admin-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                  activeTab === id
                    ? "bg-teal text-white shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tabContent[activeTab]}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
