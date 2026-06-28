import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CheckSquare, Calendar, Target, Film, BarChart3, NotebookPen, Settings as SettingsIcon, Flame } from "lucide-react";
import { useStore, computeStreak } from "@/lib/store";
import type { ReactNode } from "react";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/pipeline", label: "Pipeline", icon: Film },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/review", label: "Review", icon: NotebookPen },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { tasks, settings } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const streak = computeStreak(tasks);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="px-5 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">T</div>
            <div>
              <div className="font-semibold tracking-tight leading-none">TimeTracker</div>
              <div className="text-[11px] text-muted-foreground mt-1">{settings.channelName}</div>
            </div>
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as "/"}
                className={
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-ink-soft hover:bg-secondary hover:text-foreground")
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">{streak}-day streak</div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-snug">
            Consistency &gt; intensity. Keep one task moving today.
          </p>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
      <div className="px-8 py-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}