import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "@/pages/tasks/tasks";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — CreatorHeroOs" },
      { name: "description", content: "Execute your daily plan." },
    ],
  }),
  component: TasksPage,
});