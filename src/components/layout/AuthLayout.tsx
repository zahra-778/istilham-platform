import type { ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 lg:flex">
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-turquoise/20 blur-3xl" />
        <div>
          <Logo tone="light" size="lg" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-[1.5] text-navy-foreground">
            قرارك المهني يستحق أكثر من استبيان تقليدي
          </h2>
          <p className="text-balance-ar mt-4 max-w-md text-navy-foreground/75">
            جرّب مواقف عمل حقيقية، واترك قراراتك تكشف قدراتك، ثم احصل على ترتيب دقيق للتخصصات الأنسب لك.
          </p>
        </div>
        <p className="relative text-xs text-navy-foreground/60">منصة استلهام للإرشاد المهني والمحاكاة</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-start lg:hidden">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
