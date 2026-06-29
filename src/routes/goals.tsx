import { createFileRoute } from "@tanstack/react-router";
import { GoalsPage } from "@/pages/goals/goals";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — CreatorHeroOs" },
      { name: "description", content: "Set SMART goals, decompose into milestones, and track velocity to deadline." },
      { property: "og:title", content: "Goals — CreatorHeroOs" },
      { property: "og:description", content: "Long-term goals broken down into weekly action." },
    ],
  }),
  component: GoalsPage,
});