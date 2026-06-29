import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES, isTaskCompletedOnDate, type Task } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  CheckCircle2, Trash2, Flag, Search, MoreHorizontal, LayoutList, LayoutGrid, 
  AlertTriangle, MessageSquare, ListTodo, ChevronDown, Plus, 
  Filter, CheckSquare, Clock
} from "lucide-react";
import { NewTaskDialog } from "./components/NewTaskDialog";
import { TaskDetailsDialog } from "./components/TaskDetailsDialog";

export function TasksPage() {
  const { tasks, toggleTask, deleteTask } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  // Stats
  const lowPriorityCount = tasks.filter(t => t.priority === "optional").length;
  const mediumPriorityCount = tasks.filter(t => t.priority === "normal").length;
  const highPriorityCount = tasks.filter(t => t.priority === "required").length;
  const totalTasks = tasks.length;
  const totalTasksDone = tasks.filter(t => isTaskCompletedOnDate(t, today)).length;
  const overdueCount = tasks.filter(t => !isTaskCompletedOnDate(t, today) && t.endDate < today).length;

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      const isCompleted = isTaskCompletedOnDate(t, today);
      const isOverdue = !isCompleted && t.endDate < today;
      const isDoing = !isCompleted && !isOverdue && t.startDate <= today && t.endDate >= today;
      const isTodo = !isCompleted && !isOverdue && t.startDate > today;

      if (filter === "todo") return isTodo;
      if (filter === "inprogress") return isDoing;
      if (filter === "overdue") return isOverdue;
      if (filter === "completed") return isCompleted;
      return true; // all
    });
  }, [tasks, filter, search, today]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      todo: tasks.filter(t => { const c = isTaskCompletedOnDate(t, today); return !c && t.startDate > today && !(t.endDate < today); }).length,
      inprogress: tasks.filter(t => { const c = isTaskCompletedOnDate(t, today); return !c && t.startDate <= today && t.endDate >= today; }).length,
      overdue: tasks.filter(t => !isTaskCompletedOnDate(t, today) && t.endDate < today).length,
      completed: tasks.filter(t => isTaskCompletedOnDate(t, today)).length,
      all: tasks.length
    }
  }, [tasks, today]);

  const renderRow = (t: Task) => {
    const c = CATEGORIES.find((x) => x.id === t.category) ?? CATEGORIES[0];
    const isCompleted = isTaskCompletedOnDate(t, today);
    const isOverdue = !isCompleted && t.endDate < today;
    const isDoing = !isCompleted && !isOverdue && t.startDate <= today && t.endDate >= today;
    
    // Status Badge
    let statusBadge = null;
    if (isCompleted) {
      statusBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-success/15 text-success"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
    } else if (isOverdue) {
      statusBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-destructive/15 text-destructive"><AlertTriangle className="h-3 w-3" /> Overdue</span>;
    } else if (isDoing) {
      statusBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-500"><Clock className="h-3 w-3" /> Doing</span>;
    } else {
      statusBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-muted text-muted-foreground"><CheckCircle2 className="h-3 w-3" /> To do</span>;
    }

    // Priority Map
    const priorityColor = t.priority === 'required' ? 'text-rose-500' : t.priority === 'normal' ? 'text-amber-500' : 'text-emerald-500';
    const priorityLabel = t.priority === 'required' ? 'High' : t.priority === 'normal' ? 'Medium' : 'Low';

    const subtasksCount = t.subtasks?.length || 0;
    const hasNotes = !!t.description;

    return (
      <div key={t.id} onClick={() => setSelectedTask(t)} className="grid grid-cols-[1fr_200px_150px_150px_150px_50px] items-center gap-4 py-3.5 px-4 border-b border-border/40 hover:bg-secondary/40 transition-colors cursor-pointer group">
        
        {/* Task Title & Checkbox */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <Checkbox 
            checked={isCompleted} 
            onClick={(e) => { e.stopPropagation(); toggleTask(t.id, today); }} 
            className="h-4 w-4 shrink-0 rounded-[4px] border-border/50 bg-background data-[state=checked]:bg-success data-[state=checked]:border-success transition-all shadow-sm"
          />
          <span className={`text-[13px] font-semibold truncate transition-colors ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}>
            {t.title}
          </span>
          {(hasNotes || subtasksCount > 0) && (
            <div className="flex items-center gap-2.5 ml-2 text-muted-foreground shrink-0 font-medium">
              {hasNotes && <div className="flex items-center gap-1 text-[11px]"><MessageSquare className="h-3.5 w-3.5" /> 1</div>}
              {subtasksCount > 0 && <div className="flex items-center gap-1 text-[11px]"><ListTodo className="h-3.5 w-3.5" /> {subtasksCount}</div>}
            </div>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 truncate">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap bg-secondary/50"
            style={{ color: `var(--${c.token})` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--${c.token})` }} />
            {c.label}
          </span>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2 text-[12px] font-bold">
          <Flag className={`h-3.5 w-3.5 ${priorityColor}`} />
          <span className={priorityColor}>{priorityLabel}</span>
        </div>

        {/* Status */}
        <div className="flex items-center">
          {statusBadge}
        </div>

        {/* Due Date */}
        <div className="text-[12px] font-bold text-muted-foreground/80">
          {new Date(t.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this task?")) deleteTask(t.id);
              }} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col bg-background/50">
      
      {/* Top Section */}
      <div className="px-6 pt-6 pb-4 space-y-6">
        
        {/* Toolbar */}
        <div className="flex items-center gap-4 justify-between flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-[200px] pl-9 bg-card border-border/60 shadow-sm h-9 text-sm rounded-lg" 
              />
            </div>
            
            <div className="flex items-center bg-card rounded-lg p-0.5 border border-border/60 shadow-sm ml-1 h-9">
              <button className="px-2 h-full bg-background rounded-md shadow-sm text-foreground"><LayoutList className="h-4 w-4" /></button>
              <button className="px-2 h-full text-muted-foreground hover:text-foreground transition-colors"><LayoutGrid className="h-4 w-4" /></button>
            </div>
            
            <div className="flex items-center gap-1 ml-2 bg-card p-0.5 rounded-lg border border-border/60 shadow-sm h-9 overflow-x-auto hide-scrollbar">
               <button onClick={() => setFilter("todo")} className={`px-3 h-full rounded-md text-[12px] font-bold flex items-center gap-2 transition-all ${filter === "todo" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>To Do <span className="bg-secondary/80 px-1.5 rounded-sm text-[10px]">{counts.todo}</span></button>
               <button onClick={() => setFilter("inprogress")} className={`px-3 h-full rounded-md text-[12px] font-bold flex items-center gap-2 transition-all ${filter === "inprogress" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Inprogress <span className="bg-secondary/80 px-1.5 rounded-sm text-[10px]">{counts.inprogress}</span></button>
               <button onClick={() => setFilter("overdue")} className={`px-3 h-full rounded-md text-[12px] font-bold flex items-center gap-2 transition-all ${filter === "overdue" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Overdue <span className="bg-secondary/80 px-1.5 rounded-sm text-[10px]">{counts.overdue}</span></button>
               <button onClick={() => setFilter("completed")} className={`px-3 h-full rounded-md text-[12px] font-bold flex items-center gap-2 transition-all ${filter === "completed" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Completed <span className="bg-secondary/80 px-1.5 rounded-sm text-[10px]">{counts.completed}</span></button>
               <button onClick={() => setFilter("all")} className={`px-3 h-full rounded-md text-[12px] font-bold flex items-center gap-2 transition-all ${filter === "all" ? "bg-orange-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>All <span className={`px-1.5 rounded-sm text-[10px] ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-secondary/80 text-foreground'}`}>{counts.all}</span></button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-9 font-bold text-xs text-foreground bg-card border-border/60 shadow-sm hidden xl:flex">Assignee <ChevronDown className="h-3 w-3 ml-2 text-muted-foreground" /></Button>
             <Button variant="outline" className="h-9 font-bold text-xs text-foreground bg-card border-border/60 shadow-sm hidden xl:flex">Priority <ChevronDown className="h-3 w-3 ml-2 text-muted-foreground" /></Button>
             <Button variant="outline" className="h-9 font-bold text-xs text-foreground bg-card border-border/60 shadow-sm"><Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Filter</Button>
             <NewTaskDialog trigger={
                <Button className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white h-9 font-bold text-xs px-4 shadow-sm rounded-lg">
                  <Plus className="h-4 w-4 mr-1.5" /> Create Task
                </Button>
             }/>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           <Card className="p-4 flex flex-col justify-between gap-3 shadow-sm border-border/50 bg-card/60">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
               <Flag className="h-3.5 w-3.5 text-emerald-500" /> Low Priority
             </div>
             <div className="text-2xl font-black text-foreground">{lowPriorityCount}</div>
           </Card>
           <Card className="p-4 flex flex-col justify-between gap-3 shadow-sm border-border/50 bg-card/60">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
               <Flag className="h-3.5 w-3.5 text-amber-500" /> Medium Priority
             </div>
             <div className="text-2xl font-black text-foreground">{mediumPriorityCount}</div>
           </Card>
           <Card className="p-4 flex flex-col justify-between gap-3 shadow-sm border-border/50 bg-card/60">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
               <Flag className="h-3.5 w-3.5 text-rose-500" /> High Priority
             </div>
             <div className="text-2xl font-black text-foreground">{highPriorityCount}</div>
           </Card>
           <Card className="p-4 flex flex-col justify-between gap-3 shadow-sm border-border/50 bg-card/60">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
               <ListTodo className="h-4 w-4 text-blue-500" /> Total Task
             </div>
             <div className="text-2xl font-black text-foreground">{totalTasks}</div>
           </Card>
           <Card className="p-4 flex flex-col justify-between gap-3 shadow-sm border-border/50 bg-card/60">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
               <CheckSquare className="h-4 w-4 text-emerald-500" /> Total Task Done
             </div>
             <div className="text-2xl font-black text-foreground">{totalTasksDone}</div>
           </Card>
           <Card className="p-4 flex flex-col justify-between gap-3 shadow-sm border-border/50 bg-card/60">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
               <AlertTriangle className="h-4 w-4 text-rose-500" /> Overdue
             </div>
             <div className="text-2xl font-black text-foreground">{overdueCount}</div>
           </Card>
        </div>

      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-card rounded-t-2xl mx-6 border border-border/50 border-b-0 shadow-sm relative">
        <div className="min-w-[900px]">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_200px_150px_150px_150px_50px] items-center gap-4 py-3.5 px-4 border-b border-border/60 text-[11px] uppercase tracking-wider font-bold text-muted-foreground sticky top-0 bg-card/95 backdrop-blur-md z-10">
             <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">Task <ChevronDown className="h-3 w-3" /></div>
             <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">Category <ChevronDown className="h-3 w-3" /></div>
             <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">Priority <ChevronDown className="h-3 w-3" /></div>
             <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">Status <ChevronDown className="h-3 w-3" /></div>
             <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">Due Date <ChevronDown className="h-3 w-3" /></div>
             <div></div>
          </div>
          
          {/* Table Body */}
          <div className="pb-8">
            {filteredTasks.map(renderRow)}
            {filteredTasks.length === 0 && (
              <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
                <ListTodo className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-semibold">No tasks found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskDetailsDialog task={selectedTask} date={today} onClose={() => setSelectedTask(null)} />
    </div>
  )
}
