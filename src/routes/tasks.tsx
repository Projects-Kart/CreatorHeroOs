import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CATEGORIES, type Category, type Priority, type Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — TimeTracker" },
      { name: "description", content: "Create, schedule, and complete tasks with priorities, recurrence, and subtasks." },
      { property: "og:title", content: "Tasks — TimeTracker" },
      { property: "og:description", content: "Powerful task manager for creators." },
    ],
  }),
  component: TasksPage,
});

const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
];

function TasksPage() {
  const { tasks, toggleTask, toggleSubtask, deleteTask, updateTask } = useStore();
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "completed">("today");
  const [cat, setCat] = useState<Category | "all">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (cat === "all" ? true : t.category === cat))
      .filter((t) => {
        if (filter === "today") return t.dueDate === today && !t.completed;
        if (filter === "upcoming") return t.dueDate > today && !t.completed;
        if (filter === "completed") return t.completed;
        return true;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, filter, cat, today]);

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Plan upload-day flow, batch sessions, and recurring habits."
        action={<NewTaskDialog />}
      />
      <div className="p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-md bg-secondary p-1">
            {(["today", "upcoming", "all", "completed"] as const).map((k) => (
              <button key={k} onClick={() => setFilter(k)} className={"px-3 py-1 text-xs rounded capitalize " + (filter === k ? "bg-background shadow-sm font-medium" : "text-muted-foreground")}>{k}</button>
            ))}
          </div>
          <Select value={cat} onValueChange={(v) => setCat(v as any)}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        <Card className="divide-y divide-border">
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No tasks here. Create one above.</div>
          )}
          {filtered.map((t) => {
            const c = CATEGORIES.find((x) => x.id === t.category)!;
            const subOpen = expanded[t.id];
            return (
              <div key={t.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {t.subtasks.length > 0 && (
                        <button onClick={() => setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))} className="text-muted-foreground hover:text-foreground">
                          {subOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      <span className={"text-sm " + (t.completed ? "line-through text-muted-foreground" : "")}>{t.title}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${c.token})` }} />{c.label}</span>
                      <span>· {t.dueDate}{t.dueTime ? ` ${t.dueTime}` : ""}</span>
                      {t.estimatedMinutes && <span>· {t.estimatedMinutes}m</span>}
                      <span className={"capitalize " + (t.priority === "urgent" ? "text-destructive font-medium" : t.priority === "high" ? "text-primary font-medium" : "")}>· {t.priority}</span>
                      {t.recurrence && t.recurrence !== "none" && <span>· {t.recurrence}</span>}
                      {t.subtasks.length > 0 && <span>· {t.subtasks.filter((s) => s.done).length}/{t.subtasks.length} subtasks</span>}
                    </div>
                    {subOpen && (
                      <ul className="mt-2 pl-4 space-y-1.5">
                        {t.subtasks.map((s) => (
                          <li key={s.id} className="flex items-center gap-2">
                            <Checkbox checked={s.done} onCheckedChange={() => toggleSubtask(t.id, s.id)} />
                            <span className={"text-sm " + (s.done ? "line-through text-muted-foreground" : "")}>{s.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => {
                      const d = new Date(t.dueDate); d.setDate(d.getDate() + 1);
                      updateTask(t.id, { dueDate: d.toISOString().slice(0, 10) });
                    }}>Snooze</Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </>
  );
}

function NewTaskDialog() {
  const { addTask } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Category>("scripting");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueTime, setDueTime] = useState("");
  const [estimated, setEstimated] = useState<string>("");
  const [recurrence, setRecurrence] = useState<Task["recurrence"]>("none");

  const submit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: desc.trim() || undefined,
      category,
      priority,
      dueDate,
      dueTime: dueTime || undefined,
      estimatedMinutes: estimated ? parseInt(estimated, 10) : undefined,
      recurrence,
    });
    setOpen(false);
    setTitle(""); setDesc(""); setEstimated(""); setDueTime("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New task</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Edit Episode 12 first pass" autoFocus /></div>
          <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional notes" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            <div><Label>Time</Label><Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} /></div>
            <div><Label>Estimate (min)</Label><Input type="number" value={estimated} onChange={(e) => setEstimated(e.target.value)} /></div>
            <div>
              <Label>Recurrence</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Task["recurrence"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}