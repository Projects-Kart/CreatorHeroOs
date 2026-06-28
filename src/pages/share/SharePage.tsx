import { useEffect, useState } from "react";
import { resolveShareToken, getPublicUserData, type ShareToken } from "@/lib/firestore";
import type { Task, Goal, Video } from "@/lib/types";
import { PIPELINE_STAGES } from "@/lib/types";
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
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const doneTasks = todayTasks.filter((t) => t.completed);
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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* ── Today's Tasks ──────────────────────────────── */}
        <div style={{ gridColumn: "1 / -1" }}>
          <SectionHeader icon={<CheckSquare style={{ width: 18, height: 18 }} />} title="Today's Tasks" badge={`${doneTasks.length}/${todayTasks.length} done`} />
          {todayTasks.length === 0 ? (
            <EmptyState text="No tasks scheduled for today." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {todayTasks.map((task) => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: "0.875rem",
                  padding: "0.75rem 1rem", borderRadius: "0.625rem",
                  background: task.completed ? "hsl(var(--primary) / 0.06)" : "hsl(var(--card))",
                  border: `1px solid ${task.completed ? "hsl(var(--primary) / 0.2)" : "hsl(var(--border) / 0.6)"}`,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    background: task.completed ? "hsl(var(--primary))" : "transparent",
                    border: `2px solid ${task.completed ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {task.completed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))", flex: 1 }}>
                    {task.title}
                  </span>
                  <PriorityBadge priority={task.priority} />
                  <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", padding: "0.125rem 0.5rem", background: "hsl(var(--secondary))", borderRadius: 999 }}>
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Goals ─────────────────────────────────────── */}
        <div>
          <SectionHeader icon={<Target style={{ width: 18, height: 18 }} />} title="Goals" badge={`${goals.length} active`} />
          {goals.length === 0 ? (
            <EmptyState text="No goals set yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {goals.map((goal) => {
                const targets = goal.targets ?? [];
                const pct = targets.length > 0
                  ? Math.min(100, Math.round(targets.reduce((s, t) => s + (t.targetValue > 0 ? (t.currentValue / t.targetValue) * 100 : 0), 0) / targets.length))
                  : 0;
                return (
                  <div key={goal.id} style={{ padding: "1rem", borderRadius: "0.625rem", background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.6)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{goal.title}</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "hsl(var(--primary))" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))", transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>Overall Progress</span>
                    </div>
                    {goal.milestones.length > 0 && (
                      <div style={{ marginTop: "0.625rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                        {goal.milestones.map((m) => (
                          <span key={m.id} style={{
                            fontSize: "0.6875rem", padding: "0.125rem 0.5rem", borderRadius: 999,
                            background: m.done ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                            color: m.done ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                            textDecoration: m.done ? "line-through" : "none",
                          }}>
                            {m.done ? "✓ " : ""}{m.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Pipeline Board ────────────────────────────── */}
        <div>
          <SectionHeader icon={<Film style={{ width: 18, height: 18 }} />} title="Content Pipeline" badge={`${videos.length} videos`} />
          {videos.length === 0 ? (
            <EmptyState text="No videos in pipeline." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {PIPELINE_STAGES.map((stage) => {
                const vids = videos.filter((v) => v.stage === stage.id);
                if (vids.length === 0) return null;
                return (
                  <div key={stage.id} style={{ padding: "0.75rem 1rem", borderRadius: "0.625rem", background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.6)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stage.label}</span>
                      <span style={{ fontSize: "0.75rem", background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", padding: "0 0.5rem", borderRadius: 999, fontWeight: 600 }}>{vids.length}</span>
                    </div>
                    {vids.map((v) => (
                      <div key={v.id} style={{ fontSize: "0.8125rem", padding: "0.25rem 0", borderTop: "1px solid hsl(var(--border) / 0.4)", color: "hsl(var(--foreground) / 0.9)" }}>
                        {v.title}
                        {v.estimatedLength && <span style={{ fontSize: "0.6875rem", color: "hsl(var(--muted-foreground))", marginLeft: "0.5rem" }}>{v.estimatedLength}min</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

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

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
      <div style={{ color: "hsl(var(--primary))" }}>{icon}</div>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, flex: 1 }}>{title}</h2>
      {badge && <span style={{ fontSize: "0.75rem", padding: "0.125rem 0.625rem", background: "hsl(var(--secondary))", borderRadius: 999, color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>{badge}</span>}
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
