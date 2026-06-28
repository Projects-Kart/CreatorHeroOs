import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  type Unsubscribe,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Task, Goal, Video, DailyCheckin, Settings } from "./types";
import { seedTasks, seedGoals, seedVideos, seedCheckins, seedSettings } from "./seed";

// ─── Collection refs ──────────────────────────────────────────────────────────

const userRef = (uid: string) => doc(db, "users", uid);
const col = (uid: string, name: string) => collection(userRef(uid), name);

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function subscribeTasks(uid: string, cb: (tasks: Task[]) => void): Unsubscribe {
  return onSnapshot(col(uid, "tasks"), (snap) => {
    const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task);
    cb(tasks);
  });
}

export async function addTaskFS(uid: string, task: Task): Promise<void> {
  await setDoc(doc(col(uid, "tasks"), task.id), task);
}

export async function updateTaskFS(uid: string, id: string, patch: Partial<Task>): Promise<void> {
  await updateDoc(doc(col(uid, "tasks"), id), patch as DocumentData);
}

export async function deleteTaskFS(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid, "tasks"), id));
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export function subscribeGoals(uid: string, cb: (goals: Goal[]) => void): Unsubscribe {
  return onSnapshot(col(uid, "goals"), (snap) => {
    const goals = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Goal);
    cb(goals);
  });
}

export async function addGoalFS(uid: string, goal: Goal): Promise<void> {
  await setDoc(doc(col(uid, "goals"), goal.id), goal);
}

export async function updateGoalFS(uid: string, id: string, patch: Partial<Goal>): Promise<void> {
  await updateDoc(doc(col(uid, "goals"), id), patch as DocumentData);
}

export async function deleteGoalFS(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid, "goals"), id));
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export function subscribeVideos(uid: string, cb: (videos: Video[]) => void): Unsubscribe {
  return onSnapshot(col(uid, "videos"), (snap) => {
    const videos = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Video);
    cb(videos);
  });
}

export async function addVideoFS(uid: string, video: Video): Promise<void> {
  await setDoc(doc(col(uid, "videos"), video.id), video);
}

export async function updateVideoFS(uid: string, id: string, patch: Partial<Video>): Promise<void> {
  await updateDoc(doc(col(uid, "videos"), id), patch as DocumentData);
}

export async function deleteVideoFS(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid, "videos"), id));
}

// ─── Check-ins ────────────────────────────────────────────────────────────────

export function subscribeCheckins(
  uid: string,
  cb: (checkins: DailyCheckin[]) => void,
): Unsubscribe {
  return onSnapshot(col(uid, "checkins"), (snap) => {
    const checkins = snap.docs.map((d) => d.data() as DailyCheckin);
    cb(checkins);
  });
}

export async function setCheckinFS(uid: string, checkin: DailyCheckin): Promise<void> {
  await setDoc(doc(col(uid, "checkins"), checkin.date), checkin);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function subscribeSettings(
  uid: string,
  cb: (settings: Settings) => void,
): Unsubscribe {
  return onSnapshot(doc(col(uid, "settings"), "default"), (snap) => {
    if (snap.exists()) {
      cb(snap.data() as Settings);
    }
  });
}

export async function updateSettingsFS(uid: string, patch: Partial<Settings>): Promise<void> {
  await setDoc(doc(col(uid, "settings"), "default"), patch, { merge: true });
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

/**
 * Seeds the database with dummy data if it's empty (first-time user).
 */
export async function seedDatabaseIfEmpty(uid: string): Promise<void> {
  const tasksSnap = await getDocs(col(uid, "tasks"));
  if (!tasksSnap.empty) return; // Already seeded — bail out

  console.log("[Firebase] Seeding database with dummy data for uid:", uid);
  const batch = writeBatch(db);

  // Tasks
  for (const task of seedTasks()) {
    batch.set(doc(col(uid, "tasks"), task.id), task);
  }

  // Goals
  for (const goal of seedGoals()) {
    batch.set(doc(col(uid, "goals"), goal.id), goal);
  }

  // Videos
  for (const video of seedVideos()) {
    batch.set(doc(col(uid, "videos"), video.id), video);
  }

  // Check-ins
  for (const checkin of seedCheckins()) {
    batch.set(doc(col(uid, "checkins"), checkin.date), checkin);
  }

  // Settings
  batch.set(doc(col(uid, "settings"), "default"), seedSettings());

  await batch.commit();
  console.log("[Firebase] Seed complete!");
}

// ─── Share Tokens ─────────────────────────────────────────────────────────────

export type ShareToken = {
  token: string;
  uid: string;
  ownerName: string;
  ownerPhoto?: string;
  createdAt: string;
};

/** Generates a random 8-char alphanumeric token */
function genToken(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

/**
 * Creates (or re-creates) a share token for the given user.
 * Stores it both in /shares/{token} (public) and /users/{uid}/settings/default.
 */
export async function createShareToken(
  uid: string,
  ownerName: string,
  ownerPhoto?: string,
): Promise<string> {
  const token = genToken();
  const data: ShareToken = {
    token,
    uid,
    ownerName,
    ownerPhoto,
    createdAt: new Date().toISOString(),
  };
  // Public lookup doc
  await setDoc(doc(db, "shares", token), data);
  // Store token on user settings for easy retrieval
  await setDoc(doc(col(uid, "settings"), "default"), { shareToken: token, shareEnabled: true }, { merge: true });
  return token;
}

/** Revokes the share token — deletes the public doc and clears user settings. */
export async function revokeShareToken(uid: string, token: string): Promise<void> {
  await deleteDoc(doc(db, "shares", token));
  await setDoc(
    doc(col(uid, "settings"), "default"),
    { shareToken: null, shareEnabled: false },
    { merge: true },
  );
}

/**
 * Resolves a share token → ShareToken metadata (includes uid).
 * Returns null if token doesn't exist.
 */
export async function resolveShareToken(token: string): Promise<ShareToken | null> {
  const snap = await getDoc(doc(db, "shares", token));
  if (!snap.exists()) return null;
  return snap.data() as ShareToken;
}

/** Fetches the public (shared) data for a user — tasks, goals, videos. */
export async function getPublicUserData(uid: string) {
  const [tasksSnap, goalsSnap, videosSnap, settingsSnap] = await Promise.all([
    getDocs(col(uid, "tasks")),
    getDocs(col(uid, "goals")),
    getDocs(col(uid, "videos")),
    getDoc(doc(col(uid, "settings"), "default")),
  ]);

  return {
    tasks: tasksSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as import("./types").Task[],
    goals: goalsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as import("./types").Goal[],
    videos: videosSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as import("./types").Video[],
    settings: settingsSnap.exists() ? (settingsSnap.data() as import("./types").Settings) : null,
  };
}
