import { createFileRoute } from "@tanstack/react-router";
import { PipelinePage } from "@/pages/pipeline/pipeline";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — CreatorHeroOs" },
      { name: "description", content: "Kanban board for content production." },
      { property: "og:title", content: "Pipeline — CreatorHeroOs" },
    ],
  }),
  component: PipelinePage,
});