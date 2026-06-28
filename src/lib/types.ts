export type Category =
  | "scripting"
  | "recording"
  | "editing"
  | "thumbnail"
  | "upload"
  | "research"
  | "engagement"
  | "admin"
  | "rest";

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
];

export type Priority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  estimatedMinutes?: number;
  actualMinutes?: number;
  dueDate: string; // ISO date (yyyy-mm-dd)
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  subtasks: { id: string; title: string; done: boolean }[];
  videoId?: string;
  goalId?: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  category: "subscribers" | "views" | "revenue" | "skill" | "output";
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string; // ISO date
  createdAt: string;
  reward?: string;
  archived?: boolean;
  milestones: { id: string; title: string; targetValue: number; done: boolean }[];
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
  hook?: string;
  stage: PipelineStage;
  series?: string;
  publishDate?: string;
  estimatedLength?: number; // minutes
  priority: Priority;
  metrics?: { views?: number; likes?: number; comments?: number; ctr?: number; avd?: number };
  createdAt: string;
};

export type DailyCheckin = {
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  note?: string;
};

export type Settings = {
  workingHoursStart: string;
  workingHoursEnd: string;
  maxDailyTasks: number;
  notifications: { email: boolean; push: boolean; streakWarnings: boolean };
  channelName: string;
};