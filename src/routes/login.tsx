import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — TimeTracker" },
      { name: "description", content: "Sign in to your TimeTracker workspace with Google." },
    ],
  }),
  component: LoginPage,
});
