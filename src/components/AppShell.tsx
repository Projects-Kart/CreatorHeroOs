import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  Film,
  BarChart3,
  NotebookPen,
  Settings as SettingsIcon,
  Flame,
  LogOut,
} from "lucide-react";
import { useStore, computeStreak } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
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
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const streak = computeStreak(tasks);

  return (
    <div className="h-screen flex w-full bg-background text-foreground overflow-hidden">
      <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col h-full overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">T</div>
            <div>
              <div className="font-semibold tracking-tight leading-none">TimeTracker</div>
              <div className="text-[11px] text-muted-foreground mt-1">{settings.channelName}</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
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

        {/* Streak card */}
        <div className="mx-3 mb-2 rounded-lg border border-border bg-surface p-3 shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">{streak}-day streak</div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-snug">
            Consistency &gt; intensity. Keep one task moving today.
          </p>
        </div>

        {/* User profile + sign-out */}
        <div className="m-3 mt-1 rounded-lg border border-border bg-surface p-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="h-8 w-8 rounded-full border border-border object-cover shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {(user?.displayName ?? user?.email ?? "U")[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate leading-tight">{user?.displayName ?? "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 h-full overflow-y-auto relative">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
      <div className="px-8 py-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {/* {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>} */}
        </div>
        {action}
      </div>
    </div>
  );
}