import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Building2,
  Code2,
  Gauge,
  Megaphone,
  Palette,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  Briefcase,
  Timer,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { toArabicNumber } from "@/utils/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "استلهام | اكتشف المسار المهني الأنسب لك" },
      {
        name: "description",
        content:
          "منصة عربية للإرشاد المهني تساعد الطلاب على اختيار التخصص المناسب عبر محاكاة مهنية واقعية وتحليل سلوكي دقيق.",
      },
      { property: "og:title", content: "استلهام | اكتشف المسار المهني الأنسب لك" },
      {
        property: "og:description",
        content: "اختبر نفسك في مواقف مهنية واقعية ودع النظام يحلل طريقة تفكيرك ليرشّح لك التخصص الأنسب.",
      },
    ],
  }),
  component: LandingPage,
});

const steps = [
  {
    icon: Brain,
    title: "التقييم المبدئي",
    text: "أسئلة قصيرة تقيس أسلوب تفكيرك وطريقة عملك وميولك المهنية.",
  },
  {
    icon: Target,
    title: "المحاكاة المهنية",
    text: "تعيش مواقف عمل حقيقية داخل تخصصات مختلفة وتتخذ قرارات فعلية.",
  },
  {
    icon: Gauge,
    title: "التحليل السلوكي",
    text: "يرصد النظام قراراتك وسرعة استجابتك وأسلوب تعاملك مع التحديات.",
  },
  {
    icon: Sparkles,
    title: "ترتيب التخصصات",
    text: "تحصل على قائمة مرتبة بالتخصصات الأنسب لك مع سبب واضح لكل ترشيح.",
  },
];

const fields = [
  { icon: Code2, name: "هندسة البرمجيات", text: "بناء الأنظمة وحل المشكلات التقنية" },
  { icon: BarChart3, name: "تحليل البيانات", text: "استخراج الرؤى من الأرقام" },
  { icon: ShieldCheck, name: "الأمن السيبراني", text: "حماية الأنظمة والاستجابة للحوادث" },
  { icon: Megaphone, name: "التسويق", text: "فهم السوق وبناء الحملات" },
  { icon: Briefcase, name: "إدارة الأعمال", text: "قيادة الفرق وتنظيم الموارد" },
  { icon: Palette, name: "التصميم الجرافيكي", text: "التعبير البصري عن الأفكار" },
  { icon: Building2, name: "الهندسة المعمارية", text: "تصميم المباني والفراغات" },
  { icon: Stethoscope, name: "الطب", text: "التشخيص والرعاية الصحية" },
];

const benefits = [
  {
    icon: Target,
    title: "قرار مبني على سلوك حقيقي",
    text: "بدل الاعتماد على استبيان تقليدي، نحلل ما تفعله فعلًا داخل مواقف العمل.",
  },
  {
    icon: Timer,
    title: "تجربة قصيرة ومركّزة",
    text: "كل محاكاة لا تتجاوز نصف ساعة وتمنحك صورة عملية عن طبيعة التخصص.",
  },
  {
    icon: Users,
    title: "مناسب للطلاب والمؤسسات",
    text: "لوحات متابعة للطالب والمرشد الأكاديمي مع تقارير واضحة قابلة للمشاركة.",
  },
];

const stats = [
  { value: 4218, label: "طالب مسجّل" },
  { value: 9127, label: "محاكاة مكتملة" },
  { value: 32, label: "تخصصًا ومسارًا" },
  { value: 94, label: "نسبة رضا الطلاب" },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link to="/simulations" className="hidden text-sm font-semibold text-navy hover:text-teal md:block">
              المحاكاة المهنية
            </Link>
            <Link to="/recommendations" className="hidden text-sm font-semibold text-navy hover:text-teal md:block">
              التوصيات
            </Link>
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-accent"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-turquoise"
            >
              إنشاء حساب
            </Link>
          </nav>
        </div>
      </header>

      {/* القسم الرئيسي */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-mint-soft blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-mint/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-1.5 text-xs font-bold text-teal">
              <Sparkles className="h-3.5 w-3.5" />
              منصة إرشاد مهني قائمة على المحاكاة
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.35] text-navy sm:text-5xl">
              اكتشف المسار المهني
              <span className="text-teal"> الأنسب لك</span>
            </h1>
            <p className="text-balance-ar mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              اختبر نفسك من خلال محاكاة مواقف مهنية واقعية، ودع النظام يحلل طريقة تفكيرك واتخاذك للقرارات لمساعدتك في
              اختيار التخصص المناسب.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-turquoise"
              >
                ابدأ رحلتك المهنية
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                to="/simulations"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-accent"
              >
                استعرض المحاكاة
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {stats.slice(0, 3).map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-extrabold text-navy">{toArabicNumber(item.value)}</p>
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-6 lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground">نموذج تقرير المحاكاة</p>
                <p className="truncate text-base font-extrabold text-navy">هندسة البرمجيات</p>
              </div>
              <span className="shrink-0 rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-teal">
                نسبة التوافق ٩١٪
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                ["حل المشكلات", 87],
                ["التفكير التحليلي", 82],
                ["اتخاذ القرار", 91],
                ["المثابرة", 88],
                ["إدارة الوقت", 76],
              ].map(([label, value]) => (
                <div key={String(label)} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-navy">{label}</span>
                    <span className="font-bold text-teal">{toArabicNumber(Number(value))}٪</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-teal" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-balance-ar mt-6 rounded-2xl bg-mint-soft/70 p-4 text-sm text-navy">
              أظهرت أداءً قويًا في اتخاذ القرار وحل المشكلات، مع قدرة جيدة على التعامل مع التحديات والمواقف المختلفة.
            </p>
          </div>
        </div>
      </section>

      {/* كيف تعمل المنصة */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold text-navy">كيف تعمل المنصة؟</h2>
          <p className="text-balance-ar mt-3 text-muted-foreground">
            أربع مراحل متتابعة تنقلك من التعرف على نفسك إلى قائمة تخصصات مرتبة بدقة، مبنية على سلوكك الحقيقي وليس على
            إجابات نظرية فقط.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="card-surface p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint-soft">
                  <step.icon className="h-5 w-5 text-teal" />
                </span>
                <span className="text-2xl font-extrabold text-mint">{toArabicNumber(index + 1)}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy">{step.title}</h3>
              <p className="text-balance-ar mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* شرح المحاكاة */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="text-3xl font-extrabold text-navy">ما المقصود بالمحاكاة المهنية؟</h2>
            <p className="text-balance-ar mt-4 text-muted-foreground">
              بدلًا من سؤالك «هل تحب حل المشكلات؟»، نضعك داخل موقف حقيقي: نظام يتعطل قبل ساعتين من الإطلاق، أو بيانات
              متضاربة يطلب المدير تفسيرها غدًا. قراراتك في هذه المواقف هي ما يكشف قدراتك الحقيقية.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "مواقف مكتوبة بواقعية من بيئات عمل فعلية",
                "قرارات متعددة بلا إجابة واحدة صحيحة دائمًا",
                "رصد دقيق لوقت الاستجابة وتغيير القرار وطلب المساعدة",
                "تقرير مفصّل بالمؤشرات السلوكية بعد كل محاكاة",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-navy">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-turquoise" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface bg-navy p-6 text-navy-foreground lg:p-8">
            <p className="text-xs font-semibold text-turquoise">التحدي ٣ من ٨</p>
            <p className="text-balance-ar mt-4 text-lg font-bold text-navy-foreground">
              أنت تعمل كمهندس برمجيات، واكتشفت مشكلة في النظام قبل إطلاق النسخة الجديدة.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "تحليل سجلات النظام أولًا",
                "إعادة تشغيل النظام",
                "نشر حل سريع",
                "طلب المساعدة من الفريق",
              ].map((option, index) => (
                <div
                  key={option}
                  className={
                    index === 0
                      ? "rounded-2xl border border-turquoise bg-turquoise/15 px-4 py-3 text-sm font-semibold"
                      : "rounded-2xl border border-white/10 px-4 py-3 text-sm text-navy-foreground/80"
                  }
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* المجالات المهنية */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="text-3xl font-extrabold text-navy">مجالات مهنية مميزة</h2>
        <p className="mt-3 text-muted-foreground">استكشف التخصصات الأكثر طلبًا وجرّب محاكاة كل منها.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((field) => (
            <div
              key={field.name}
              className="card-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint-soft">
                <field.icon className="h-5 w-5 text-teal" />
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{field.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{field.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* المزايا والإحصائيات */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-5 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl bg-background p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint-soft">
                  <benefit.icon className="h-5 w-5 text-teal" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy">{benefit.title}</h3>
                <p className="text-balance-ar mt-2 text-sm text-muted-foreground">{benefit.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 rounded-3xl bg-navy p-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-turquoise">{toArabicNumber(stat.value)}</p>
                <p className="mt-1 text-sm text-navy-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* دعوة للتسجيل */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <h2 className="text-3xl font-extrabold text-navy">جاهز لتعرف تخصصك المناسب؟</h2>
        <p className="text-balance-ar mx-auto mt-4 max-w-xl text-muted-foreground">
          ابدأ بالتقييم المبدئي، ثم جرّب أول محاكاة مهنية واحصل على تقريرك السلوكي وترتيب التخصصات خلال أقل من ساعة.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal px-7 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-turquoise"
        >
          ابدأ رحلتك المهنية
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <Logo />
            <p className="text-balance-ar mt-4 max-w-xs text-sm text-muted-foreground">
              منصة عربية تساعد الطلاب على اختيار مسارهم المهني بثقة، اعتمادًا على المحاكاة الواقعية والتحليل السلوكي.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">روابط سريعة</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/simulations" className="hover:text-teal">
                  المحاكاة المهنية
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-teal">
                  التقييم المبدئي
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-teal">
                  التوصيات المهنية
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal">
                  لوحة تحكم الطالب
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">تواصل معنا</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>الرياض، المملكة العربية السعودية</li>
              <li>info@istilham.sa</li>
              <li>٩٢٠٠٠١٢٣٤</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          جميع الحقوق محفوظة — منصة استلهام ٢٠٢٦
        </div>
      </footer>
    </div>
  );
}
