import { useEffect, useState } from "react";
import { resolveShareToken, getPublicUserData, type ShareToken } from "@/lib/firestore";
import type { Task, Goal, Video } from "@/lib/types";
import { isTaskActiveOnDate, PIPELINE_STAGES } from "@/lib/types";
import { Eye, Flame, Target, Film, CheckSquare, Lock } from "lucide-react";

type SharedData = {
  meta: ShareToken;
  tasks: Task[];
  goals: Goal[];
  videos: Video[];
};

interface SharePageProps {
  token: string;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(tasks: Task[]): number {
  const days = new Set(
    tasks.filter((t) => t.completed && t.completedAt).map((t) => t.completedAt!.slice(0, 10)),
  );
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      if (streak === 0) {
        d.setDate(d.getDate() - 1);
        if (days.has(d.toISOString().slice(0, 10))) {
          streak++;
          d.setDate(d.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return streak;
}

export function SharePage({ token }: SharePageProps) {
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const meta = await resolveShareToken(token);
        if (!meta) { setNotFound(true); setLoading(false); return; }
        const { tasks, goals, videos } = await getPublicUserData(meta.uid);
        setData({ meta, tasks, goals, videos });
      } catch (err) {
        console.error("SharePage load error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--background))", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 40, height: 40, border: "3px solid hsl(var(--border))", borderTopColor: "hsl(var(--primary))", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem" }}>Loading shared workspace…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--background))", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>Link not found</h1>
          <p style={{ color: "hsl(var(--muted-foreground))", marginTop: "0.5rem", fontSize: "0.9375rem" }}>
            This share link may have been revoked or doesn't exist.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block", marginTop: "1.5rem", padding: "0.625rem 1.25rem",
              background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
              borderRadius: "0.5rem", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
            }}
          >
            Go to TimeTracker
          </a>
        </div>
      </div>
    );
  }

  const { meta, tasks, goals, videos } = data;
  const today = todayKey();
  const todaysTasks = tasks.filter((t) => isTaskActiveOnDate(t, today));
  const doneTasks = todaysTasks.filter((t) => t.completed);
  const streak = computeStreak(tasks);

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))", fontFamily: "Inter, sans-serif", color: "hsl(var(--foreground))" }}>

      {/* View-only banner */}
      <div style={{
        background: "linear-gradient(90deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.06))",
        borderBottom: "1px solid hsl(var(--primary) / 0.2)",
        padding: "0.5rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
      }}>
        <Eye style={{ width: 14, height: 14, color: "hsl(var(--primary))" }} />
        <span style={{ fontSize: "0.8125rem", color: "hsl(var(--primary))", fontWeight: 500 }}>
          View-only shared workspace — you cannot edit anything
        </span>
        <Lock style={{ width: 12, height: 12, color: "hsl(var(--primary))" }} />
      </div>

      {/* Header */}
      <div style={{
        padding: "2.5rem 2rem 1.5rem",
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", gap: "1.25rem",
        borderBottom: "1px solid hsl(var(--border) / 0.6)",
      }}>
        {meta.ownerPhoto ? (
          <img src={meta.ownerPhoto} alt="avatar" style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid hsl(var(--primary) / 0.3)", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "hsl(var(--primary) / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--primary))" }}>
            {meta.ownerName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{meta.ownerName}'s Progress</h1>
          <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "hsl(var(--primary) / 0.1)", borderRadius: "999px", border: "1px solid hsl(var(--primary) / 0.2)" }}>
          <Flame style={{ width: 16, height: 16, color: "hsl(var(--primary))" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--primary))" }}>{streak}-day streak</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>

        {/* ── Goals & Associated Tasks ─────────────────────────────────────── */}
        {[...goals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((goal) => {
          const goalTasks = tasks.filter(t => t.goalId === goal.id);
          const doneTasks = goalTasks.filter(t => t.completed);
          
          const targets = goal.targets ?? [];
          const pct = targets.length > 0
            ? Math.min(100, Math.round(targets.reduce((s, t) => s + (t.targetValue > 0 ? (t.currentValue / t.targetValue) * 100 : 0), 0) / targets.length))
            : 0;

          return (
            <div key={goal.id} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", borderRadius: "1rem", background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.6)", boxShadow: "0 4px 20px -10px hsl(var(--primary) / 0.1)" }}>
              {/* Goal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Target style={{ width: 22, height: 22, color: "hsl(var(--primary))" }} />
                    {goal.title}
                  </h2>
                  {goal.description && <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>{goal.description}</p>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--primary))" }}>{pct}%</span>
                  <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{ height: 10, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden", margin: "0.5rem 0" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))", transition: "width 0.6s ease" }} />
              </div>

              {/* Tasks List */}
              <div style={{ marginTop: "0.5rem" }}>
                <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "hsl(var(--muted-foreground))", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center" }}>
                  Goal Tasks <span style={{ background: "hsl(var(--secondary))", padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", marginLeft: "0.75rem", color: "hsl(var(--foreground))" }}>{doneTasks.length}/{goalTasks.length} done</span>
                </h3>
                {goalTasks.length === 0 ? (
                  <EmptyState text="No tasks linked to this goal." />
                ) : (
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {goalTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ── General Tasks ──────────────────────────────── */}
        {(() => {
          const generalTasks = tasks.filter(t => !t.goalId || t.goalId === "none");
          const doneTasks = generalTasks.filter(t => t.completed);
          if (generalTasks.length === 0) return null;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", borderRadius: "1rem", background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.6)", boxShadow: "0 4px 20px -10px hsl(var(--foreground) / 0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckSquare style={{ width: 22, height: 22, color: "hsl(var(--muted-foreground))" }} />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>General Tasks</h2>
                <span style={{ background: "hsl(var(--secondary))", padding: "2px 8px", borderRadius: 999, fontSize: "0.75rem", marginLeft: "auto", color: "hsl(var(--foreground))", fontWeight: 600 }}>{doneTasks.length}/{generalTasks.length} done</span>
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {generalTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "2rem", borderTop: "1px solid hsl(var(--border) / 0.4)", color: "hsl(var(--muted-foreground))", fontSize: "0.8125rem" }}>
        Powered by <a href="/" style={{ color: "hsl(var(--primary))", textDecoration: "none", fontWeight: 600 }}>TimeTracker</a>
        {" · "}Shared by {meta.ownerName} · View-only
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: Task }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.875rem",
      padding: "0.75rem 1rem", borderRadius: "0.5rem",
      background: task.completed ? "hsl(var(--primary) / 0.06)" : "hsl(var(--secondary) / 0.3)",
      border: `1px solid ${task.completed ? "hsl(var(--primary) / 0.2)" : "hsl(var(--border) / 0.4)"}`,
      transition: "all 0.2s ease"
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        background: task.completed ? "hsl(var(--primary))" : "transparent",
        border: `2px solid ${task.completed ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {task.completed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span style={{ fontSize: "0.875rem", fontWeight: 600, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))", flex: 1 }}>
        {task.title}
      </span>
      <PriorityBadge priority={task.priority} />
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", padding: "0.125rem 0.5rem", background: "hsl(var(--background))", borderRadius: 999, border: "1px solid hsl(var(--border) / 0.5)" }}>
        {task.category}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "1.5rem", textAlign: "center", background: "hsl(var(--muted) / 0.3)", borderRadius: "0.625rem", border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))", fontSize: "0.875rem" }}>
      {text}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#22c55e",
  };
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
      background: colors[priority] ?? "hsl(var(--border))",
      display: "inline-block",
    }} title={priority} />
  );
}
