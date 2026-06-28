import { useMemo } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { Stat } from "./components/Stat";

export function AnalyticsPage() {
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Analytics" subtitle="Effort vs results. Spot patterns, prevent burnout." />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat label="Consistency score" value={`${consistencyScore}%`} hint="Tasks completed / planned" icon={TrendingUp} />
          <Stat label="Published videos" value={String(published)} hint="In tracked pipeline" icon={Zap} />
          <Stat label="Avg mood (7d)" value={recentMood ? recentMood.toFixed(1) : "—"} hint="1 (low) — 5 (high)" icon={TrendingUp} />
          <Stat label="Burnout risk" value={burnoutRisk ? "Elevated" : "Low"} hint={burnoutRisk ? "Add rest days" : "Sustainable pace"} icon={AlertTriangle} accent={burnoutRisk ? "destructive" : "success"} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-base font-semibold tracking-tight mb-6 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Productivity over 14 days</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(var(--popover), 0.9)", backdropFilter: "blur(8px)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }} />
                <Line type="monotone" dataKey="planned" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} strokeOpacity={0.5} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-base font-semibold tracking-tight mb-6 flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" /> Time by category</h3>
            {byCategory.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border/50">
                Complete a few tasks to see the breakdown.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4} cornerRadius={4}>
                    {byCategory.map((c, i) => <Cell key={i} fill={`var(--${c.token})`} style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(var(--popover), 0.9)", backdropFilter: "blur(8px)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} formatter={(v: any) => `${v}m`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-base font-semibold tracking-tight mb-6">Best days of the week</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dayOfWeek} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(var(--popover), 0.9)", backdropFilter: "blur(8px)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} cursor={{ fill: 'var(--secondary)', opacity: 0.4 }} />
                <Bar dataKey="completed" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-base font-semibold tracking-tight mb-6">Goal velocity</h3>
            <ul className="space-y-5">
              {goals.filter((g) => !g.archived).map((g) => {
                const targets = g.targets ?? [];
                const avgPct = targets.length > 0
                  ? targets.reduce((s, t) => s + (t.targetValue > 0 ? Math.min(100, (t.currentValue / t.targetValue) * 100) : 0), 0) / targets.length
                  : 0;
                const totalDays = Math.ceil((new Date(g.deadline).getTime() - new Date(g.createdAt).getTime()) / 86400000);
                const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
                const expected = ((totalDays - daysLeft) / totalDays) * 100;
                const ahead = avgPct >= expected;
                return (
                  <li key={g.id} className="group">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">{g.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${ahead ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{ahead ? "On track" : "Behind"}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary relative overflow-hidden">
                      <div className={`absolute inset-y-0 left-0 transition-all duration-1000 ${ahead ? "bg-primary" : "bg-primary/70"}`} style={{ width: `${avgPct}%` }} />
                      <div className="absolute inset-y-0 w-1 bg-foreground/30 shadow-sm z-10 rounded-full" style={{ left: `${expected}%` }} title="Expected pace" />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-medium">
                      <span>{avgPct.toFixed(1)}% avg complete</span>
                      <span>Expected: {expected.toFixed(1)}%</span>
                    </div>
                  </li>
                );
              })}
              {goals.filter((g) => !g.archived).length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border/50 py-10">
                  No active goals to track.
                </div>
              )}
            </ul>
          </Card>
        </div>

        <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg border-primary/20">
          <h3 className="text-base font-semibold tracking-tight text-primary flex items-center gap-2">
            <Zap className="h-5 w-5 fill-primary/20" /> Correlation insight
          </h3>
          <p className="mt-2 text-sm text-foreground/80 leading-relaxed font-medium">
            You completed <b className="text-primary">{tasks.filter((t) => t.completed).length}</b> tasks and have <b className="text-primary">{published}</b> videos published. At your current pace, top goal ETA is on the goals page.
          </p>
        </Card>
      </div>
    </div>
  );
}
