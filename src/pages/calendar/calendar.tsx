import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, PlayCircle, CheckCircle2 } from "lucide-react";

export function CalendarPage() {
  const { tasks, videos } = useStore();
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState<string | null>(null);

  const cells = useMemo(() => {
    const start = new Date(cursor);
    const firstDow = start.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const out: { date: Date | null; key: string }[] = [];
    for (let i = 0; i < firstDow; i++) out.push({ date: null, key: `e${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      out.push({ date: dt, key: dt.toISOString().slice(0, 10) });
    }
    return out;
  }, [cursor]);

  const today = new Date().toISOString().slice(0, 10);
  const selectedTasks = selected ? tasks.filter((t) => t.dueDate === selected) : [];
  const selectedVideos = selected ? videos.filter((v) => v.publishDate === selected) : [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        subtitle="Click any day to inspect tasks and scheduled publishes."
        action={
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg backdrop-blur-sm border border-border/50">
            <Button variant="ghost" size="icon" onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() - 1); setCursor(d); }} className="hover:bg-background"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }} className="hover:bg-background font-medium">Today</Button>
            <Button variant="ghost" size="icon" onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() + 1); setCursor(d); }} className="hover:bg-background"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />
      <div className="p-8 grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        <Card className="col-span-12 lg:col-span-8 p-5 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300">
          <div className="grid grid-cols-7 text-xs text-muted-foreground mb-4 px-1 font-medium tracking-wider uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1.5 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell) => {
              if (!cell.date) return <div key={cell.key} className="min-h-[100px]" />;
              const key = cell.key;
              const dayTasks = tasks.filter((t) => t.dueDate === key);
              const dayVideos = videos.filter((v) => v.publishDate === key);
              const done = dayTasks.filter((t) => t.completed).length;
              const intensity = Math.min(1, dayTasks.length / 6);
              const isToday = key === today;
              const isSelected = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={"min-h-[100px] rounded-xl border p-2 text-left transition-all duration-200 group relative overflow-hidden " + (isSelected ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] ring-1 ring-primary" : "border-border/50 hover:border-primary/50 hover:shadow-md")}
                  style={{ backgroundColor: intensity > 0 ? `color-mix(in oklab, var(--primary) ${intensity * 8}%, var(--surface))` : "var(--surface)" }}
                >
                  <div className="flex items-center justify-between z-10 relative">
                    <span className={"text-sm font-semibold transition-colors " + (isToday ? "h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-md" : isSelected ? "text-primary" : "text-foreground")}>{cell.date.getDate()}</span>
                    {dayTasks.length > 0 && <span className={"text-[10px] font-medium px-1.5 py-0.5 rounded-md " + (done === dayTasks.length ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground")}>{done}/{dayTasks.length}</span>}
                  </div>
                  <div className="mt-2 space-y-1 z-10 relative">
                    {dayTasks.slice(0, 3).map((t) => {
                      const c = CATEGORIES.find((x) => x.id === t.category)!;
                      return (
                        <div key={t.id} className={"text-[10px] truncate rounded px-1.5 py-0.5 font-medium transition-all " + (t.completed ? "opacity-50 line-through" : "group-hover:opacity-100")} style={{ backgroundColor: `color-mix(in oklab, var(--${c.token}) 15%, transparent)`, color: `var(--${c.token})` }}>
                          {t.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && <div className="text-[10px] text-muted-foreground font-medium px-1">+{dayTasks.length - 3} more</div>}
                    {dayVideos.map((v) => (
                      <div key={v.id} className="text-[10px] truncate rounded px-1.5 py-0.5 bg-primary/20 text-primary font-bold flex items-center gap-1 shadow-sm">
                        <PlayCircle className="h-3 w-3" /> {v.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4 p-6 h-fit backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300">
          <div className="flex items-center gap-2 text-base font-semibold tracking-tight border-b border-border/50 pb-4 mb-4">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {selected ? new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
          </div>
          {selected ? (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">Tasks <span className="bg-secondary px-2 py-0.5 rounded-full text-foreground">{selectedTasks.length}</span></div>
                {selectedTasks.length === 0 && <p className="text-sm text-muted-foreground italic bg-secondary/30 p-3 rounded-lg border border-dashed border-border">Nothing planned for this day.</p>}
                <ul className="space-y-2">
                  {selectedTasks.map((t) => {
                    const c = CATEGORIES.find((x) => x.id === t.category)!;
                    return (
                      <li key={t.id} className="text-sm flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors group">
                        <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: `var(--${c.token})` }} />
                        <span className={"flex-1 truncate font-medium " + (t.completed ? "line-through text-muted-foreground" : "")}>{t.title}</span>
                        {t.completed && <CheckCircle2 className="h-4 w-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </li>
                    );
                  })}
                </ul>
              </div>
              {selectedVideos.length > 0 && (
                <div className="mt-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3">Publishing</div>
                  <ul className="space-y-2">
                    {selectedVideos.map((v) => (
                      <li key={v.id} className="text-sm flex items-center gap-2 p-3 bg-primary/10 text-primary font-medium rounded-lg border border-primary/20 shadow-sm">
                        <PlayCircle className="h-4 w-4" /> {v.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1} />
              <p className="text-sm text-muted-foreground max-w-[200px]">Pick a date on the calendar to see what's planned and what shipped.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
