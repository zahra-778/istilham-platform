import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({
  label = "جارٍ تحميل البيانات...",
  description,
}: {
  label?: string;
  description?: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-3 p-12 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-teal" />
      <p className="text-sm font-semibold text-muted-foreground">{description || label}</p>
    </div>
  );
}

export function ErrorState({
  label = "تعذّر تحميل البيانات، يرجى المحاولة لاحقًا.",
  description,
}: {
  label?: string;
  description?: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-3 p-12 text-center">
      <AlertCircle className="h-7 w-7 text-destructive" />
      <p className="text-sm font-semibold text-navy">{description || label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-3 p-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-soft">
        <Inbox className="h-6 w-6 text-teal" />
      </span>
      <p className="text-base font-bold text-navy">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
