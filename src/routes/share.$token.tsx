import { createFileRoute } from "@tanstack/react-router";
import { SharePage } from "@/pages/share/SharePage";

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "Shared Progress — TimeTracker" },
      { name: "description", content: "View this creator's tasks, goals, and content pipeline." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: function ShareRoute() {
    const { token } = Route.useParams();
    return <SharePage token={token} />;
  },
});
