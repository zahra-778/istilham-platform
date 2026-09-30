import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string | undefined;
  icon: LucideIcon;
  className?: string | undefined;
}

export function StatCard({ label, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn("card-surface p-5 transition-shadow hover:shadow-[var(--shadow-lift)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-navy">{value}</p>
          {hint ? <p className="mt-1 text-xs font-medium text-teal">{hint}</p> : null}
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-soft">
          <Icon className="h-5 w-5 text-teal" />
        </span>
      </div>
    </div>
  );
}
