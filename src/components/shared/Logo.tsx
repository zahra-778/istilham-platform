import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  tone = "dark",
  className,
  showText = true,
  size = "md",
}: {
  tone?: "dark" | "light";
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  return (
    <Link to="/" className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border border-teal/20 bg-mint-soft shadow-xs",
          sizeClasses[size],
        )}
      >
        <img
          src="/logo.jpeg"
          alt="شعار استلهام للإرشاد المهني"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-extrabold tracking-tight",
              size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg",
              tone === "light" ? "text-navy-foreground" : "text-navy",
            )}
          >
            استلهام
          </span>
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">للإرشاد المهني</span>
        </span>
      )}
    </Link>
  );
}

