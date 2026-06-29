import { type Task, CATEGORIES, isTaskCompletedOnDate } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarX, Clock, Calendar, RepeatIcon, MapPin, Users, Video, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

interface Props {
  task: Task | null;
  date?: string;
  onClose: () => void;
}

export function TaskDetailsDialog({ task, date, onClose }: Props) {
  const { deleteTask, updateTask, toggleSubtask, toggleTask } = useStore();

  if (!task) return null;

  const category = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0];
  
  const handleDeleteTask = () => {
    deleteTask(task.id);
    onClose();
  };

  const handleStopFutureReminders = () => {
    // Set endDate to yesterday to stop future reminders
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    updateTask(task.id, { endDate: yesterday.toISOString().slice(0, 10) });
    onClose();
  };

  const contextDate = date || new Date().toISOString().slice(0, 10);
  const isCompleted = isTaskCompletedOnDate(task, contextDate);

  const handleToggleComplete = () => {
    if (!isCompleted && task.subtasks?.length > 0) {
      const updatedSubtasks = task.subtasks.map(s => ({ ...s, completed: true }));
      updateTask(task.id, { subtasks: updatedSubtasks });
    }
    toggleTask(task.id, contextDate);
    onClose();
  };

  const hasSubs = task.subtasks && task.subtasks.length > 0;
  const doneSubs = task.subtasks?.filter(s => s.completed || (s as any).done)?.length || 0;

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border/50 shadow-2xl p-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="p-6 pb-4 bg-secondary/20">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
              ${task.priority === "required" ? "text-red-500 bg-red-500/10" : 
                task.priority === "optional" ? "text-green-500 bg-green-500/10" : "text-blue-500 bg-blue-500/10"}`}>
              {task.priority}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{ backgroundColor: `color-mix(in oklab, var(--${category.token}) 15%, transparent)`, color: `var(--${category.token})` }}>
              {category.label}
            </span>
            {task.recurrence && task.recurrence !== "none" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold flex items-center gap-1">
                <RepeatIcon className="h-2.5 w-2.5" /> 
                {task.recurrence}
                {task.recurrence === "weekly" && task.recurrenceDays && task.recurrenceDays.length > 0 && (
                  <span className="ml-0.5 opacity-70">
                    ({task.recurrenceDays.join(", ")})
                  </span>
                )}
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
          )}
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Timeline and Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold">Timeline</p>
                <p className="text-muted-foreground text-xs">{task.startDate} to {task.endDate || task.startDate}</p>
              </div>
            </div>
            {(task.time || task.estimatedMinutes) && (
              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">Time</p>
                  <p className="text-muted-foreground text-xs">
                    {task.time}{task.time && task.estimatedMinutes && " • "}{task.estimatedMinutes && `${task.estimatedMinutes}m`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Meeting Details */}
          {task.type === "meeting" && (
            <div className="bg-[var(--cat-meeting)]/10 text-[var(--cat-meeting)] rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-sm flex items-center gap-1"><Users className="h-4 w-4"/> Meeting Info</h4>
              {task.meetingLink && (
                <a href={task.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs hover:underline">
                  <Video className="h-3 w-3" /> {task.meetingLink}
                </a>
              )}
              {task.meetingLocation && (
                <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3" /> {task.meetingLocation}</div>
              )}
              {task.attendees && (
                <div className="flex items-center gap-2 text-xs"><Users className="h-3 w-3" /> {task.attendees}</div>
              )}
            </div>
          )}

          {/* Subtasks */}
          {hasSubs && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Subtasks</h4>
                <span className="text-xs text-muted-foreground">{doneSubs}/{task.subtasks.length} done</span>
              </div>
              <div className="space-y-2 bg-secondary/20 p-3 rounded-xl border border-border/50">
                {task.subtasks.map((s) => {
                  const isDone = s.completed || (s as any).done;
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={isDone}
                        onCheckedChange={() => toggleSubtask(task.id, s.id)}
                        className="h-4 w-4 rounded"
                      />
                      <span className={`text-sm ${isDone ? "line-through text-muted-foreground" : "text-foreground/90"}`}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0 flex-row items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {task.recurrence && task.recurrence !== "none" && (
                <DropdownMenuItem onClick={handleStopFutureReminders} className="text-warning focus:text-warning focus:bg-warning/10 cursor-pointer">
                  <CalendarX className="h-4 w-4 mr-2" /> Stop Future Reminders
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDeleteTask} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" /> Hard Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="default" 
            onClick={handleToggleComplete} 
            className={`flex-1 sm:flex-none sm:w-auto ${isCompleted ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> 
            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
