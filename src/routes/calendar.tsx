import { createFileRoute } from "@tanstack/react-router";
import { CalendarPage } from "@/pages/calendar/calendar";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — TimeTracker" },
      { name: "description", content: "Monthly view of tasks, deadlines, and content publish dates." },
      { property: "og:title", content: "Calendar — TimeTracker" },
      { property: "og:description", content: "See your workload at a glance." },
    ],
  }),
  component: CalendarPage,
});