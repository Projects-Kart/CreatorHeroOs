import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import type { Goal } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trophy, Gift, Trash2, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — TimeTracker" },
      { name: "description", content: "Set SMART goals, decompose into milestones, and track velocity to deadline." },
      { property: "og:title", content: "Goals — TimeTracker" },
      { property: "og:description", content: "Long-term goals broken down into weekly action." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, updateGoal, deleteGoal } = useStore();
  const active = goals.filter((g) => !g.archived);
  const archived = goals.filter((g) => g.archived);

  return (
    <>
      <PageHeader title="Goals" subtitle="Decompose 6-month outcomes into monthly milestones and weekly action." action={<NewGoalDialog />} />
      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          {active.map((g) => <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />)}
          {active.length === 0 && <Card className="p-10 text-center text-sm text-muted-foreground md:col-span-2">No active goals yet.</Card>}
        </div>
        {archived.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Archived</h3>
            <div className="grid md:grid-cols-2 gap-5">
              {archived.map((g) => <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function GoalCard({ goal, onUpdate, onDelete }: { goal: Goal; onUpdate: (id: string, patch: Partial<Goal>) => void; onDelete: (id: string) => void }) {
  const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
  const totalDays = Math.ceil((new Date(goal.deadline).getTime() - new Date(goal.createdAt).getTime()) / 86400000);
  const elapsed = Math.max(1, totalDays - daysLeft);
  const velocity = goal.currentValue / elapsed;
  const eta = velocity > 0 ? Math.ceil(goal.targetValue / velocity) : Infinity;
  const onTrack = eta <= totalDays;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{goal.category}</div>
          <h3 className="text-lg font-semibold tracking-tight mt-0.5">{goal.title}</h3>
          {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between mb-1.5">
          <div className="text-2xl font-semibold tabular-nums">{goal.currentValue.toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> / {goal.targetValue.toLocaleString()} {goal.unit}</span></div>
          <div className="text-xs text-muted-foreground">{pct.toFixed(0)}%</div>
        </div>
        <Progress value={pct} className="h-1.5" />
        <Input
          type="number"
          value={goal.currentValue}
          onChange={(e) => onUpdate(goal.id, { currentValue: parseFloat(e.target.value) || 0 })}
          className="mt-3 h-8 text-xs w-32"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div><div className="text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Days left</div><div className="font-semibold mt-0.5">{daysLeft}</div></div>
        <div><div className="text-muted-foreground">Pace</div><div className="font-semibold mt-0.5">{velocity.toFixed(1)}/day</div></div>
        <div><div className="text-muted-foreground">ETA</div><div className={"font-semibold mt-0.5 " + (onTrack ? "text-success" : "text-destructive")}>{eta === Infinity ? "—" : `${eta}d`}</div></div>
      </div>

      {goal.milestones.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-1.5">Milestones</div>
          <ul className="space-y-1">
            {goal.milestones.map((m) => {
              const reached = goal.currentValue >= m.targetValue;
              return (
                <li key={m.id} className="flex items-center gap-2 text-sm">
                  <Trophy className={"h-3.5 w-3.5 " + (reached ? "text-primary" : "text-muted-foreground/40")} />
                  <span className={reached ? "" : "text-muted-foreground"}>{m.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">{m.targetValue.toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {goal.reward && (
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft bg-secondary rounded-md px-3 py-2">
          <Gift className="h-4 w-4 text-primary" /> {goal.reward}
        </div>
      )}
    </Card>
  );
}

function NewGoalDialog() {
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
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New goal</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reach 10K subscribers" autoFocus /></div>
          <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Goal["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscribers">Subscribers</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="output">Output</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="subs" /></div>
            <div><Label>Current</Label><Input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
            <div><Label>Target</Label><Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
            <div className="col-span-2"><Label>Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
            <div className="col-span-2"><Label>Reward</Label><Input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Buy a new mic" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}