import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — TimeTracker" },
      { name: "description", content: "Monthly view of tasks, deadlines, and content publish dates." },
      { property: "og:title", content: "Calendar — TimeTracker" },
      { property: "og:description", content: "See your workload at a glance." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
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
    <>
      <PageHeader
        title={cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        subtitle="Click any day to inspect tasks and scheduled publishes."
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() - 1); setCursor(d); }}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Today</Button>
            <Button variant="ghost" size="icon" onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() + 1); setCursor(d); }}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />
      <div className="p-8 grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-8 p-3">
          <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2 px-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1.5">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell) => {
              if (!cell.date) return <div key={cell.key} />;
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
                  className={"min-h-[88px] rounded-md border p-2 text-left transition-colors " + (isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40")}
                  style={{ backgroundColor: intensity > 0 ? `color-mix(in oklab, var(--primary) ${intensity * 12}%, var(--surface))` : "var(--surface)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className={"text-xs font-medium " + (isToday ? "h-5 w-5 rounded-full bg-primary text-primary-foreground grid place-items-center" : "")}>{cell.date.getDate()}</span>
                    {dayTasks.length > 0 && <span className="text-[10px] text-muted-foreground">{done}/{dayTasks.length}</span>}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 3).map((t) => {
                      const c = CATEGORIES.find((x) => x.id === t.category)!;
                      return (
                        <div key={t.id} className={"text-[10px] truncate rounded px-1 py-0.5 " + (t.completed ? "line-through opacity-60" : "")} style={{ backgroundColor: `color-mix(in oklab, var(--${c.token}) 20%, transparent)`, color: `var(--${c.token})` }}>
                          {t.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayTasks.length - 3} more</div>}
                    {dayVideos.map((v) => (
                      <div key={v.id} className="text-[10px] truncate rounded px-1 py-0.5 bg-primary/15 text-primary font-medium">▶ {v.title}</div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4 p-5 h-fit">
          <h3 className="text-sm font-semibold tracking-tight">
            {selected ? new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
          </h3>
          {selected ? (
            <>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Tasks</div>
                {selectedTasks.length === 0 && <p className="text-sm text-muted-foreground">Nothing planned.</p>}
                <ul className="space-y-1.5">
                  {selectedTasks.map((t) => {
                    const c = CATEGORIES.find((x) => x.id === t.category)!;
                    return (
                      <li key={t.id} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${c.token})` }} />
                        <span className={t.completed ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {selectedVideos.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Publishing</div>
                  <ul className="space-y-1.5">
                    {selectedVideos.map((v) => <li key={v.id} className="text-sm">▶ {v.title}</li>)}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Pick a date on the calendar to see what's planned and what shipped.</p>
          )}
        </Card>
      </div>
    </>
  );
}