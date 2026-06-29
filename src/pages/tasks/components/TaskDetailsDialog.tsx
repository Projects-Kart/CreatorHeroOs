import { useState } from "react";
import { type Task, CATEGORIES, isTaskCompletedOnDate } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarX, Clock, Calendar, RepeatIcon, MapPin, Users, Video, MoreVertical, Edit2, Share, AlignLeft, Target, Flag, AlertTriangle, Activity, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewTaskDialog } from "./NewTaskDialog";

interface Props {
  task: Task | null;
  date?: string;
  onClose: () => void;
}

export function TaskDetailsDialog({ task, date, onClose }: Props) {
  const { deleteTask, updateTask, toggleSubtask, toggleTask } = useStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!task) return null;

  const category = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0];
  
  const handleDeleteTask = () => {
    deleteTask(task.id);
    onClose();
  };

  const handleStopFutureReminders = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    updateTask(task.id, { endDate: yesterday.toISOString().slice(0, 10) });
    onClose();
  };

  const contextDate = date || new Date().toISOString().slice(0, 10);
  const isCompleted = isTaskCompletedOnDate(task, contextDate);
  const isOverdue = !isCompleted && task.endDate < contextDate;

  let statusText = "To Do";
  let statusColor = "bg-muted text-muted-foreground";
  if (isCompleted) {
    statusText = "Completed";
    statusColor = "bg-success/15 text-success";
  } else if (isOverdue) {
    statusText = "Overdue";
    statusColor = "bg-destructive/15 text-destructive";
  } else if (task.startDate <= contextDate && task.endDate >= contextDate) {
    statusText = "Doing";
    statusColor = "bg-primary/15 text-primary";
  }

  const handleToggleComplete = () => {
    if (!isCompleted && task.subtasks?.length > 0) {
      const updatedSubtasks = task.subtasks.map(s => ({ ...s, completed: true }));
      updateTask(task.id, { subtasks: updatedSubtasks });
    }
    toggleTask(task.id, contextDate);
    // Don't close so they can see it completed
  };

  const hasSubs = task.subtasks && task.subtasks.length > 0;
  const doneSubs = task.subtasks?.filter(s => s.completed || (s as any).done)?.length || 0;
  const progressPercent = hasSubs ? Math.round((doneSubs / task.subtasks.length) * 100) : (isCompleted ? 100 : 0);

  const priorityColor = task.priority === 'required' ? 'bg-rose-500 text-white' : task.priority === 'normal' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';

  return (
    <>
      <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:w-[500px] sm:max-w-none p-0 flex flex-col gap-0 border-l border-border/50 bg-background overflow-hidden [&>button.absolute]:hidden">
          
          {/* Custom Header Actions */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card">
            <div className="flex items-center gap-2">
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            <div className="flex items-center gap-1.5">
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                <Edit2 className="h-4 w-4" />
              </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Share className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {task.recurrence && task.recurrence !== "none" && (
                  <DropdownMenuItem onClick={handleStopFutureReminders} className="text-warning focus:text-warning focus:bg-warning/10 cursor-pointer">
                    <CalendarX className="h-4 w-4 mr-2" /> Stop Future Reminders
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDeleteTask} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Title */}
            <SheetHeader>
              <SheetTitle className="text-3xl font-black tracking-tight">{task.title}</SheetTitle>
            </SheetHeader>

            {/* Metadata Grid */}
            <div className="grid grid-cols-[120px_1fr] gap-y-4 items-center text-[13px]">
              
              <div className="text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Priority
              </div>
              <div>
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs capitalize ${priorityColor}`}>
                  {task.priority === "required" ? "High" : task.priority === "normal" ? "Medium" : "Low"}
                </span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Status
              </div>
              <div>
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${statusColor}`}>
                  {statusText}
                </span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Start date
              </div>
              <div className="font-medium text-foreground">
                {new Date(task.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <CalendarX className="h-4 w-4" /> Due date
              </div>
              <div className="font-medium text-foreground">
                {new Date(task.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {task.recurrence && task.recurrence !== "none" && (
                <>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <RepeatIcon className="h-4 w-4" /> Repeats
                  </div>
                  <div className="font-medium text-foreground capitalize">
                    {task.recurrence}
                    {task.recurrence === "weekly" && task.recurrenceDays && task.recurrenceDays.length > 0 && (
                      <span className="text-muted-foreground normal-case ml-1">
                        on {task.recurrenceDays.join(", ")}
                      </span>
                    )}
                  </div>
                </>
              )}

              <div className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Progress
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-success' : 'bg-primary'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs font-bold w-8">{progressPercent}%</span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Category
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-secondary text-foreground border border-border/50">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--${category.token})` }} />
                  {category.label}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-secondary/40 p-4 rounded-xl border border-border/50">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <AlignLeft className="h-3.5 w-3.5" /> Description
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">
                {task.description || <span className="italic text-muted-foreground">No description provided.</span>}
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="subtasks" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent p-0 h-auto gap-4">
                <TabsTrigger value="subtasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3">
                  Subtasks <span className="ml-2 bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm text-[10px] font-bold">{hasSubs ? task.subtasks.length : 0}</span>
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3">
                  Comments <span className="ml-2 bg-secondary px-1.5 py-0.5 rounded-sm text-[10px] font-bold">0</span>
                </TabsTrigger>
                <TabsTrigger value="activities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3">
                  Activities
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="subtasks" className="pt-6 outline-none">
                {hasSubs ? (
                  <div className="space-y-4">
                    {task.subtasks.map((s) => {
                      const isDone = s.completed || (s as any).done;
                      return (
                        <div key={s.id} className="flex items-start gap-3 group">
                          <Checkbox
                            checked={isDone}
                            onCheckedChange={() => toggleSubtask(task.id, s.id)}
                            className="mt-0.5 h-4 w-4 rounded-[4px] border-border/50 data-[state=checked]:bg-success data-[state=checked]:border-success transition-all shadow-sm"
                          />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold transition-colors ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {s.title}
                            </p>
                            {isDone && <p className="text-[10px] text-muted-foreground mt-1">Completed</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm font-medium">No subtasks found.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm font-medium">No comments yet.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="activities" className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm font-medium">No recent activities.</p>
                </div>
              </TabsContent>
            </Tabs>
            
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-border/50 bg-card">
          <Button 
            variant="default" 
            onClick={handleToggleComplete} 
            className={`w-full py-6 font-bold text-[15px] ${isCompleted ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"}`}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" /> 
            {isCompleted ? "Mark Task Incomplete" : "Mark Task Complete"}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
    <NewTaskDialog editTask={task} open={isEditing} onOpenChange={setIsEditing} />
    </>
  );
}
