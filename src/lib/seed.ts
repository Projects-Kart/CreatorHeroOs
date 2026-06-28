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
    priority: "required",
    type: "standard",
    estimatedMinutes: 90,
    startDate: iso(today),
    endDate: iso(today),
    time: "09:00",
    completed: false,
    subtasks: [
      { id: uid(), title: "Outline 5 key points", completed: true },
      { id: uid(), title: "Draft intro hook", completed: false },
      { id: uid(), title: "Write body", completed: false },
    ],
    recurrence: "none",
    createdAt: new Date().toISOString(),
  },
  {
    id: uid(),
    title: "Weekly sync with editor",
    category: "meeting",
    priority: "normal",
    type: "meeting",
    startDate: iso(today),
    endDate: iso(today),
    time: "14:00",
    estimatedMinutes: 30,
    meetingLink: "https://zoom.us/j/123456789",
    attendees: "John (Brand X), Sarah",
    completed: false,
    recurrence: "none",
    createdAt: new Date().toISOString(),
    subtasks: [],
  },
  {
    id: "t3",
    title: "Film B-roll",
    category: "recording",
    priority: "required",
    type: "standard",
    startDate: iso(today),
    endDate: iso(today),
    estimatedMinutes: 120,
    completed: true,
    completedAt: new Date().toISOString(),
    recurrence: "none",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    subtasks: [],
  },
  {
    id: "t4",
    title: "Edit vlog intro",
    category: "editing",
    priority: "required",
    type: "standard",
    startDate: iso(addDays(today, 1)),
    endDate: iso(addDays(today, 1)),
    estimatedMinutes: 180,
    completed: false,
    recurrence: "none",
    createdAt: new Date().toISOString(),
    subtasks: [],
  },
  {
    id: uid(),
    title: "Design thumbnail — Beginner Series #3",
    category: "thumbnail",
    priority: "required",
    type: "standard",
    estimatedMinutes: 45,
    startDate: iso(today),
    endDate: iso(today),
    completed: true,
    completedAt: new Date().toISOString(),
    actualMinutes: 50,
    recurrence: "none",
    createdAt: new Date().toISOString(),
    subtasks: [],
  },
  {
    id: uid(),
    title: "Reply to comments — last 3 videos",
    category: "engagement",
    priority: "normal",
    type: "other",
    estimatedMinutes: 30,
    startDate: iso(today),
    endDate: iso(addDays(today, 30)),
    completed: true,
    completedAt: new Date().toISOString(),
    actualMinutes: 25,
    subtasks: [],
    recurrence: "daily",
    createdAt: new Date().toISOString(),
  },
  {
    id: uid(),
    title: "Upload + schedule Episode 11",
    category: "upload",
    priority: "required",
    type: "standard",
    estimatedMinutes: 30,
    startDate: iso(addDays(today, 1)),
    endDate: iso(addDays(today, 1)),
    completed: false,
    recurrence: "none",
    createdAt: new Date().toISOString(),
    subtasks: [],
  },
  {
    id: uid(),
    title: "Monthly review + plan",
    category: "admin",
    priority: "normal",
    type: "standard",
    estimatedMinutes: 45,
    startDate: iso(addDays(today, 5)),
    endDate: iso(addDays(today, 5)),
    completed: false,
    subtasks: [],
    recurrence: "monthly",
    createdAt: new Date().toISOString(),
  },
];

export const seedGoals = (): Goal[] => [
  {
    id: uid(),
    title: "Grow My Creator Presence — 2025",
    description: "Multi-platform growth goal. Hit monetization and build an audience across YouTube and Instagram.",
    targets: [
      { id: uid(), label: "YouTube Subscribers", platform: "YouTube", unit: "subs", currentValue: 6420, targetValue: 10000 },
      { id: uid(), label: "Daily Views", platform: "YouTube", unit: "views/day", currentValue: 850, targetValue: 3000 },
      { id: uid(), label: "Instagram Followers", platform: "Instagram", unit: "followers", currentValue: 1200, targetValue: 5000 },
    ],
    deadline: iso(addDays(today, 120)),
    createdAt: iso(addDays(today, -45)),
    reward: "Buy the new Shure SM7dB mic",
    milestones: [
      { id: uid(), title: "Hit 7K YouTube subs", done: false },
      { id: uid(), title: "Pass 2K daily views", done: false },
      { id: uid(), title: "First brand deal inquiry", done: false },
    ],
  },
  {
    id: uid(),
    title: "Publish 24 Videos This Quarter",
    description: "Consistent output is the real algorithm.",
    targets: [
      { id: uid(), label: "Videos Published", platform: "YouTube", unit: "videos", currentValue: 11, targetValue: 24 },
    ],
    deadline: iso(addDays(today, 75)),
    createdAt: iso(addDays(today, -30)),
    milestones: [
      { id: uid(), title: "8 videos done", done: true },
      { id: uid(), title: "16 videos done", done: false },
      { id: uid(), title: "24 videos done", done: false },
    ],
  },
  {
    id: uid(),
    title: "Revenue & Monetization Targets",
    description: "Build multiple income streams from content.",
    targets: [
      { id: uid(), label: "AdSense Monthly", platform: "YouTube", unit: "USD/mo", currentValue: 640, targetValue: 1500 },
      { id: uid(), label: "Sponsorship Revenue", platform: "Brand deals", unit: "USD/mo", currentValue: 0, targetValue: 500 },
    ],
    deadline: iso(addDays(today, 180)),
    createdAt: iso(addDays(today, -10)),
    reward: "Upgrade editing rig",
    milestones: [
      { id: uid(), title: "First $500 AdSense month", done: false },
      { id: uid(), title: "First paid sponsorship", done: false },
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