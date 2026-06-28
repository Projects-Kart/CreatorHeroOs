import { useEffect, useState } from "react";
import { type Goal, type GoalTarget } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Gift, Trash2, CalendarDays, Timer,
  Globe, ChevronDown, ChevronUp
} from "lucide-react";

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(deadlineDate: string) {
  const getRemaining = () => {
    const diff = new Date(deadlineDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const totalSeconds = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      expired: false,
    };
  };

  const [time, setTime] = useState(getRemaining);

  useEffect(() => {
    const interval = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(interval);
  }, [deadlineDate]);

  return time;
}

// ── Platform icon ──────────────────────────────────────────────────────────────
function PlatformIcon({ platform }: { platform?: string }) {
  const p = (platform ?? "").toLowerCase();
  if (p.includes("youtube"))
    return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>;
  if (p.includes("instagram"))
    return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
  if (p.includes("twitter") || p.includes("x"))
    return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.647l7.733-8.835L1.139 2.25H8.35l4.261 5.638 5.634-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  return <Globe className="h-3.5 w-3.5" />;
}

// ── Single target row ──────────────────────────────────────────────────────────
function TargetRow({
  target,
  onUpdate,
  archived,
}: {
  target: GoalTarget;
  onUpdate: (patch: Partial<GoalTarget>) => void;
  archived?: boolean;
}) {
  const pct = target.targetValue > 0
    ? Math.min(100, (target.currentValue / target.targetValue) * 100)
    : 0;

  return (
    <div className="space-y-2">
      {/* Label + pct */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <PlatformIcon platform={target.platform} />
          {target.label}
          {target.platform && (
            <span className="text-[10px] text-muted-foreground font-normal">({target.platform})</span>
          )}
        </div>
        <span className="text-sm font-bold text-primary tabular-nums">{pct.toFixed(0)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? "linear-gradient(90deg, hsl(142 70% 45%), hsl(142 60% 55%))"
              : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
          }}
        />
      </div>

      {/* Values row */}
      <div className="flex items-center gap-2">
        {!archived ? (
          <Input
            type="number"
            value={target.currentValue}
            onChange={(e) => onUpdate({ currentValue: parseFloat(e.target.value) || 0 })}
            className="h-7 w-28 bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-colors text-xs font-semibold tabular-nums"
          />
        ) : (
          <span className="text-sm font-bold tabular-nums">{target.currentValue.toLocaleString()}</span>
        )}
        <span className="text-xs text-muted-foreground">
          / <b>{target.targetValue.toLocaleString()}</b> {target.unit}
        </span>
        {pct >= 100 && (
          <span className="ml-auto text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
            ✓ Achieved!
          </span>
        )}
      </div>
    </div>
  );
}

// ── Countdown display ──────────────────────────────────────────────────────────
function CountdownTimer({ deadline }: { deadline: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(deadline);

  if (expired) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
        <Timer className="h-4 w-4" /> Deadline passed
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
      <Timer className="h-3.5 w-3.5 text-primary mr-1" />
      <Unit val={days} label="d" />
      <Sep />
      <Unit val={hours} label="h" />
      <Sep />
      <Unit val={minutes} label="m" />
      <Sep />
      <Unit val={seconds} label="s" pulse />
    </div>
  );
}

function Unit({ val, label, pulse }: { val: number; label: string; pulse?: boolean }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className={`font-bold tabular-nums text-sm text-foreground ${pulse ? "animate-pulse" : ""}`}>
        {String(val).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
function Sep() {
  return <span className="text-muted-foreground text-xs mx-0.5 font-bold">:</span>;
}

// ── Main GoalCard ──────────────────────────────────────────────────────────────
export function GoalCard({
  goal,
  onUpdate,
  onDelete,
}: {
  goal: Goal;
  onUpdate: (id: string, patch: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}) {
  const [showMilestones, setShowMilestones] = useState(false);

  const targets = goal.targets ?? [];
  const overallPct = targets.length > 0
    ? targets.reduce((sum, t) => sum + (t.targetValue > 0 ? Math.min(100, (t.currentValue / t.targetValue) * 100) : 0), 0) / targets.length
    : 0;

  const updateTarget = (targetId: string, patch: Partial<GoalTarget>) => {
    const updated = targets.map((t) => (t.id === targetId ? { ...t, ...patch } : t));
    onUpdate(goal.id, { targets: updated });
  };

  return (
    <Card className={`p-6 backdrop-blur-xl shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl group relative overflow-hidden ${goal.archived ? "bg-card/30 opacity-70" : "bg-card/60"}`}>
      {!goal.archived && (
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {goal.archived && (
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">Archived</span>
            )}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground/90">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground/80 mt-1 leading-relaxed">{goal.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(goal.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Overall progress */}
      <div className="relative z-10 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall Progress</span>
          <span className="text-lg font-bold text-primary tabular-nums">{overallPct.toFixed(0)}%</span>
        </div>
        <Progress value={overallPct} className="h-3 rounded-full overflow-hidden shadow-inner" />
      </div>

      {/* Per-target rows */}
      <div className="relative z-10 space-y-4 mb-5">
        {targets.map((t) => (
          <div key={t.id} className="p-3 rounded-xl bg-secondary/20 border border-border/40">
            <TargetRow
              target={t}
              onUpdate={(patch) => updateTarget(t.id, patch)}
              archived={goal.archived}
            />
          </div>
        ))}
      </div>

      {/* Footer: countdown + deadline */}
      <div className="relative z-10 flex items-center gap-3 flex-wrap">
        <CountdownTimer deadline={goal.deadline} />

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Deadline: <b>{new Date(goal.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</b></span>
        </div>

        {!goal.archived && (
          <button
            onClick={() => onUpdate(goal.id, { archived: true })}
            className="ml-auto text-[10px] text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            Archive
          </button>
        )}
      </div>

      {/* Milestones section */}
      {goal.milestones.length > 0 && (
        <div className="relative z-10 mt-5 border-t border-border/40 pt-4">
          <button
            onClick={() => setShowMilestones((v) => !v)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <Trophy className="h-3.5 w-3.5" />
            Milestones ({goal.milestones.filter((m) => m.done).length}/{goal.milestones.length})
            {showMilestones ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
          </button>
          {showMilestones && (
            <ul className="mt-3 space-y-2">
              {goal.milestones.map((m) => (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 text-sm p-2 rounded-lg transition-colors ${m.done ? "bg-success/10 border border-success/20" : "bg-secondary/30 border border-transparent"}`}
                >
                  <div className={`p-1.5 rounded-full ${m.done ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}`}>
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <span className={`font-medium flex-1 ${m.done ? "text-success/90" : "text-foreground/80"}`}>{m.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Reward */}
      {goal.reward && (
        <div className="relative z-10 mt-4 flex items-center gap-3 text-sm font-medium bg-gradient-to-r from-primary/15 to-transparent border border-primary/20 rounded-lg px-4 py-3">
          <Gift className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-foreground/90">{goal.reward}</span>
        </div>
      )}
    </Card>
  );
}
