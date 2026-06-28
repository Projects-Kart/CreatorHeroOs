import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/pages/analytics/analytics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TimeTracker" },
      { name: "description", content: "See where time goes, when you're most productive, and how effort maps to growth." },
      { property: "og:title", content: "Analytics — TimeTracker" },
      { property: "og:description", content: "Connect tasks completed to channel growth." },
    ],
  }),
  component: AnalyticsPage,
});