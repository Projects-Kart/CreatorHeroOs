import { type Goal } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Trophy, Gift, Trash2, CalendarDays, Target } from "lucide-react";

export function GoalCard({ goal, onUpdate, onDelete }: { goal: Goal; onUpdate: (id: string, patch: Partial<Goal>) => void; onDelete: (id: string) => void }) {
  const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
  const totalDays = Math.ceil((new Date(goal.deadline).getTime() - new Date(goal.createdAt).getTime()) / 86400000);
  const elapsed = Math.max(1, totalDays - daysLeft);
  const velocity = goal.currentValue / elapsed;
  const eta = velocity > 0 ? Math.ceil(goal.targetValue / velocity) : Infinity;
  const onTrack = eta <= totalDays;
  
  return (
    <Card className={"p-6 backdrop-blur-xl shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl group relative overflow-hidden " + (goal.archived ? "bg-card/30 opacity-70" : "bg-card/60")}>
      {!goal.archived && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      )}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">{goal.category}</span>
            {goal.archived && <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">Archived</span>}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground/90">{goal.title}</h3>
          {goal.description && <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">{goal.description}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 relative z-10">
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {goal.currentValue.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              / {goal.targetValue.toLocaleString()} <span className="uppercase text-[10px] tracking-wider">{goal.unit}</span>
            </span>
          </div>
          <div className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{pct.toFixed(1)}%</div>
        </div>
        <Progress value={pct} className="h-2.5 rounded-full overflow-hidden shadow-inner bg-secondary/50" />
        
        {!goal.archived && (
          <div className="mt-4 flex items-center gap-3">
            <Input
              type="number"
              value={goal.currentValue}
              onChange={(e) => onUpdate(goal.id, { currentValue: parseFloat(e.target.value) || 0 })}
              className="h-9 w-32 bg-background/50 border-border/50 hover:border-primary/50 focus:border-primary transition-colors text-sm font-medium tabular-nums"
            />
            <span className="text-xs text-muted-foreground font-medium">Update current progress</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-sm bg-secondary/20 p-4 rounded-xl border border-border/50 relative z-10">
        <div>
          <div className="text-muted-foreground text-xs font-medium flex items-center gap-1.5 mb-1"><CalendarDays className="h-3.5 w-3.5" /> Time left</div>
          <div className="font-bold">{Math.max(0, daysLeft)} days</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs font-medium flex items-center gap-1.5 mb-1"><Target className="h-3.5 w-3.5" /> Pace</div>
          <div className="font-bold">{velocity.toFixed(1)} <span className="text-[10px] font-normal uppercase text-muted-foreground">/day</span></div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs font-medium mb-1">Estimated ETA</div>
          <div className={"font-bold " + (onTrack ? "text-success" : "text-destructive")}>{eta === Infinity ? "—" : `${eta}d`}</div>
        </div>
      </div>

      {goal.milestones.length > 0 && (
        <div className="mt-6 relative z-10">
          <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">Milestones</div>
          <ul className="space-y-2">
            {goal.milestones.map((m) => {
              const reached = goal.currentValue >= m.targetValue;
              return (
                <li key={m.id} className={"flex items-center gap-3 text-sm p-2 rounded-lg transition-colors " + (reached ? "bg-success/10 border border-success/20" : "bg-secondary/30 border border-transparent")}>
                  <div className={"p-1.5 rounded-full " + (reached ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground")}>
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <span className={"font-medium flex-1 " + (reached ? "text-success/90" : "text-foreground/80")}>{m.title}</span>
                  <span className={"text-xs tabular-nums font-bold px-2 py-1 rounded-md " + (reached ? "bg-success/20 text-success" : "bg-secondary/80 text-muted-foreground")}>
                    {m.targetValue.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {goal.reward && (
        <div className="mt-5 flex items-center gap-3 text-sm font-medium bg-gradient-to-r from-primary/15 to-transparent border border-primary/20 rounded-lg px-4 py-3 relative z-10">
          <Gift className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-foreground/90">{goal.reward}</span>
        </div>
      )}
    </Card>
  );
}
