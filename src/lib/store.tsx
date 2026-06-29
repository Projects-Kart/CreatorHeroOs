import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Task, Goal, Video, DailyCheckin, Settings } from "./types";
import { seedSettings } from "./seed";
import {
  subscribeTasks,
  subscribeGoals,
  subscribeVideos,
  subscribeCheckins,
  subscribeSettings,
  addTaskFS,
  updateTaskFS,
  deleteTaskFS,
  addGoalFS,
  updateGoalFS,
  deleteGoalFS,
  addVideoFS,
  updateVideoFS,
  deleteVideoFS,
  setCheckinFS,
  updateSettingsFS,
  seedDatabaseIfEmpty,
} from "./firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type State = {
  tasks: Task[];
  goals: Goal[];
  videos: Video[];
  checkins: DailyCheckin[];
  settings: Settings;
  loading: boolean; // true while Firestore data is loading
};

type Ctx = State & {
  addTask: (t: Omit<Task, "id" | "completed" | "subtasks"> & { subtasks?: Task["subtasks"] }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string, date?: string) => void;
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

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Provider ────────────────────────────────────────────────────────────────

interface StoreProviderProps {
  children: ReactNode;
  firebaseUid: string; // anonymous UID from useAuth
}

export function StoreProvider({ children, firebaseUid }: StoreProviderProps) {
  const [state, setState] = useState<State>({
    tasks: [],
    goals: [],
    videos: [],
    checkins: [],
    settings: seedSettings(),
    loading: true,
  });

  // Track which collections have received their first snapshot (idempotent)
  const loadedCollections = useRef(new Set<string>());
  const TOTAL_COLLECTIONS = 5;

  const markLoaded = (name: string) => {
    loadedCollections.current.add(name);
    if (loadedCollections.current.size >= TOTAL_COLLECTIONS) {
      setState((s) => (s.loading ? { ...s, loading: false } : s));
    }
  };

  useEffect(() => {
    if (!firebaseUid) return;

    // We no longer automatically seed the database on first visit.
    // seedDatabaseIfEmpty(firebaseUid).catch(console.error);

    // Subscribe to all collections in real-time
    const unsubTasks = subscribeTasks(firebaseUid, (tasks) => {
      setState((s) => ({ ...s, tasks }));
      markLoaded("tasks");
    });

    const unsubGoals = subscribeGoals(firebaseUid, (goals) => {
      setState((s) => ({ ...s, goals }));
      markLoaded("goals");
    });

    const unsubVideos = subscribeVideos(firebaseUid, (videos) => {
      setState((s) => ({ ...s, videos }));
      markLoaded("videos");
    });

    const unsubCheckins = subscribeCheckins(firebaseUid, (checkins) => {
      setState((s) => ({ ...s, checkins }));
      markLoaded("checkins");
    });

    const unsubSettings = subscribeSettings(firebaseUid, (settings) => {
      setState((s) => ({ ...s, settings }));
      markLoaded("settings");
    });

    return () => {
      unsubTasks();
      unsubGoals();
      unsubVideos();
      unsubCheckins();
      unsubSettings();
      // Reset loaded set on uid change
      loadedCollections.current.clear();
    };
  }, [firebaseUid]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const ctx: Ctx = {
    ...state,

    // Tasks
    addTask: (t) => {
      const task: Task = { ...t, id: uid(), completed: false, subtasks: t.subtasks ?? [] };
      addTaskFS(firebaseUid, task).catch(console.error);
    },
    updateTask: (id, patch) => {
      updateTaskFS(firebaseUid, id, patch).catch(console.error);
    },
    deleteTask: (id) => {
      deleteTaskFS(firebaseUid, id).catch(console.error);
    },
    toggleTask: (id, date) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      if (date && task.recurrence !== "none" && task.recurrence) {
        const completedDates = task.completedDates || [];
        const isCompletedOnDate = completedDates.includes(date);
        const patch: Partial<Task> = {
          completedDates: isCompletedOnDate 
            ? completedDates.filter(d => d !== date) 
            : [...completedDates, date],
        };
        updateTaskFS(firebaseUid, id, patch).catch(console.error);
      } else {
        const patch: Partial<Task> = {
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined,
        };
        updateTaskFS(firebaseUid, id, patch).catch(console.error);
      }
    },
    toggleSubtask: (taskId, subId) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const subtasks = task.subtasks.map((x) => (x.id === subId ? { ...x, completed: !x.completed } : x));
      updateTaskFS(firebaseUid, taskId, { subtasks }).catch(console.error);
    },

    // Goals
    addGoal: (g) => {
      const goal: Goal = {
        ...g,
        id: uid(),
        createdAt: new Date().toISOString().slice(0, 10),
        milestones: g.milestones ?? [],
      };
      addGoalFS(firebaseUid, goal).catch(console.error);
    },
    updateGoal: (id, patch) => {
      updateGoalFS(firebaseUid, id, patch).catch(console.error);
    },
    deleteGoal: (id) => {
      deleteGoalFS(firebaseUid, id).catch(console.error);
    },

    // Videos
    addVideo: (v) => {
      const video: Video = { ...v, id: uid(), createdAt: new Date().toISOString().slice(0, 10) };
      addVideoFS(firebaseUid, video).catch(console.error);
    },
    updateVideo: (id, patch) => {
      updateVideoFS(firebaseUid, id, patch).catch(console.error);
    },
    moveVideo: (id, stage) => {
      updateVideoFS(firebaseUid, id, { stage }).catch(console.error);
    },
    deleteVideo: (id) => {
      deleteVideoFS(firebaseUid, id).catch(console.error);
    },

    // Check-ins
    addCheckin: (c) => {
      setCheckinFS(firebaseUid, c).catch(console.error);
    },

    // Settings
    updateSettings: (patch) => {
      updateSettingsFS(firebaseUid, patch).catch(console.error);
    },

    // Utilities
    resetAll: () => {
      // Clear & re-seed — handled by deleting all docs then re-seeding
      // For simplicity we just re-seed on top (setDoc merges)
      import("./seed").then(({ seedTasks, seedGoals, seedVideos, seedCheckins, seedSettings }) => {
        const tasks = seedTasks();
        const goals = seedGoals();
        const videos = seedVideos();
        const checkins = seedCheckins();
        const settings = seedSettings();
        for (const t of tasks) addTaskFS(firebaseUid, t).catch(console.error);
        for (const g of goals) addGoalFS(firebaseUid, g).catch(console.error);
        for (const v of videos) addVideoFS(firebaseUid, v).catch(console.error);
        for (const c of checkins) setCheckinFS(firebaseUid, c).catch(console.error);
        updateSettingsFS(firebaseUid, settings).catch(console.error);
      });
    },
    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON: (json) => {
      try {
        const parsed = JSON.parse(json) as State;
        for (const t of parsed.tasks ?? []) addTaskFS(firebaseUid, t).catch(console.error);
        for (const g of parsed.goals ?? []) addGoalFS(firebaseUid, g).catch(console.error);
        for (const v of parsed.videos ?? []) addVideoFS(firebaseUid, v).catch(console.error);
        for (const c of parsed.checkins ?? []) setCheckinFS(firebaseUid, c).catch(console.error);
        if (parsed.settings) updateSettingsFS(firebaseUid, parsed.settings).catch(console.error);
      } catch {
        console.error("importJSON: invalid JSON");
      }
    },
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function computeStreak(tasks: Task[]): number {
  const days = new Set<string>();
  tasks.forEach((t) => {
    if (t.completed && t.completedAt) {
      days.add(t.completedAt.slice(0, 10));
    }
    if (t.completedDates) {
      t.completedDates.forEach((d) => days.add(d));
    }
  });
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