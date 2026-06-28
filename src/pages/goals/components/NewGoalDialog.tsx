import { useState } from "react";
import { useStore } from "@/lib/store";
import { type Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function NewGoalDialog() {
  const { addGoal } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("subscribers");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [unit, setUnit] = useState("subs");
  const [deadline, setDeadline] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() + 4); return d.toISOString().slice(0, 10); });
  const [reward, setReward] = useState("");

  const submit = () => {
    if (!title.trim() || !target) return;
    const t = parseFloat(target);
    addGoal({
      title: title.trim(),
      description: desc.trim() || undefined,
      category,
      targetValue: t,
      currentValue: parseFloat(current) || 0,
      unit,
      deadline,
      reward: reward.trim() || undefined,
      milestones: [
        { id: Math.random().toString(36).slice(2), title: `${(t * 0.33).toFixed(0)} ${unit}`, targetValue: t * 0.33, done: false },
        { id: Math.random().toString(36).slice(2), title: `${(t * 0.66).toFixed(0)} ${unit}`, targetValue: t * 0.66, done: false },
        { id: Math.random().toString(36).slice(2), title: `${t} ${unit}`, targetValue: t, done: false },
      ],
    });
    setOpen(false);
    setTitle(""); setDesc(""); setTarget(""); setReward("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />New goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95">
        <DialogHeader><DialogTitle className="text-xl font-bold text-primary">Create a New Goal</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reach 10K subscribers" autoFocus className="font-medium" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="resize-none" placeholder="Why is this goal important?" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Goal["category"])}>
                <SelectTrigger className="font-medium"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscribers">Subscribers</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="output">Output</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="subs" className="font-medium" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Progress</Label><Input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} className="tabular-nums font-medium" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Amount</Label><Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="tabular-nums font-medium" /></div>
            <div className="col-span-2 space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="font-medium" /></div>
            <div className="col-span-2 space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reward</Label><Input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="e.g. Buy a new microphone" className="font-medium" /></div>
          </div>
        </div>
        <DialogFooter className="border-t border-border/50 pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-secondary/50">Cancel</Button>
          <Button onClick={submit} className="bg-primary text-primary-foreground">Create goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
