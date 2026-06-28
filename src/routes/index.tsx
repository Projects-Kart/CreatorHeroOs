import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore, computeStreak } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Flame, Play, Pause, RotateCcw, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TimeTracker" },
      { name: "description", content: "Your daily command center: today's tasks, streak, focus timer, and upcoming deadlines." },
      { property: "og:title", content: "Dashboard — TimeTracker" },
      { property: "og:description", content: "Daily command center for content creators." },
    ],
  }),
  component: Dashboard,
});

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function Dashboard() {
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
    <>
      <PageHeader title="Today" subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} />
      <div className="p-8 grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Today's tasks</h2>
                <p className="text-sm text-muted-foreground">{done.length} of {todays.length} complete</p>
              </div>
              <Link to="/tasks"><Button variant="ghost" size="sm">Open task manager →</Button></Link>
            </div>
            <Progress value={todays.length ? (done.length / todays.length) * 100 : 0} className="mb-4 h-1.5" />
            <ul className="divide-y divide-border">
              {todays.length === 0 && (
                <li className="py-8 text-center text-muted-foreground text-sm">
                  No tasks today. Plan something in <Link to="/tasks" className="text-primary underline-offset-2 hover:underline">Tasks</Link>.
                </li>
              )}
              {todays.map((t) => {
                const cat = CATEGORIES.find((c) => c.id === t.category)!;
                return (
                  <li key={t.id} className="py-3 flex items-start gap-3 group">
                    <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className={"text-sm " + (t.completed ? "line-through text-muted-foreground" : "text-foreground")}>{t.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${cat.token})` }} />
                          {cat.label}
                        </span>
                        {t.dueTime && <span>· {t.dueTime}</span>}
                        {t.estimatedMinutes && <span>· {t.estimatedMinutes}m</span>}
                        {t.priority === "urgent" && <span className="text-destructive font-medium">· urgent</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <FocusTimer />

          <Card className="p-5">
            <h2 className="text-lg font-semibold tracking-tight mb-3">Upcoming deadlines</h2>
            <ul className="space-y-2">
              {upcoming.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3">{t.dueDate}</span>
                </li>
              ))}
              {upcoming.length === 0 && <li className="text-sm text-muted-foreground">All clear.</li>}
            </ul>
          </Card>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" /> Streak
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight">{streak}<span className="text-base text-muted-foreground font-normal"> days</span></div>
            <p className="mt-1 text-xs text-muted-foreground">Days in a row with at least one completed task.</p>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 21 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (20 - i));
                const key = d.toISOString().slice(0, 10);
                const has = tasks.some((t) => t.completed && t.completedAt?.startsWith(key));
                return <div key={i} className={"h-4 rounded-sm " + (has ? "bg-primary" : "bg-secondary")} title={key} />;
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">Today's stats</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Completion</dt><dd>{done.length}/{todays.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Est. time</dt><dd>{estimated}m</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Done time</dt><dd>{actual}m</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">In pipeline</dt><dd>{videos.filter((v) => v.stage !== "published").length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Active goals</dt><dd>{goals.filter((g) => !g.archived).length}</dd></div>
            </dl>
          </Card>

          <MoodCheckin existing={todayCheckin} onSave={(m, e) => addCheckin({ date: today, mood: m, energy: e })} />

          <Card className="p-5 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Sparkles className="h-4 w-4 text-primary" /> Daily note
            </div>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              Consistency beats intensity. You're <span className="font-semibold text-foreground">{Math.max(0, todays.length - done.length)}</span> task{todays.length - done.length === 1 ? "" : "s"} away from a clean day.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function FocusTimer() {
  const [mode, setMode] = useState<25 | 50>(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    setSeconds(mode * 60);
    setRunning(false);
  }, [mode]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const total = mode * 60;
  const pct = ((total - seconds) / total) * 100;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2"><Clock className="h-4 w-4" /> Focus timer</h2>
          <p className="text-sm text-muted-foreground">Pomodoro. Pair with any task above.</p>
        </div>
        <div className="flex gap-1 rounded-md bg-secondary p-1">
          <button onClick={() => setMode(25)} className={"px-3 py-1 text-xs rounded " + (mode === 25 ? "bg-background shadow-sm font-medium" : "text-muted-foreground")}>25/5</button>
          <button onClick={() => setMode(50)} className={"px-3 py-1 text-xs rounded " + (mode === 50 ? "bg-background shadow-sm font-medium" : "text-muted-foreground")}>50/10</button>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-5xl font-semibold tracking-tight tabular-nums">{mm}:{ss}</div>
        <div className="flex-1">
          <Progress value={pct} className="h-1.5" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setRunning((r) => !r)} size="sm" variant={running ? "secondary" : "default"}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={() => { setSeconds(mode * 60); setRunning(false); }} size="sm" variant="ghost">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MoodCheckin({ existing, onSave }: { existing?: { mood: number; energy: number }; onSave: (m: number, e: number) => void }) {
  const [mood, setMood] = useState(existing?.mood ?? 0);
  const [energy, setEnergy] = useState(existing?.energy ?? 0);
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold tracking-tight">How are you today?</h3>
      <div className="mt-3 space-y-3">
        <Rating label="Mood" value={mood} onChange={(v) => { setMood(v); if (energy) onSave(v, energy); }} />
        <Rating label="Energy" value={energy} onChange={(v) => { setEnergy(v); if (mood) onSave(mood, v); }} />
      </div>
      {existing && <p className="mt-3 text-xs text-muted-foreground">Saved. Tracked for correlation with output.</p>}
    </Card>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={"h-7 w-7 rounded-md text-xs font-medium transition-colors " + (value >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70")}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
