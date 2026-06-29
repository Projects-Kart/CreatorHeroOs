export type Category =
  | "scripting"
  | "recording"
  | "editing"
  | "thumbnail"
  | "upload"
  | "research"
  | "engagement"
  | "admin"
  | "rest"
  | "meeting"
  | "long-video"
  | "short-video"
  | "linkedin-post"
  | "youtube-post"
  | "live-video"
  | "twitter-post"
  | "newsletter"
  | "podcast";

export const CATEGORIES: { id: Category; label: string; token: string }[] = [
  { id: "scripting", label: "Scripting", token: "cat-scripting" },
  { id: "recording", label: "Recording", token: "cat-recording" },
  { id: "editing", label: "Editing", token: "cat-editing" },
  { id: "thumbnail", label: "Thumbnail", token: "cat-thumbnail" },
  { id: "upload", label: "Upload", token: "cat-upload" },
  { id: "research", label: "Research", token: "cat-research" },
  { id: "engagement", label: "Engagement", token: "cat-engagement" },
  { id: "admin", label: "Admin", token: "cat-admin" },
  { id: "rest", label: "Rest", token: "cat-rest" },
  { id: "meeting", label: "Meeting", token: "cat-meeting" },
  { id: "long-video", label: "Long Video", token: "cat-long-video" },
  { id: "short-video", label: "Short Video", token: "cat-short-video" },
  { id: "linkedin-post", label: "LinkedIn Post", token: "cat-linkedin-post" },
  { id: "youtube-post", label: "YouTube Post", token: "cat-youtube-post" },
  { id: "live-video", label: "Live Video", token: "cat-live-video" },
  { id: "twitter-post", label: "Twitter/X Post", token: "cat-twitter-post" },
  { id: "newsletter", label: "Newsletter", token: "cat-newsletter" },
  { id: "podcast", label: "Podcast", token: "cat-podcast" },
];

export type VideoPriority = "low" | "medium" | "high" | "urgent";
export type TaskPriority = "optional" | "normal" | "required";
export type TaskType = "standard" | "meeting" | "other";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string; // References a category ID
  priority: TaskPriority;
  type: TaskType;
  
  // Date and Time
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  time?: string; // e.g. "10:30 AM"

  estimatedMinutes?: number;
  actualMinutes?: number;
  
  // Meeting specific fields
  meetingLink?: string;
  meetingLocation?: string;
  attendees?: string;

  // Status & Recurrence
  completed: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  recurrenceDays?: string[]; // e.g. ["Mon", "Wed", "Fri"]
  
  createdAt: string;
  completedAt?: string;
  completedDates?: string[]; // Array of YYYY-MM-DD dates where the task is checked off
  
  subtasks: Subtask[];
  videoId?: string;
  goalId?: string;
};

export function isTaskActiveOnDate(task: Task, dateStr: string): boolean {
  // Parse dates safely as local time to avoid timezone shifts
  const parseLocal = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  };

  const targetDate = parseLocal(dateStr);
  const start = parseLocal(task.startDate);
  
  targetDate.setHours(0,0,0,0);
  start.setHours(0,0,0,0);
  
  // Tasks never appear before their start date
  if (targetDate.getTime() < start.getTime()) return false;
  
  // Determine if we should enforce the end date
  const hasExplicitEndDate = task.endDate && task.endDate !== task.startDate;
  
  if (hasExplicitEndDate) {
    const end = parseLocal(task.endDate);
    end.setHours(0,0,0,0);
    if (targetDate.getTime() > end.getTime()) return false;
  } else if (task.recurrence === "none" && task.endDate) {
    // If it's a one-time task and has an end date, enforce it
    const end = parseLocal(task.endDate);
    end.setHours(0,0,0,0);
    if (targetDate.getTime() > end.getTime()) return false;
  }
  
  if (task.recurrence === "daily") return true;
  if (task.recurrence === "weekly" && task.recurrenceDays && task.recurrenceDays.length > 0) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = days[targetDate.getDay()];
    return task.recurrenceDays.includes(currentDay);
  }
  
  // If it's a non-recurring task, it's active on any day between its start and end date (inclusive)
  if (task.recurrence === "none") {
    return true; 
  }
  
  return false;
}

export function isTaskCompletedOnDate(task: Task, dateStr: string): boolean {
  if (task.completedDates && task.completedDates.includes(dateStr)) {
    return true;
  }
  if (task.recurrence === "none" || !task.recurrence) {
    return task.completed;
  }
  return false;
}

// ── Goal types ────────────────────────────────────────────────────────────────

export type GoalTarget = {
  id: string;
  label: string;       // e.g. "YouTube Subscribers"
  platform?: string;   // e.g. "YouTube", "Instagram"
  unit: string;        // e.g. "subs", "followers", "views/day"
  currentValue: number;
  targetValue: number;
  history?: { date: string; value: number; diff: number }[]; // Track progress history
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  targets: GoalTarget[];  // Multiple targets per goal
  deadline: string; // ISO date
  createdAt: string;
  reward?: string;
  archived?: boolean;
  achievedAt?: string | null;
  milestones: { id: string; title: string; done: boolean }[];
};

export type PipelineStage =
  | "idea"
  | "research"
  | "scripting"
  | "recording"
  | "editing"
  | "thumbnail"
  | "seo"
  | "scheduled"
  | "published";

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "idea", label: "Idea" },
  { id: "research", label: "Research" },
  { id: "scripting", label: "Scripting" },
  { id: "recording", label: "Recording" },
  { id: "editing", label: "Editing" },
  { id: "thumbnail", label: "Thumbnail" },
  { id: "seo", label: "SEO" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
];

export type Video = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  script?: string;
  notes?: string;
  linkedGoalId?: string;
  linkedTaskId?: string;
  stage: PipelineStage;
  stageDates?: Partial<Record<PipelineStage, string>>;
  stageHistory?: { stageId: PipelineStage; date: string }[];
  series?: string;
  publishDate?: string;
  estimatedLength?: number; // minutes
  priority: VideoPriority;
  metrics?: { views?: number; likes?: number; comments?: number; ctr?: number; avd?: number };
  createdAt: string;
};

export type DailyCheckin = {
  id?: string;
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  note?: string;
  notes?: string;
};

export type Settings = {
  workingHoursStart: string;
  workingHoursEnd: string;
  maxDailyTasks: number;
  notifications: { email: boolean; push: boolean; streakWarnings: boolean };
  channelName: string;
};