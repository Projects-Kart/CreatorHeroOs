import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Save } from "lucide-react";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Weekly review — TimeTracker" },
      { name: "description", content: "Structured reflection: wins, blockers, lessons, and a plan for next week." },
      { property: "og:title", content: "Weekly review — TimeTracker" },
      { property: "og:description", content: "Reflect and reset every week." },
    ],
  }),
  component: ReviewPage,
});

const PROMPTS = [
  "What went well this week?",
  "What blocked you the most?",
  "Which task gave the highest leverage?",
  "What will you change next week?",
  "What's one thing to stop doing?",
];

function ReviewPage() {
  const { tasks, videos, goals } = useStore();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= weekStart);
  const wins = [
    ...goals.flatMap((g) => g.milestones.filter((m) => g.currentValue >= m.targetValue).map((m) => ({ title: `${g.title}: ${m.title}`, type: "Milestone" }))),
    ...videos.filter((v) => v.stage === "published").slice(-3).map((v) => ({ title: v.title, type: "Published" })),
  ];

  return (
    <>
      <PageHeader title="Weekly review" subtitle={`Looking back at ${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`} />
      <div className="p-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-4">Reflection</h3>
            <div className="space-y-5">
              {PROMPTS.map((p, i) => (
                <div key={i}>
                  <label className="text-sm font-medium">{p}</label>
                  <Textarea
                    rows={2}
                    className="mt-1.5"
                    value={answers[i] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Reviews stay private. Saved locally.</p>
              <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}>
                <Save className="h-4 w-4 mr-1" /> {saved ? "Saved" : "Save review"}
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3">Plan next week</h3>
            <p className="text-sm text-muted-foreground">
              {tasks.filter((t) => !t.completed && t.dueDate < new Date().toISOString().slice(0, 10)).length} overdue tasks ready to roll forward. Head to the task list to reschedule in one click.
            </p>
          </Card>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight"><Trophy className="h-4 w-4 text-primary" /> Wins this week</div>
            <ul className="mt-3 space-y-2">
              {wins.length === 0 && <li className="text-sm text-muted-foreground">No tracked wins yet — keep going.</li>}
              {wins.map((w, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                  <div><div>{w.title}</div><div className="text-xs text-muted-foreground">{w.type}</div></div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">By the numbers</h3>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Tasks completed</dt><dd>{weekTasks.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Time logged</dt><dd>{weekTasks.reduce((s, t) => s + (t.actualMinutes ?? t.estimatedMinutes ?? 0), 0)}m</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Videos published</dt><dd>{videos.filter((v) => v.stage === "published").length}</dd></div>
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
}