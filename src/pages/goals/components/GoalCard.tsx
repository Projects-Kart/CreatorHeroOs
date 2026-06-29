import { useEffect, useState } from "react";
import { type Goal, type GoalTarget } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Gift, Trash2, CalendarDays, Timer,
  Globe, ChevronDown, ChevronUp, Plus, Minus
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

  const [remaining, setRemaining] = useState(getRemaining());
  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(timer);
  }, [deadlineDate]);

  return remaining;
}

// ── Platform Icons ─────────────────────────────────────────────────────────────
function PlatformIcon({ platform }: { platform?: string }) {
  if (!platform) return <Globe className="h-3.5 w-3.5" />;
  const p = platform.toLowerCase();
  if (p.includes("youtube")) {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-red-500" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (p.includes("twitter") || p.includes("x")) {
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return <Globe className="h-3.5 w-3.5" />;
}

// ── Circular Progress ────────────────────────────────────────────────────────
function CircularProgress({ value }: { value: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent" className="text-secondary/80" />
        <circle 
          cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          className="text-primary transition-all duration-1000 ease-out" 
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Done</span>
        <span className="text-sm font-black text-foreground tabular-nums leading-none">{value.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ── Single target row ──────────────────────────────────────────────────────────
function TargetRow({ target, onUpdate, archived }: { target: GoalTarget; onUpdate: (patch: Partial<GoalTarget>) => void; archived?: boolean; }) {
  const [localVal, setLocalVal] = useState(target.currentValue.toString());

  useEffect(() => {
    setLocalVal(target.currentValue.toString());
  }, [target.currentValue]);

  const updateValue = (newVal: number) => {
    if (isNaN(newVal) || newVal === target.currentValue) return;
    const diff = newVal - target.currentValue;
    const historyEntry = { date: new Date().toISOString(), value: newVal, diff };
    const newHistory = [...(target.history || []), historyEntry];
    
    // Optimistically update local UI to feel instant
    setLocalVal(newVal.toString());
    onUpdate({ currentValue: newVal, history: newHistory });
  };

  // Re-calculate pct using target.currentValue for accurate progress rendering
  const pct = target.targetValue > 0 ? Math.min(100, (target.currentValue / target.targetValue) * 100) : 0;

  return (
    <div className="flex items-center justify-between gap-4 group">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-md bg-secondary text-foreground shrink-0 border border-border/50">
          <PlatformIcon platform={target.platform} />
        </div>
        <span className="text-sm font-bold text-foreground/90 truncate">{target.label}</span>
      </div>
      
      <div className="flex flex-col items-end shrink-0 w-[140px]">
        <div className="flex items-center w-full justify-end">
          {archived ? (
            <div className="flex items-baseline gap-1 px-3 py-1">
              <span className="text-sm font-black tabular-nums">{target.currentValue.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground font-bold whitespace-nowrap">/ {target.targetValue.toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex items-center bg-secondary/40 rounded-full border border-border/50 p-0.5 shadow-sm transition-colors hover:bg-secondary/60 focus-within:bg-secondary/60 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
              <button 
                type="button" 
                onClick={() => updateValue(target.currentValue - 1)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              
              <div className="flex items-baseline px-1 shrink-0">
                <input
                  type="number"
                  value={localVal}
                  onChange={(e) => setLocalVal(e.target.value)}
                  onBlur={() => updateValue(parseFloat(localVal) || 0)}
                  onKeyDown={(e) => { if(e.key === 'Enter') updateValue(parseFloat(localVal) || 0); }}
                  className="w-10 text-right font-black text-sm bg-transparent border-0 p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground/90"
                />
                <span className="text-[10px] text-muted-foreground font-bold whitespace-nowrap ml-1">
                  / {target.targetValue.toLocaleString()}
                </span>
              </div>

              <button 
                type="button" 
                onClick={() => updateValue(target.currentValue + 1)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden mt-2.5">
           <div 
             className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-primary/80'}`} 
             style={{ width: `${pct}%` }} 
           />
        </div>
      </div>
    </div>
  );
}

// ── Countdown display ──────────────────────────────────────────────────────────
function CountdownTimer({ deadline, achievedAt }: { deadline: string; achievedAt?: string | null }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(deadline);

  if (achievedAt) {
    const d = new Date(achievedAt);
    const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const timeStr = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return (
      <div className="flex items-center gap-1.5 text-green-500 text-[11px] font-black uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
        <Trophy className="h-3.5 w-3.5" /> 
        <span>Achieved: {dateStr}, {timeStr}</span>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 text-destructive text-[11px] font-black uppercase tracking-widest bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20">
        <Timer className="h-3.5 w-3.5" /> Expired
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 text-xs font-black tabular-nums bg-secondary/30 px-3 py-1.5 rounded-full border border-border/30">
      <Timer className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-baseline gap-0.5"><span className="text-foreground/90">{pad(days)}</span><span className="text-[9px] text-muted-foreground uppercase">d</span></div>
      <span className="text-muted-foreground/30">:</span>
      <div className="flex items-baseline gap-0.5"><span className="text-foreground/90">{pad(hours)}</span><span className="text-[9px] text-muted-foreground uppercase">h</span></div>
      <span className="text-muted-foreground/30">:</span>
      <div className="flex items-baseline gap-0.5"><span className="text-foreground/90">{pad(minutes)}</span><span className="text-[9px] text-muted-foreground uppercase">m</span></div>
      <span className="text-muted-foreground/30">:</span>
      <div className="flex items-baseline gap-0.5"><span className="text-primary animate-pulse">{pad(seconds)}</span><span className="text-[9px] text-muted-foreground uppercase">s</span></div>
    </div>
  );
}

// ── Main GoalCard ──────────────────────────────────────────────────────────────
export function GoalCard({ goal, onUpdate, onDelete }: { goal: Goal; onUpdate: (id: string, patch: Partial<Goal>) => void; onDelete: (id: string) => void; }) {
  const targets = goal.targets ?? [];
  const overallPct = targets.length > 0
    ? targets.reduce((sum, t) => sum + (t.targetValue > 0 ? Math.min(100, (t.currentValue / t.targetValue) * 100) : 0), 0) / targets.length
    : 0;
  
  const isAchieved = overallPct >= 100;

  useEffect(() => {
    if (isAchieved && !goal.achievedAt) {
      onUpdate(goal.id, { achievedAt: new Date().toISOString() });
    } else if (!isAchieved && goal.achievedAt) {
      onUpdate(goal.id, { achievedAt: null });
    }
  }, [isAchieved, goal.achievedAt, goal.id, onUpdate]);

  const updateTarget = (targetId: string, patch: Partial<GoalTarget>) => {
    const updated = targets.map((t) => (t.id === targetId ? { ...t, ...patch } : t));
    onUpdate(goal.id, { targets: updated });
  };

  return (
    <div className={`p-3 grid grid-cols-1 md:grid-cols-12 gap-3 bg-card border border-border/40 rounded-[2rem] shadow-sm transition-all hover:shadow-md ${goal.archived ? "opacity-70 grayscale-[0.3]" : ""}`}>
      
      {/* ── Bento Block 1: Header (Spans 8 cols) ── */}
      <div className="md:col-span-8 bg-secondary/30 p-6 rounded-[1.5rem] border border-border/30 flex flex-col justify-between relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-colors duration-1000 ${isAchieved ? 'bg-green-500/20' : 'bg-primary/10'}`} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-4">
            <div>
              {goal.archived && <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground bg-secondary px-2 py-0.5 rounded mb-2 inline-block">Archived</span>}
              <h3 className="text-2xl font-black tracking-tight text-foreground">{goal.title}</h3>
              {goal.reward && (
                <p className={`text-sm font-bold mt-1.5 flex items-center gap-1.5 transition-colors ${isAchieved ? 'text-green-500' : 'text-primary'}`}>
                  <Gift className="h-4 w-4" /> Reward: {goal.reward}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {!goal.archived && (
                 <Button variant="ghost" size="icon" onClick={() => onUpdate(goal.id, { archived: true })} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                    <CalendarDays className="h-4 w-4" />
                 </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-4 relative z-10">
          <CountdownTimer deadline={goal.deadline} achievedAt={goal.achievedAt} />
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest hidden sm:inline-block">
            Target: {new Date(goal.deadline).toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"})}
          </span>
        </div>
      </div>

      {/* ── Bento Block 2: Overall Progress (Spans 4 cols) ── */}
      <div className={`md:col-span-4 p-6 rounded-[1.5rem] border flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-700 ${isAchieved ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/5 border-primary/20'}`}>
        <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${isAchieved ? 'from-transparent to-green-500/10' : 'from-transparent to-primary/10'}`} />
        <span className={`text-[11px] font-black uppercase tracking-widest mb-1 z-10 transition-colors ${isAchieved ? 'text-green-600 dark:text-green-400' : 'text-primary/70'}`}>
          {isAchieved ? 'Completed!' : 'Overall'}
        </span>
        <span className={`text-5xl font-black tabular-nums z-10 tracking-tighter transition-colors ${isAchieved ? 'text-green-500' : 'text-primary'}`}>
          {overallPct.toFixed(0)}%
        </span>
        
        {/* Massive background progress bar fill */}
        <div className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out ${isAchieved ? 'bg-green-500/20' : 'bg-primary/10'}`} style={{ height: `${overallPct}%` }} />
      </div>

      {/* ── Bento Block 3: Targets ── */}
      <div className={`p-6 bg-card rounded-[1.5rem] border border-border/50 shadow-sm ${goal.milestones.length > 0 ? 'md:col-span-7' : 'md:col-span-12'}`}>
        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Targets
        </h4>
        <div className="space-y-4">
          {targets.map(t => (
            <TargetRow key={t.id} target={t} onUpdate={(patch) => updateTarget(t.id, patch)} archived={goal.archived} />
          ))}
        </div>
      </div>

      {/* ── Bento Block 4: Milestones ── */}
      {goal.milestones.length > 0 && (
        <div className="md:col-span-5 p-6 bg-card rounded-[1.5rem] border border-border/50 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" /> Milestones
            </h4>
            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {goal.milestones.filter(m => m.done).length} / {goal.milestones.length}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {goal.milestones.map(m => (
              <div 
                key={m.id} 
                onClick={() => {
                  const newMilestones = goal.milestones.map(mile => mile.id === m.id ? { ...mile, done: !mile.done } : mile);
                  onUpdate(goal.id, { milestones: newMilestones });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border select-none ${m.done ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-secondary/40 text-foreground/80 border-transparent hover:bg-secondary/80'}`}
              >
                {m.done && <span className="mr-1.5 opacity-80">✓</span>}
                <span className={m.done ? "line-through opacity-90" : ""}>{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
