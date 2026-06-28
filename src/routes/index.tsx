import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/pages/homepage/homepage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TimeTracker" },
      { name: "description", content: "Your daily command center: today's tasks, streak, focus timer, and upcoming deadlines." },
      { property: "og:title", content: "Dashboard — TimeTracker" },
      { property: "og:description", content: "Daily command center for content creators." },
    ],
  }),
  component: Dashboard,
});

