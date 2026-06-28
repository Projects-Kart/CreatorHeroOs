import { useState } from "react";
import { useStore } from "@/lib/store";
import { type Task, CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function NewTaskDialog({ defaultDate }: { defaultDate?: string }) {
  const { addTask } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Task["category"]>("deep-work");
  const [dueDate, setDueDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [est, setEst] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      category,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      estimatedMinutes: parseInt(est) || undefined,
    });
    setOpen(false);
    setTitle("");
    setEst("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />New task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-card/95">
        <DialogHeader><DialogTitle className="text-xl font-bold text-primary">Add a Task</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Write script for video" autoFocus className="font-medium" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Task["category"])}>
              <SelectTrigger className="font-medium"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="font-medium" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. Time (min)</Label><Input type="number" value={est} onChange={(e) => setEst(e.target.value)} placeholder="e.g. 60" className="font-medium" /></div>
          </div>
        </div>
        <DialogFooter className="border-t border-border/50 pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-secondary/50">Cancel</Button>
          <Button onClick={submit} className="bg-primary text-primary-foreground">Add task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
