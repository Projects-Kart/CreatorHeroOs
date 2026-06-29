import { useStore, computeStreak } from "@/lib/store";
import { CATEGORIES, isTaskActiveOnDate, isTaskCompletedOnDate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Flame, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FocusTimer } from "./components/FocusTimer";
import { MoodCheckin } from "./components/MoodCheckin";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function Dashboard() {
  const { tasks, goals, videos, toggleTask, addCheckin, checkins } = useStore();
  const today = todayKey();
  const todays = tasks.filter((t) => isTaskActiveOnDate(t, today));
  const done = todays.filter((t) => isTaskCompletedOnDate(t, today));
  const streak = computeStreak(tasks);

  const estimated = todays.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0);
  const actual = done.reduce((s, t) => s + (t.actualMinutes ?? t.estimatedMinutes ?? 0), 0);

  const todayCheckin = checkins.find((c) => c.date === today);

  return (
    <div className="min-h-full bg-[#FAF9F6] text-slate-800 font-sans">
      <div className="border-b border-border/40 bg-[#FAF9F6] sticky top-0 z-10 px-8 py-5">
        <h1 className="text-xl font-bold tracking-tight text-black">Today</h1>
      </div>
      
      <div className="p-8 grid grid-cols-12 gap-8 max-w-7xl mx-auto">
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="bg-white shadow-sm border-0 rounded-[20px] overflow-hidden">
            <div className="p-6 pb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[17px] font-bold text-black tracking-tight">Today's tasks</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{done.length} of {todays.length} complete</p>
                </div>
                <Link to="/tasks">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-transparent px-0 transition-colors">
                    Open task manager &rarr;
                  </Button>
                </Link>
              </div>
              
              {/* Solid Orange Progress Line */}
              <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden mt-2 mb-6">
                <div 
                  className="h-full bg-[#E35D43] transition-all duration-500 rounded-full" 
                  style={{ width: `${todays.length ? (done.length / todays.length) * 100 : 0}%` }}
                />
              </div>
              
              <ul className="space-y-1">
                {todays.length === 0 && (
                  <li className="py-8 text-center text-muted-foreground text-sm font-medium">
                    No tasks today. Plan something in <Link to="/tasks" className="text-[#E35D43] underline-offset-2 hover:underline">Tasks</Link>.
                  </li>
                )}
                {todays.map((t) => {
                  const cat = CATEGORIES.find((c) => c.id === t.category)!;
                  const isDone = isTaskCompletedOnDate(t, today);
                  return (
                    <li key={t.id} className="py-3 flex items-start gap-3.5 group -mx-2 px-2">
                      <Checkbox 
                        checked={isDone} 
                        onCheckedChange={() => toggleTask(t.id, today)} 
                        className="mt-0.5 h-4 w-4 rounded-full border-border data-[state=checked]:bg-[#E35D43] data-[state=checked]:border-[#E35D43] transition-all shadow-none" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-bold transition-colors ${isDone ? "line-through text-muted-foreground/60" : "text-black"}`}>
                          {t.title}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-secondary/60 text-foreground/70">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${cat.token})` }} />
                            {cat.label}
                          </span>
                          {t.time && <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-secondary/60 text-foreground/70">{t.time}</span>}
                          {t.estimatedMinutes && <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-secondary/60 text-foreground/70">{t.estimatedMinutes}m</span>}
                          {t.priority === "required" && <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[#E35D43]">- required</span>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Streak Card */}
          <Card className="p-6 bg-white shadow-sm border-0 rounded-[20px] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-semibold">
                <Flame className="h-4 w-4 text-[#E35D43]" /> Streak
              </div>
              <Flame className="h-16 w-16 text-[#E35D43]/10 absolute right-4 top-4" />
            </div>
            
            <div className="mt-4 flex items-baseline gap-1 relative z-10">
              <span className="text-5xl font-black text-black tracking-tight">{streak}</span>
              <span className="text-[15px] font-bold text-muted-foreground">days</span>
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">Days in a row with at least one completed task.</p>
            
            <div className="mt-6 grid grid-cols-7 gap-1.5 relative z-10">
              {Array.from({ length: 21 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (20 - i));
                const key = d.toISOString().slice(0, 10);
                const has = tasks.some((t) => isTaskCompletedOnDate(t, key));
                return (
                  <div 
                    key={i} 
                    className={`h-5 rounded-[4px] transition-all ${has ? "bg-[#E35D43]" : "bg-secondary/40"}`} 
                    title={key} 
                  />
                );
              })}
            </div>
          </Card>

          <FocusTimer />

          <Card className="p-6 bg-white shadow-sm border-0 rounded-[20px]">
            <h3 className="text-[13px] font-bold text-black tracking-tight mb-5">Today's stats</h3>
            <dl className="space-y-3.5 text-[12px] font-medium">
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Completion</dt><dd className="font-bold bg-secondary/50 px-2 py-0.5 rounded-sm text-black">{done.length}/{todays.length}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Est. time</dt><dd className="font-bold text-black">{estimated}m</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Done time</dt><dd className="font-bold text-[#E35D43]">{actual}m</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">In pipeline</dt><dd className="font-bold text-black">{videos.filter((v) => v.stage !== "published").length}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-muted-foreground">Active goals</dt><dd className="font-bold text-black">{goals.filter((g) => !g.archived).length}</dd></div>
            </dl>
          </Card>

          <Card className="p-6 bg-white shadow-sm border-0 rounded-[20px]">
            <MoodCheckin existing={todayCheckin} onSave={(m, e) => addCheckin({ date: today, mood: m, energy: e })} />
          </Card>

          <Card className="p-5 bg-[#E35D43]/5 border-0 rounded-[20px]">
            <div className="flex items-center gap-2 text-xs font-bold tracking-tight text-[#E35D43]">
              <Sparkles className="h-3.5 w-3.5" /> Daily note
            </div>
            <p className="mt-2 text-[12px] text-foreground/80 leading-relaxed font-semibold">
              Consistency beats intensity. You're <span className="font-bold text-[#E35D43]">{Math.max(0, todays.length - done.length)}</span> task{todays.length - done.length === 1 ? "" : "s"} away from a clean day.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
