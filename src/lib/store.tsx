import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Task, Goal, Video, DailyCheckin, Settings } from "./types";
import { seedTasks, seedGoals, seedVideos, seedCheckins, seedSettings } from "./seed";

const KEY = "timetracker.v1";

type State = {
  tasks: Task[];
  goals: Goal[];
  videos: Video[];
  checkins: DailyCheckin[];
  settings: Settings;
};

type Ctx = State & {
  addTask: (t: Omit<Task, "id" | "completed" | "subtasks"> & { subtasks?: Task["subtasks"] }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subId: string) => void;

  addGoal: (g: Omit<Goal, "id" | "createdAt" | "milestones"> & { milestones?: Goal["milestones"] }) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addVideo: (v: Omit<Video, "id" | "createdAt">) => void;
  updateVideo: (id: string, patch: Partial<Video>) => void;
  moveVideo: (id: string, stage: Video["stage"]) => void;
  deleteVideo: (id: string) => void;

  addCheckin: (c: DailyCheckin) => void;
  updateSettings: (patch: Partial<Settings>) => void;

  resetAll: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

function loadInitial(): State {
  if (typeof window === "undefined") {
    return {
      tasks: seedTasks(),
      goals: seedGoals(),
      videos: seedVideos(),
      checkins: seedCheckins(),
      settings: seedSettings(),
    };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {}
  return {
    tasks: seedTasks(),
    goals: seedGoals(),
    videos: seedVideos(),
    checkins: seedCheckins(),
    settings: seedSettings(),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => loadInitial());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Re-hydrate from localStorage on client to avoid SSR mismatch
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const update = (fn: (s: State) => State) => setState((s) => fn(s));

  const ctx: Ctx = {
    ...state,
    addTask: (t) =>
      update((s) => ({
        ...s,
        tasks: [
          ...s.tasks,
          { ...t, id: uid(), completed: false, subtasks: t.subtasks ?? [] },
        ],
      })),
    updateTask: (id, patch) =>
      update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    deleteTask: (id) => update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
    toggleTask: (id) =>
      update((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : undefined,
              }
            : t,
        ),
      })),
    toggleSubtask: (taskId, subId) =>
      update((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: t.subtasks.map((x) => (x.id === subId ? { ...x, done: !x.done } : x)) }
            : t,
        ),
      })),
    addGoal: (g) =>
      update((s) => ({
        ...s,
        goals: [
          ...s.goals,
          { ...g, id: uid(), createdAt: new Date().toISOString().slice(0, 10), milestones: g.milestones ?? [] },
        ],
      })),
    updateGoal: (id, patch) =>
      update((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
    deleteGoal: (id) => update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),
    addVideo: (v) =>
      update((s) => ({
        ...s,
        videos: [...s.videos, { ...v, id: uid(), createdAt: new Date().toISOString().slice(0, 10) }],
      })),
    updateVideo: (id, patch) =>
      update((s) => ({ ...s, videos: s.videos.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
    moveVideo: (id, stage) =>
      update((s) => ({ ...s, videos: s.videos.map((v) => (v.id === id ? { ...v, stage } : v)) })),
    deleteVideo: (id) => update((s) => ({ ...s, videos: s.videos.filter((v) => v.id !== id) })),
    addCheckin: (c) =>
      update((s) => ({
        ...s,
        checkins: [...s.checkins.filter((x) => x.date !== c.date), c],
      })),
    updateSettings: (patch) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    resetAll: () =>
      setState({
        tasks: seedTasks(),
        goals: seedGoals(),
        videos: seedVideos(),
        checkins: seedCheckins(),
        settings: seedSettings(),
      }),
    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON: (json) => {
      try {
        setState(JSON.parse(json));
      } catch {}
    },
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

// Derived helpers
export function computeStreak(tasks: Task[]): number {
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
      // allow today to not count yet but break if yesterday missing
      if (streak === 0) {
        d.setDate(d.getDate() - 1);
        const key2 = d.toISOString().slice(0, 10);
        if (days.has(key2)) {
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