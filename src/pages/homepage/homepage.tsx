import { PageHeader } from "@/components/AppShell";
import { useStore, computeStreak } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Flame, AlertCircle, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FocusTimer } from "./components/FocusTimer";
import { MoodCheckin } from "./components/MoodCheckin";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function Dashboard() {
  const { tasks, goals, videos, toggleTask, addCheckin, checkins } = useStore();
  const today = todayKey();
  const todays = tasks.filter((t) => t.dueDate === today);
  const done = todays.filter((t) => t.completed);
  const streak = computeStreak(tasks);

  const upcoming = [...tasks]
    .filter((t) => !t.completed && t.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const estimated = todays.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0);
  const actual = done.reduce((s, t) => s + (t.actualMinutes ?? t.estimatedMinutes ?? 0), 0);

  const todayCheckin = checkins.find((c) => c.date === today);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Today" subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} />
      <div className="p-8 grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="p-5 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Today's tasks</h2>
                <p className="text-sm text-muted-foreground">{done.length} of {todays.length} complete</p>
              </div>
              <Link to="/tasks">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors">
                  Open task manager →
                </Button>
              </Link>
            </div>
            <Progress value={todays.length ? (done.length / todays.length) * 100 : 0} className="mb-4 h-2 rounded-full overflow-hidden" />
            <ul className="divide-y divide-border/50">
              {todays.length === 0 && (
                <li className="py-8 text-center text-muted-foreground text-sm">
                  No tasks today. Plan something in <Link to="/tasks" className="text-primary underline-offset-2 hover:underline">Tasks</Link>.
                </li>
              )}
              {todays.map((t) => {
                const cat = CATEGORIES.find((c) => c.id === t.category)!;
                return (
                  <li key={t.id} className="py-3 flex items-start gap-3 group transition-all hover:bg-secondary/20 -mx-2 px-2 rounded-lg">
                    <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} className="mt-0.5 rounded-sm transition-transform active:scale-95" />
                    <div className="flex-1 min-w-0">
                      <div className={"text-sm font-medium transition-colors " + (t.completed ? "line-through text-muted-foreground" : "text-foreground")}>{t.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/50 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full shadow-sm" style={{ backgroundColor: `var(--${cat.token})` }} />
                          {cat.label}
                        </span>
                        {t.dueTime && <span className="flex items-center">· {t.dueTime}</span>}
                        {t.estimatedMinutes && <span className="flex items-center">· {t.estimatedMinutes}m</span>}
                        {t.priority === "urgent" && <span className="text-destructive font-semibold flex items-center gap-1">· urgent</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <FocusTimer />

          <Card className="p-5 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg font-semibold tracking-tight mb-3">Upcoming deadlines</h2>
            <ul className="space-y-2">
              {upcoming.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm py-2.5 px-3 rounded-lg hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="truncate font-medium">{t.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3 bg-secondary px-2 py-1 rounded-md">{t.dueDate}</span>
                </li>
              ))}
              {upcoming.length === 0 && <li className="text-sm text-muted-foreground py-2">All clear.</li>}
            </ul>
          </Card>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="p-5 backdrop-blur-xl bg-gradient-to-br from-card/80 to-card/40 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Flame className="h-24 w-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Flame className="h-4 w-4 text-primary animate-pulse" /> Streak
              </div>
              <div className="mt-2 text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {streak}<span className="text-lg text-muted-foreground font-normal ml-1">days</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Days in a row with at least one completed task.</p>
              <div className="mt-5 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 21 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (20 - i));
                  const key = d.toISOString().slice(0, 10);
                  const has = tasks.some((t) => t.completed && t.completedAt?.startsWith(key));
                  return (
                    <div 
                      key={i} 
                      className={"h-6 rounded-[4px] transition-all duration-300 " + (has ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "bg-secondary/40 hover:bg-secondary/60")} 
                      title={key} 
                    />
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-5 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-sm font-semibold tracking-tight">Today's stats</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Completion</dt><dd className="font-semibold bg-secondary/50 px-2 py-0.5 rounded-md">{done.length}/{todays.length}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Est. time</dt><dd className="font-medium">{estimated}m</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Done time</dt><dd className="font-medium text-primary">{actual}m</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">In pipeline</dt><dd className="font-medium">{videos.filter((v) => v.stage !== "published").length}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Active goals</dt><dd className="font-medium">{goals.filter((g) => !g.archived).length}</dd></div>
            </dl>
          </Card>

          <MoodCheckin existing={todayCheckin} onSave={(m, e) => addCheckin({ date: today, mood: m, energy: e })} />

          <Card className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-md">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
              <Sparkles className="h-4 w-4" /> Daily note
            </div>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed font-medium">
              Consistency beats intensity. You're <span className="font-bold text-primary">{Math.max(0, todays.length - done.length)}</span> task{todays.length - done.length === 1 ? "" : "s"} away from a clean day.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
