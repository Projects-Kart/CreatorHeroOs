import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, Clock, Trash2, Users, Video, MapPin,
  Flag, RotateCcw, ChevronDown, ChevronRight, Milestone
} from "lucide-react";
import { NewTaskDialog } from "./components/NewTaskDialog";
import { useState } from "react";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "text-red-500 bg-red-500/10",
  high: "text-orange-500 bg-orange-500/10",
  medium: "text-yellow-500 bg-yellow-500/10",
  low: "text-green-500 bg-green-500/10",
};

const TYPE_ICONS: Record<string, typeof Users> = {
  meeting: Users,
  milestone: Milestone,
};

export function TasksPage() {
  const { tasks, toggleTask, toggleSubtask, deleteTask } = useStore();
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().slice(0, 10);
  const todaysTasks = tasks.filter((t) => t.dueDate === today);
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate < today);
  const futureTasks = tasks.filter((t) => t.dueDate > today);
  const doneTasks = tasks.filter((t) => t.completed && t.dueDate < today);

  const toggleExpand = (id: string) => {
    setExpandedSubtasks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderTask = (t: any) => {
    const c = CATEGORIES.find((x) => x.id === t.category) ?? CATEGORIES[0];
    const TypeIcon = TYPE_ICONS[t.type];
    const isExpanded = expandedSubtasks.has(t.id);
    const hasSubs = t.subtasks?.length > 0;
    const doneSubs = t.subtasks?.filter((s: any) => s.done).length ?? 0;

    return (
      <Card
        key={t.id}
        className={`transition-all duration-300 backdrop-blur-md bg-card/60 hover:shadow-md border-border/50 overflow-hidden ${
          t.completed ? "opacity-60 bg-secondary/20 hover:opacity-100" : ""
        } ${t.type === "meeting" ? "border-l-4 border-l-[var(--cat-meeting)]" : ""} ${
          t.priority === "urgent" ? "border-l-4 border-l-red-500" : ""
        }`}
      >
        {/* Main row */}
        <div className="flex items-start gap-3 p-4">
          <button onClick={() => toggleTask(t.id)} className="shrink-0 transition-transform active:scale-90 mt-0.5">
            {t.completed
              ? <CheckCircle2 className="h-5 w-5 text-success drop-shadow-sm" />
              : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary/50 transition-colors" />}
          </button>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              {TypeIcon && <TypeIcon className="h-4 w-4 text-[var(--cat-meeting)] shrink-0" />}
              <p className={`font-semibold leading-snug transition-all ${t.completed ? "line-through text-muted-foreground" : "text-foreground/90"}`}>
                {t.title}
              </p>
              {/* Priority badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${PRIORITY_COLORS[t.priority] ?? ""}`}>
                {t.priority}
              </span>
              {t.recurrence && t.recurrence !== "none" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold flex items-center gap-1">
                  <RotateCcw className="h-2.5 w-2.5" />{t.recurrence}
                </span>
              )}
            </div>

            {/* Description */}
            {t.description && !t.completed && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
            )}

            {/* Meta tags */}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: `color-mix(in oklab, var(--${c.token}) 15%, transparent)`, color: `var(--${c.token})` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {c.label}
              </span>
              {t.dueTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />{t.dueTime}
                </span>
              )}
              {t.estimatedMinutes && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />{t.estimatedMinutes}m
                </span>
              )}
              <span className="text-xs text-muted-foreground tracking-wide">{t.dueDate}</span>
            </div>

            {/* Meeting details */}
            {t.type === "meeting" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {t.meetingLink && (
                  <a href={t.meetingLink} target="_blank" rel="noreferrer"
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-[var(--cat-meeting)]/10 text-[var(--cat-meeting)] rounded-lg hover:bg-[var(--cat-meeting)]/20 transition-colors font-medium">
                    <Video className="h-3 w-3" /> Join Meeting
                  </a>
                )}
                {t.meetingLocation && (
                  <span className="text-xs flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-lg">
                    <MapPin className="h-3 w-3" />{t.meetingLocation}
                  </span>
                )}
                {t.attendees && (
                  <span className="text-xs flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-lg">
                    <Users className="h-3 w-3" />{t.attendees}
                  </span>
                )}
              </div>
            )}

            {/* Subtask toggle */}
            {hasSubs && (
              <button
                onClick={() => toggleExpand(t.id)}
                className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                {doneSubs}/{t.subtasks.length} subtasks
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask(t.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Subtasks panel */}
        {hasSubs && isExpanded && (
          <div className="border-t border-border/40 bg-secondary/10 px-4 py-3 space-y-1.5">
            {t.subtasks.map((s: any) => (
              <div key={s.id} className="flex items-center gap-2.5">
                <Checkbox
                  checked={s.done}
                  onCheckedChange={() => toggleSubtask(t.id, s.id)}
                  className="h-4 w-4 rounded"
                />
                <span className={`text-sm flex-1 ${s.done ? "line-through text-muted-foreground" : "text-foreground/80"}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const Section = ({ title, tasks: list, accent }: { title: string; tasks: any[]; accent?: string }) => (
    <section>
      <h2 className={`text-lg font-bold tracking-tight flex items-center gap-2 mb-4 ${accent ?? "text-foreground"}`}>
        {title}
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${accent ? "bg-destructive/10 text-destructive" : "bg-primary/20 text-primary"}`}>
          {list.length}
        </span>
      </h2>
      <div className="space-y-3 group">{list.map(renderTask)}</div>
    </section>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Tasks" subtitle="Execute your daily plan." action={<NewTaskDialog />} />
      <div className="p-8 space-y-10">

        {overdueTasks.length > 0 && (
          <Section title="Overdue" tasks={overdueTasks} accent="text-destructive" />
        )}

        <section>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 mb-4">
            Today <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">{todaysTasks.length}</span>
          </h2>
          {todaysTasks.length === 0 ? (
            <Card className="p-12 text-center text-sm text-muted-foreground border-dashed bg-secondary/20">
              <div className="text-lg font-medium text-foreground/80 mb-2">No tasks scheduled for today.</div>
              <p className="max-w-xs mx-auto mb-4">Add tasks to execute against your goals, or take a well-deserved break.</p>
              <NewTaskDialog />
            </Card>
          ) : (
            <div className="space-y-3 group">{todaysTasks.map(renderTask)}</div>
          )}
        </section>

        {futureTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-bold tracking-tight text-muted-foreground flex items-center gap-2 mb-4">
              Upcoming <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{futureTasks.length}</span>
            </h2>
            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity group">{futureTasks.map(renderTask)}</div>
          </section>
        )}

        {doneTasks.length > 0 && (
          <section className="pt-6 border-t border-border/50">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground mb-4">Previously Completed</h2>
            <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity group">{doneTasks.map(renderTask)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
