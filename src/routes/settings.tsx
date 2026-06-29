import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/settings/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CreatorHeroOs" },
      { name: "description", content: "Manage preferences and local data." },
    ],
  }),
  component: SettingsPage,
});
