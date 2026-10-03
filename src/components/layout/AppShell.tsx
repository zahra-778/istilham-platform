import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Gamepad2,
  Sparkles,
  User,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { authService } from "@/services/mockAuth";
import type { AuthUser } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const studentNavItems = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/assessment", label: "التقييم المبدئي", icon: ClipboardList },
  { to: "/simulations", label: "المحاكاة المهنية", icon: Gamepad2 },
  { to: "/recommendations", label: "التوصيات المهنية", icon: Sparkles },
  { to: "/profile", label: "الملف الشخصي", icon: User },
] as const;

const adminNavItems = [
  { to: "/admin", label: "لوحة تحكم الإدارة", icon: ShieldCheck },
  { to: "/profile", label: "الملف الشخصي", icon: User },
] as const;

export interface Crumb {
  label: string;
  to?: string;
  description?: string;
}

export function AppShell({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // Listen to profile/user updates in realtime
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

  const filteredNavItems =
    currentUser?.role === "admin" ? adminNavItems : studentNavItems;

  const handleLogout = () => {
    authService.logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* الشريط الجانبي — يبدأ من يمين الشاشة */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-5 py-5">
          <Logo tone="light" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
            className="rounded-lg p-1.5 text-sidebar-foreground/80 hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNavItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-turquoise text-navy"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0 rotate-180" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <div className="lg:pr-72">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="فتح القائمة"
                className="rounded-xl border border-border p-2 text-navy hover:bg-accent lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                {breadcrumbs?.length ? (
                  <nav className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    {breadcrumbs.map((crumb, index) => (
                      <span key={crumb.label} className="flex items-center gap-1">
                        {index > 0 ? <ChevronLeft className="h-3 w-3" /> : null}
                        {crumb.to ? (
                          <Link to={crumb.to} className="hover:text-teal">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-navy">{crumb.label}</span>
                        )}
                      </span>
                    ))}
                  </nav>
                ) : null}
                <h1 className="truncate text-lg font-extrabold text-navy sm:text-xl">{title}</h1>
                {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-sm font-bold text-navy">
                {currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : "أ"}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
