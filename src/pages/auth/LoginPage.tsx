import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export function LoginPage() {
  const { signInWithGoogle, error } = useAuth();
  const [signing, setSigning] = useState(false);

  const handleSignIn = async () => {
    setSigning(true);
    await signInWithGoogle();
    setSigning(false);
  };

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Left panel — branding */}
      <div className="flex-none w-[45%] bg-primary flex flex-col justify-center p-16 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-foreground/10" />
        <div className="absolute -bottom-30 -left-15 w-[400px] h-[400px] rounded-full bg-primary-foreground/5" />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 z-10">
          <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm border border-primary-foreground/20">
            <span className="text-xl font-bold text-primary-foreground">T</span>
          </div>
          <span className="text-lg font-semibold text-primary-foreground tracking-tight">
            TimeTracker
          </span>
        </div>

        <h1 className="text-4xl font-bold text-primary-foreground leading-tight tracking-tight mb-4 z-10">
          Your content
          <br />
          command center
        </h1>
        <p className="text-primary-foreground/80 text-base leading-relaxed max-w-sm z-10">
          Plan uploads, track goals, manage your pipeline — and share your progress with your audience.
        </p>

        {/* Feature pills */}
        <div className="mt-10 flex flex-col gap-3 z-10">
          {[
            "📋 Daily task management with streak tracking",
            "🎯 Goal milestones with visual progress",
            "🎬 Full content pipeline board",
            "🔗 Share progress links (view-only)",
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 px-4 py-2.5 bg-primary-foreground/10 rounded-lg border border-primary-foreground/15 text-primary-foreground text-sm shadow-sm backdrop-blur-md"
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — sign-in form */}
      <div className="flex-1 flex flex-col items-center justify-center p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Welcome back 👋
          </h2>
          <p className="text-muted-foreground text-base mb-10">
            Sign in with your Google account to access your workspace.
          </p>

          {/* Google Sign-In Button */}
          <button
            id="google-signin-btn"
            onClick={handleSignIn}
            disabled={signing}
            className="w-full flex items-center justify-center gap-3.5 px-6 py-3.5 bg-card border-[1.5px] border-border rounded-xl cursor-pointer text-base font-semibold text-foreground transition-all duration-200 shadow-sm hover:bg-accent hover:border-primary/40 hover:shadow-primary/15 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {/* Google SVG logo */}
            {signing ? (
              <div className="w-[22px] h-[22px] border-[2.5px] border-border border-t-primary rounded-full animate-spin shrink-0" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{signing ? "Signing in…" : "Continue with Google"}</span>
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error.includes("popup-closed")
                ? "Sign-in was cancelled. Please try again."
                : error.includes("network")
                ? "Network error. Check your connection."
                : "Sign-in failed. Please try again."}
            </div>
          )}

          <p className="mt-8 text-center text-[13px] text-muted-foreground leading-relaxed">
            Your data is stored securely in Firebase and
            <br />
            only accessible to you.
          </p>
        </div>
      </div>
    </div>
  );
}
