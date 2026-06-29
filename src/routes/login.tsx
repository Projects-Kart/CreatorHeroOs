import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CreatorHeroOs" },
      { name: "description", content: "Sign in to your CreatorHeroOs workspace with Google." },
    ],
  }),
  component: LoginPage,
});
