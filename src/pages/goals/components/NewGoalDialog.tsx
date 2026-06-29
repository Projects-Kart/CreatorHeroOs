import { useState } from "react";
import { useStore } from "@/lib/store";
import { type GoalTarget } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Target, Globe } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

const PLATFORM_PRESETS = [
  { label: "YouTube Subscribers", platform: "YouTube", unit: "subs", icon: () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg> },
  { label: "YouTube Daily Views", platform: "YouTube", unit: "views/day", icon: () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg> },
  { label: "Instagram Followers", platform: "Instagram", unit: "followers", icon: () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
  { label: "Twitter/X Followers", platform: "Twitter/X", unit: "followers", icon: () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.647l7.733-8.835L1.139 2.25H8.35l4.261 5.638 5.634-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: "Custom", platform: "", unit: "", icon: Globe },
];

function TargetRow({
  target,
  onChange,
  onRemove,
}: {
  target: GoalTarget;
  onChange: (patch: Partial<GoalTarget>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-border/60 bg-secondary/20 space-y-3 relative">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="grid grid-cols-2 gap-3 pr-6">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Label</Label>
          <Input
            value={target.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="e.g. YouTube Subscribers"
            className="text-sm font-medium h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform</Label>
          <Input
            value={target.platform ?? ""}
            onChange={(e) => onChange({ platform: e.target.value })}
            placeholder="YouTube, Instagram…"
            className="text-sm h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit</Label>
          <Input
            value={target.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
            placeholder="subs"
            className="text-sm h-8 tabular-nums"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current</Label>
          <Input
            type="number"
            value={target.currentValue}
            onChange={(e) => onChange({ currentValue: parseFloat(e.target.value) || 0 })}
            className="text-sm h-8 tabular-nums"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target</Label>
          <Input
            type="number"
            value={target.targetValue || ""}
            onChange={(e) => onChange({ targetValue: parseFloat(e.target.value) || 0 })}
            placeholder="5000"
            className="text-sm h-8 tabular-nums"
          />
        </div>
      </div>

      {/* Mini progress preview */}
      {target.targetValue > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>{target.currentValue.toLocaleString()} {target.unit}</span>
            <span>{Math.min(100, Math.round((target.currentValue / target.targetValue) * 100))}% of {target.targetValue.toLocaleString()}</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (target.currentValue / target.targetValue) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function NewGoalDialog() {
  const { addGoal } = useStore();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().slice(0, 10);
  });
  const [reward, setReward] = useState("");
  const [targets, setTargets] = useState<GoalTarget[]>([
    { id: uid(), label: "YouTube Subscribers", platform: "YouTube", unit: "subs", currentValue: 0, targetValue: 0 },
  ]);
  const [milestones, setMilestones] = useState<{id: string, title: string, done: boolean}[]>([]);

  const addMilestone = () => {
    setMilestones((m) => [...m, { id: uid(), title: "", done: false }]);
  };

  const updateMilestone = (id: string, title: string) => {
    setMilestones((m) => m.map((x) => (x.id === id ? { ...x, title } : x)));
  };

  const removeMilestone = (id: string) => {
    setMilestones((m) => m.filter((x) => x.id !== id));
  };

  const addTarget = (preset?: typeof PLATFORM_PRESETS[0]) => {
    setTargets((t) => [
      ...t,
      {
        id: uid(),
        label: preset?.label ?? "New Target",
        platform: preset?.platform ?? "",
        unit: preset?.unit ?? "",
        currentValue: 0,
        targetValue: 0,
      },
    ]);
  };

  const updateTarget = (id: string, patch: Partial<GoalTarget>) => {
    setTargets((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const removeTarget = (id: string) => {
    setTargets((t) => t.filter((x) => x.id !== id));
  };

  const reset = () => {
    setTitle(""); setDesc(""); setReward("");
    const d = new Date(); d.setMonth(d.getMonth() + 4);
    setDeadline(d.toISOString().slice(0, 10));
    setTargets([{ id: uid(), label: "YouTube Subscribers", platform: "YouTube", unit: "subs", currentValue: 0, targetValue: 0 }]);
    setMilestones([]);
  };

  const submit = () => {
    if (!title.trim() || targets.length === 0) return;
    addGoal({
      title: title.trim(),
      description: desc.trim() || undefined,
      targets,
      deadline,
      reward: reward.trim() || undefined,
      milestones: milestones.filter(m => m.title.trim() !== ""),
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />New goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl bg-card/95 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Target className="h-5 w-5" /> Create Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Goal title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grow My Creator Presence in 2025"
              autoFocus
              className="font-semibold text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Why does this matter?</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              placeholder="Describe your motivation or strategy…"
            />
          </div>

          {/* Deadline & Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🎁 Reward on completion</Label>
              <Input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Buy a new mic…" className="text-sm" />
            </div>
          </div>

          {/* Targets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Targets ({targets.length})
              </Label>
            </div>

            {targets.map((t) => (
              <TargetRow
                key={t.id}
                target={t}
                onChange={(patch) => updateTarget(t.id, patch)}
                onRemove={() => removeTarget(t.id)}
              />
            ))}

            {/* Quick-add preset buttons */}
            <div className="flex flex-wrap gap-2">
              {PLATFORM_PRESETS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.label}
                    onClick={() => addTarget(p)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all font-medium"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    + {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Milestones ({milestones.length})
              </Label>
            </div>
            
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <Input
                  value={m.title}
                  onChange={(e) => updateMilestone(m.id, e.target.value)}
                  placeholder="e.g. Hit first $500/mo"
                  className="text-sm h-8 flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => removeMilestone(m.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <button
              onClick={addMilestone}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all font-medium"
            >
              <Plus className="h-3.5 w-3.5" /> Add Milestone
            </button>
          </div>
        </div>

        <DialogFooter className="border-t border-border/50 pt-4 gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim() || targets.length === 0} className="bg-primary text-primary-foreground px-6">
            Create Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
