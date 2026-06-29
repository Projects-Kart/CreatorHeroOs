import { createFileRoute } from "@tanstack/react-router";
import { ReviewPage } from "@/pages/review/review";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review — CreatorHeroOs" },
      { name: "description", content: "Daily reflection and journaling." },
    ],
  }),
  component: ReviewPage,
});