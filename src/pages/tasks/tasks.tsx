import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Trash2 } from "lucide-react";
import { NewTaskDialog } from "./components/NewTaskDialog";

export function TasksPage() {
  const { tasks, toggleTask, deleteTask } = useStore();

  const today = new Date().toISOString().slice(0, 10);
  const todaysTasks = tasks.filter((t) => t.dueDate === today);
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate < today);
  const futureTasks = tasks.filter((t) => t.dueDate > today);
  const doneTasks = tasks.filter((t) => t.completed && t.dueDate < today);

  const renderTask = (t: any) => {
    const c = CATEGORIES.find((x) => x.id === t.category)!;
    return (
      <Card key={t.id} className={"flex items-center gap-4 p-4 transition-all duration-300 group backdrop-blur-md bg-card/60 hover:shadow-md border-border/50 " + (t.completed ? "opacity-60 bg-secondary/20 hover:opacity-100" : "")}>
        <button onClick={() => toggleTask(t.id)} className="shrink-0 transition-transform active:scale-90">
          {t.completed ? <CheckCircle2 className="h-6 w-6 text-success drop-shadow-sm" /> : <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={"font-semibold leading-none mb-1.5 transition-all " + (t.completed ? "line-through text-muted-foreground" : "text-foreground/90")}>{t.title}</p>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ backgroundColor: `color-mix(in oklab, var(--${c.token}) 15%, transparent)`, color: `var(--${c.token})` }}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {c.label}
            </span>
            {t.estimatedMinutes && (
              <span className="flex items-center gap-1 text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                <Clock className="h-3 w-3" /> {t.estimatedMinutes}m
              </span>
            )}
            <span className="text-muted-foreground tracking-wide">{t.dueDate}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </Card>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Tasks" subtitle="Execute your daily plan." action={<NewTaskDialog />} />
      <div className="p-8 max-w-4xl mx-auto space-y-10">
        
        {overdueTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-bold tracking-tight text-destructive flex items-center gap-2 mb-4">
              Overdue <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
            </h2>
            <div className="space-y-3">{overdueTasks.map(renderTask)}</div>
          </section>
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
            <div className="space-y-3">{todaysTasks.map(renderTask)}</div>
          )}
        </section>

        {futureTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-bold tracking-tight text-muted-foreground flex items-center gap-2 mb-4">
              Upcoming <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{futureTasks.length}</span>
            </h2>
            <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">{futureTasks.map(renderTask)}</div>
          </section>
        )}
        
        {doneTasks.length > 0 && (
          <section className="pt-6 border-t border-border/50">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground mb-4">Previously Completed</h2>
            <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity">{doneTasks.map(renderTask)}</div>
          </section>
        )}

      </div>
    </div>
  );
}
