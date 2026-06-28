import type { Task, Goal, Video, DailyCheckin, Settings } from "./types";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const seedTasks = (): Task[] => [
  {
    id: uid(),
    title: "Write script — Flutter Animations Deep Dive",
    category: "scripting",
    priority: "high",
    estimatedMinutes: 90,
    dueDate: iso(today),
    dueTime: "09:00",
    completed: false,
    subtasks: [
      { id: uid(), title: "Outline 5 key points", done: true },
      { id: uid(), title: "Draft intro hook", done: false },
      { id: uid(), title: "Write body", done: false },
    ],
    recurrence: "none",
  },
  {
    id: uid(),
    title: "Record B-roll for editing setup video",
    category: "recording",
    priority: "medium",
    estimatedMinutes: 60,
    dueDate: iso(today),
    dueTime: "11:00",
    completed: false,
    subtasks: [],
  },
  {
    id: uid(),
    title: "Edit Episode 12 — first pass",
    category: "editing",
    priority: "urgent",
    estimatedMinutes: 180,
    dueDate: iso(today),
    completed: false,
    subtasks: [],
  },
  {
    id: uid(),
    title: "Design thumbnail — Beginner Series #3",
    category: "thumbnail",
    priority: "high",
    estimatedMinutes: 45,
    dueDate: iso(today),
    completed: true,
    completedAt: new Date().toISOString(),
    actualMinutes: 50,
    subtasks: [],
  },
  {
    id: uid(),
    title: "Reply to comments — last 3 videos",
    category: "engagement",
    priority: "medium",
    estimatedMinutes: 30,
    dueDate: iso(today),
    completed: true,
    completedAt: new Date().toISOString(),
    actualMinutes: 25,
    subtasks: [],
    recurrence: "daily",
  },
  {
    id: uid(),
    title: "Upload + schedule Episode 11",
    category: "upload",
    priority: "urgent",
    estimatedMinutes: 30,
    dueDate: iso(addDays(today, 1)),
    completed: false,
    subtasks: [],
  },
  {
    id: uid(),
    title: "Research trending topics for Q3",
    category: "research",
    priority: "low",
    estimatedMinutes: 60,
    dueDate: iso(addDays(today, 2)),
    completed: false,
    subtasks: [],
  },
  {
    id: uid(),
    title: "Rest day — no recording",
    category: "rest",
    priority: "low",
    dueDate: iso(addDays(today, 3)),
    completed: false,
    subtasks: [],
  },
  {
    id: uid(),
    title: "Monthly review + plan",
    category: "admin",
    priority: "medium",
    estimatedMinutes: 45,
    dueDate: iso(addDays(today, 5)),
    completed: false,
    subtasks: [],
    recurrence: "monthly",
  },
];

export const seedGoals = (): Goal[] => [
  {
    id: uid(),
    title: "Reach 10K subscribers",
    description: "Hit YouTube monetization milestone and unlock custom thumbnails-level audience.",
    category: "subscribers",
    targetValue: 10000,
    currentValue: 6420,
    unit: "subs",
    deadline: iso(addDays(today, 120)),
    createdAt: iso(addDays(today, -45)),
    reward: "Buy the new Shure SM7dB mic",
    milestones: [
      { id: uid(), title: "7K subs", targetValue: 7000, done: false },
      { id: uid(), title: "8.5K subs", targetValue: 8500, done: false },
      { id: uid(), title: "10K subs", targetValue: 10000, done: false },
    ],
  },
  {
    id: uid(),
    title: "Publish 24 videos this quarter",
    category: "output",
    targetValue: 24,
    currentValue: 11,
    unit: "videos",
    deadline: iso(addDays(today, 75)),
    createdAt: iso(addDays(today, -30)),
    milestones: [
      { id: uid(), title: "8 videos", targetValue: 8, done: true },
      { id: uid(), title: "16 videos", targetValue: 16, done: false },
      { id: uid(), title: "24 videos", targetValue: 24, done: false },
    ],
  },
  {
    id: uid(),
    title: "$1,500 / mo from AdSense",
    category: "revenue",
    targetValue: 1500,
    currentValue: 640,
    unit: "USD/mo",
    deadline: iso(addDays(today, 180)),
    createdAt: iso(addDays(today, -10)),
    reward: "Upgrade editing rig",
    milestones: [
      { id: uid(), title: "$750", targetValue: 750, done: false },
      { id: uid(), title: "$1,500", targetValue: 1500, done: false },
    ],
  },
];

export const seedVideos = (): Video[] => [
  { id: uid(), title: "Flutter Animations Deep Dive", hook: "Why your animations feel janky", stage: "scripting", series: "Flutter Pro", priority: "high", estimatedLength: 14, createdAt: iso(today) },
  { id: uid(), title: "My Editing Setup 2026", hook: "The $3K setup that pays for itself", stage: "recording", priority: "medium", estimatedLength: 10, createdAt: iso(today) },
  { id: uid(), title: "Beginner Series #3 — State Management", stage: "editing", series: "Flutter Beginner", priority: "urgent", estimatedLength: 18, createdAt: iso(today) },
  { id: uid(), title: "10 Productivity Tips for Creators", stage: "thumbnail", priority: "medium", estimatedLength: 8, createdAt: iso(today) },
  { id: uid(), title: "Why I Quit My Day Job", stage: "seo", priority: "high", estimatedLength: 12, createdAt: iso(today) },
  { id: uid(), title: "Episode 11 — Q&A", stage: "scheduled", publishDate: iso(addDays(today, 1)), priority: "high", estimatedLength: 22, createdAt: iso(today) },
  { id: uid(), title: "Episode 10 — Year in Review", stage: "published", publishDate: iso(addDays(today, -4)), priority: "high", estimatedLength: 20, createdAt: iso(addDays(today, -10)), metrics: { views: 12400, likes: 890, comments: 132, ctr: 7.2, avd: 6.4 } },
  { id: uid(), title: "Idea: Dart 4 first impressions", stage: "idea", priority: "low", createdAt: iso(today) },
  { id: uid(), title: "Idea: Building a SaaS in 30 days", stage: "idea", priority: "medium", createdAt: iso(today) },
];

export const seedCheckins = (): DailyCheckin[] => {
  const out: DailyCheckin[] = [];
  for (let i = 14; i >= 1; i--) {
    out.push({
      date: iso(addDays(today, -i)),
      mood: 3 + Math.floor(Math.random() * 3),
      energy: 2 + Math.floor(Math.random() * 4),
    });
  }
  return out;
};

export const seedSettings = (): Settings => ({
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  maxDailyTasks: 6,
  notifications: { email: true, push: false, streakWarnings: true },
  channelName: "Your Channel",
});