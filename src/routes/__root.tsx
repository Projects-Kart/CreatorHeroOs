import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
// @ts-expect-error - no types for fontsource side-effect import
import "@fontsource-variable/inter";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/useAuth";
import { FirebaseLoader } from "@/components/FirebaseLoader";
import { LoginPage } from "@/pages/auth/LoginPage";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "CreatorHeroOs — Productivity & Pipeline Management for Content Creators" },
      { name: "description", content: "The ultimate dashboard to plan uploads, track goals, measure streaks, and manage your entire content pipeline in one beautiful, focused workspace." },
      { name: "keywords", content: "content tracker, productivity, creator tools, pomodoro timer, task management, content pipeline, youtube planner" },
      { name: "author", content: "CreatorHeroOs" },
      { name: "theme-color", content: "#E35D43" },
      { property: "og:title", content: "CreatorHeroOs — Productivity for Content Creators" },
      { property: "og:description", content: "Plan uploads, track goals, and manage your content pipeline in one focused workspace." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://creatorheroos.app" },
      { property: "og:site_name", content: "CreatorHeroOs" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CreatorHeroOs — Productivity & Pipeline Management" },
      { name: "twitter:description", content: "The ultimate dashboard to plan uploads, track goals, and manage your entire content pipeline." },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⏱️</text></svg>",
      },
      {
        rel: "apple-touch-icon",
        href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⏱️</text></svg>",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * AuthGate: decides what to render based on Firebase auth state.
 *
 * - Loading  → full-screen spinner
 * - Public share route (/share/*)  → render outlet directly (no auth needed)
 * - Not logged in → LoginPage
 * - Logged in → full app wrapped in StoreProvider
 */
function AuthGate() {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Always allow public share pages without auth
  const isShareRoute = pathname.startsWith("/share/");

  if (loading) return <FirebaseLoader />;

  // Public routes render without auth or StoreProvider
  if (isShareRoute) {
    return <Outlet />;
  }

  // Not authenticated → show login
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated → full app
  return (
    <StoreProvider firebaseUid={user.uid}>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster />
    </StoreProvider>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}
