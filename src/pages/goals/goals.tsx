import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { GoalCard } from "./components/GoalCard";
import { NewGoalDialog } from "./components/NewGoalDialog";

export function GoalsPage() {
  const { goals, updateGoal, deleteGoal } = useStore();
  const sortedGoals = [...goals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const active = sortedGoals.filter((g) => !g.archived);
  const archived = sortedGoals.filter((g) => g.archived);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Goals" subtitle="Decompose 6-month outcomes into monthly milestones and weekly action." action={<NewGoalDialog />} />
      <div className="p-8 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Active Goals <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">{active.length}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {active.map((g) => <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />)}
            {active.length === 0 && (
              <Card className="p-12 text-center text-sm text-muted-foreground md:col-span-2 border-dashed bg-secondary/20 flex flex-col items-center justify-center gap-3">
                <div className="text-lg font-medium text-foreground/80">No active goals right now</div>
                <p className="max-w-md mx-auto">Set a goal for your channel's growth, and we'll help you track your daily pace towards it.</p>
                <div className="mt-2 opacity-80"><NewGoalDialog /></div>
              </Card>
            )}
          </div>
        </section>

        {archived.length > 0 && (
          <section className="pt-6 border-t border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold tracking-tight text-muted-foreground flex items-center gap-2">
                Archived <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-semibold">{archived.length}</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {archived.map((g) => <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
