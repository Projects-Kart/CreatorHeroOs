import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TimeTracker" },
      { name: "description", content: "See where time goes, when you're most productive, and how effort maps to growth." },
      { property: "og:title", content: "Analytics — TimeTracker" },
      { property: "og:description", content: "Connect tasks completed to channel growth." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { tasks, checkins, videos, goals } = useStore();

  const days = useMemo(() => {
    const out: { date: string; completed: number; planned: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({
        date: key.slice(5),
        completed: tasks.filter((t) => t.completed && t.completedAt?.startsWith(key)).length,
        planned: tasks.filter((t) => t.dueDate === key).length,
      });
    }
    return out;
  }, [tasks]);

  const byCategory = useMemo(() => {
    return CATEGORIES.map((c) => {
      const list = tasks.filter((t) => t.category === c.id && t.completed);
      const minutes = list.reduce((s, t) => s + (t.actualMinutes ?? t.estimatedMinutes ?? 0), 0);
      return { name: c.label, value: minutes, token: c.token };
    }).filter((x) => x.value > 0);
  }, [tasks]);

  const dayOfWeek = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    tasks.forEach((t) => { if (t.completed && t.completedAt) counts[new Date(t.completedAt).getDay()]++; });
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => ({ day: d, completed: counts[i] }));
  }, [tasks]);

  const completion = tasks.length ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0;
  const consistencyScore = Math.round(completion);
  const missedDays = days.filter((d) => d.planned > 0 && d.completed / d.planned < 0.5).length;
  const recentMood = checkins.slice(-7).reduce((s, c) => s + c.mood, 0) / Math.max(1, checkins.slice(-7).length);
  const burnoutRisk = missedDays >= 3 || recentMood < 2.5;

  const published = videos.filter((v) => v.stage === "published").length;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Effort vs results. Spot patterns, prevent burnout." />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Consistency score" value={`${consistencyScore}%`} hint="Tasks completed / planned" icon={TrendingUp} />
          <Stat label="Published videos" value={String(published)} hint="In tracked pipeline" icon={Zap} />
          <Stat label="Avg mood (7d)" value={recentMood ? recentMood.toFixed(1) : "—"} hint="1 (low) — 5 (high)" icon={TrendingUp} />
          <Stat label="Burnout risk" value={burnoutRisk ? "Elevated" : "Low"} hint={burnoutRisk ? "Add rest days" : "Sustainable pace"} icon={AlertTriangle} accent={burnoutRisk ? "destructive" : "success"} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3">Productivity over 14 days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="planned" stroke="var(--muted-foreground)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3">Time by category</h3>
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Complete a few tasks to see the breakdown.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {byCategory.map((c, i) => <Cell key={i} fill={`var(--${c.token})`} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `${v}m`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3">Best days of the week</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="completed" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3">Goal velocity</h3>
            <ul className="space-y-3">
              {goals.filter((g) => !g.archived).map((g) => {
                const pct = Math.min(100, (g.currentValue / g.targetValue) * 100);
                const totalDays = Math.ceil((new Date(g.deadline).getTime() - new Date(g.createdAt).getTime()) / 86400000);
                const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
                const expected = ((totalDays - daysLeft) / totalDays) * 100;
                const ahead = pct >= expected;
                return (
                  <li key={g.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{g.title}</span>
                      <span className={"text-xs " + (ahead ? "text-success" : "text-destructive")}>{ahead ? "on track" : "behind"}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded bg-secondary relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${pct}%` }} />
                      <div className="absolute inset-y-0 w-0.5 bg-foreground/40" style={{ left: `${expected}%` }} title="Expected pace" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <Card className="p-5 bg-gradient-to-br from-primary/5 to-transparent">
          <h3 className="text-sm font-semibold tracking-tight">Correlation insight</h3>
          <p className="mt-1 text-sm text-ink-soft">
            You completed <b>{tasks.filter((t) => t.completed).length}</b> tasks and have <b>{published}</b> videos published. At your current pace, top goal ETA is on the goals page.
          </p>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, hint, icon: Icon, accent }: { label: string; value: string; hint?: string; icon: any; accent?: "destructive" | "success" }) {
  const color = accent === "destructive" ? "text-destructive" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className={"mt-2 text-2xl font-semibold tracking-tight " + color}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Card>
  );
}