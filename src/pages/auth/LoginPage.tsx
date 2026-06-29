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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 font-sans p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
          <span className="text-2xl font-bold text-primary">T</span>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          Welcome back
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          Sign in with your Google account to continue to TimeTracker.
        </p>

        {/* Google Sign-In Button */}
        <button
          id="google-signin-btn"
          onClick={handleSignIn}
          disabled={signing}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-card border border-border rounded-xl cursor-pointer text-sm font-medium text-foreground transition-all duration-200 shadow-sm hover:bg-accent hover:border-primary/40 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {/* Google SVG logo */}
          {signing ? (
            <div className="w-5 h-5 border-[2px] border-border border-t-primary rounded-full animate-spin shrink-0" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
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
          <div className="mt-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm w-full text-left">
            {error.includes("popup-closed")
              ? "Sign-in was cancelled. Please try again."
              : error.includes("network")
              ? "Network error. Check your connection."
              : "Sign-in failed. Please try again."}
          </div>
        )}

        <p className="mt-8 text-[12px] text-muted-foreground leading-relaxed">
          Your data is stored securely in Firebase.
        </p>
      </div>
    </div>
  );
}
