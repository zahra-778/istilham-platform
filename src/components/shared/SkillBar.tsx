import { cn } from "@/lib/utils";
import { toArabicPercent } from "@/utils/format";

export function SkillBar({
  label,
  value,
  className,
  description,
}: {
  label: string;
  value: number;
  className?: string;
  description?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-semibold text-navy">{label}</span>
        <span className="shrink-0 font-bold text-teal">{toArabicPercent(value)}</span>
      </div>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function CircularScore({ value, label }: { value: number; label: string }) {
  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--muted)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--teal)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-xl font-extrabold text-navy">
          {toArabicPercent(value)}
        </span>
      </div>
      <span className="text-sm font-semibold text-navy">{label}</span>
    </div>
  );
}
