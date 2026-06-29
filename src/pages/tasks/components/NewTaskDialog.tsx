import { useState } from "react";
import { useStore } from "@/lib/store";
import { type Task, CATEGORIES, type TaskPriority, type TaskType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Video, Users, Calendar, Clock, RotateCcw, ListTodo, Flag, RepeatIcon, Circle, Target } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "optional", label: "Optional", color: "text-green-500" },
  { value: "normal", label: "Normal", color: "text-blue-500" },
  { value: "required", label: "Required", color: "text-red-500" },
];

const TASK_TYPES: { value: TaskType; label: string; icon: typeof ListTodo; desc: string }[] = [
  { value: "standard", label: "Standard", icon: ListTodo, desc: "Regular task" },
  { value: "meeting", label: "Meeting", icon: Users, desc: "Call or sync" },
  { value: "other", label: "Other", icon: Circle, desc: "Other type" },
];

const WEEK_DAYS = [
  { id: "Sun", label: "S" },
  { id: "Mon", label: "M" },
  { id: "Tue", label: "T" },
  { id: "Wed", label: "W" },
  { id: "Thu", label: "T" },
  { id: "Fri", label: "F" },
  { id: "Sat", label: "S" },
];

export function NewTaskDialog({ defaultDate }: { defaultDate?: string }) {
  const { addTask, goals } = useStore();
  const [open, setOpen] = useState(false);

  // Core fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("standard");
  const [category, setCategory] = useState<Task["category"]>("scripting");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [goalId, setGoalId] = useState<string>("none");
  const [startDate, setStartDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [est, setEst] = useState("");
  const [recurrence, setRecurrence] = useState<Task["recurrence"]>("none");
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);

  // Subtasks
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSub, setNewSub] = useState("");

  // Meeting fields
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [attendees, setAttendees] = useState("");

  const addSubtask = () => {
    if (!newSub.trim()) return;
    setSubtasks((s) => [...s, { id: uid(), title: newSub.trim(), completed: false }]);
    setNewSub("");
  };

  const removeSubtask = (id: string) => setSubtasks((s) => s.filter((x) => x.id !== id));

  const toggleRecurrenceDay = (day: string) => {
    setRecurrenceDays((prev) => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const reset = () => {
    setTitle(""); setDescription(""); setType("standard");
    setCategory("scripting"); setPriority("normal");
    setStartDate(defaultDate || new Date().toISOString().slice(0, 10));
    setEndDate(defaultDate || new Date().toISOString().slice(0, 10));
    setTime(""); setEst(""); setRecurrence("none"); setRecurrenceDays([]);
    setGoalId("none");
    setSubtasks([]); setNewSub("");
    setMeetingLink(""); setMeetingLocation(""); setAttendees("");
  };

  const submit = () => {
    if (!title.trim()) return;
    
    const taskData: any = {
      title: title.trim(),
      type,
      category: type === "meeting" ? "meeting" : category,
      priority,
      startDate,
      endDate,
      recurrence,
      subtasks,
      createdAt: new Date().toISOString(),
    };
    
    if (description.trim()) taskData.description = description.trim();
    if (time) taskData.time = time;
    if (parseInt(est)) taskData.estimatedMinutes = parseInt(est);
    if (recurrence === "weekly" && recurrenceDays.length > 0) taskData.recurrenceDays = recurrenceDays;
    if (meetingLink.trim()) taskData.meetingLink = meetingLink.trim();
    if (meetingLocation.trim()) taskData.meetingLocation = meetingLocation.trim();
    if (attendees.trim()) taskData.attendees = attendees.trim();
    if (goalId && goalId !== "none") taskData.goalId = goalId;

    addTask(taskData);
    setOpen(false);
    reset();
  };

  const isMeeting = type === "meeting";

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />New task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px] backdrop-blur-xl bg-card/95 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* Task Type Selector */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {TASK_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    type === value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 bg-secondary/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isMeeting ? "e.g. Weekly sync with editor" : "e.g. Write script for YouTube video"}
              autoFocus
              className="font-medium"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes or context..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Meeting-specific fields */}
          {isMeeting && (
            <div className="space-y-4 p-4 rounded-xl bg-[var(--cat-meeting)]/8 border border-[var(--cat-meeting)]/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--cat-meeting)]">
                <Users className="h-4 w-4" /> Meeting Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Video className="h-3 w-3 inline mr-1" />Meeting Link
                  </Label>
                  <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." className="font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                  <Input value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} placeholder="Room / Online" className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Users className="h-3 w-3 inline mr-1" />Attendees
                  </Label>
                  <Input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="John, Sarah, …" className="text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Priority + Category + Goal */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Flag className="h-3 w-3" /> Priority
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className={`font-semibold ${p.color}`}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isMeeting && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Task["category"])}>
                  <SelectTrigger className="font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.id !== "meeting").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" /> Goal
              </Label>
              <Select value={goalId} onValueChange={(val) => {
                setGoalId(val);
                if (val !== "none") {
                  const selectedGoal = goals.find(g => g.id === val);
                  if (selectedGoal?.deadline) {
                    setEndDate(selectedGoal.deadline);
                  }
                }
              }}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="No Goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none"><span className="text-muted-foreground">No Goal</span></SelectItem>
                  {goals.filter(g => !g.archived).map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date / Time / Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Starting From
              </Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> End To
              </Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Time (AM/PM)
              </Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isMeeting ? "Duration (min)" : "Est. Time (min)"}
              </Label>
              <Input type="number" value={est} onChange={(e) => setEst(e.target.value)} placeholder="60" className="font-medium tabular-nums" />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Repeat
            </Label>
            <div className="flex gap-2">
              {(["none", "daily", "weekly"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRecurrence(r)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                    recurrence === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {r === "none" ? "One-time" : r}
                </button>
              ))}
            </div>

            {/* Weekly Days Selector */}
            {recurrence === "weekly" && (
              <div className="flex gap-1 mt-2">
                {WEEK_DAYS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => toggleRecurrenceDay(d.id)}
                    className={`h-8 w-8 rounded-full border text-xs font-bold transition-all ${
                      recurrenceDays.includes(d.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subtasks</Label>
            <div className="flex gap-2">
              <Input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtask(); } }}
                placeholder="Add a step… (press Enter)"
                className="text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSubtask} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {subtasks.length > 0 && (
              <ul className="space-y-1.5 mt-1">
                {subtasks.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm px-3 py-2 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="h-4 w-4 rounded border border-border shrink-0" />
                    <span className="flex-1 font-medium">{s.title}</span>
                    <button onClick={() => removeSubtask(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border/50 pt-4 gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-secondary/50">Cancel</Button>
          <Button onClick={submit} disabled={!title.trim()} className="bg-primary text-primary-foreground px-6">
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
