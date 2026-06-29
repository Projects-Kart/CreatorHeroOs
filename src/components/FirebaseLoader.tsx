import { Loader2 } from "lucide-react";

export function FirebaseLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-[9999]">
      <div className="relative flex flex-col items-center justify-center p-10 rounded-3xl bg-surface/60 border border-border/50 shadow-2xl backdrop-blur-xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Abstract background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/15 rounded-full blur-3xl animate-pulse" />

        {/* Logo / Icon container */}
        <div className="relative w-20 h-20 mb-8 rounded-2xl bg-gradient-to-tr from-primary to-primary/70 shadow-[0_0_50px_hsl(var(--primary)/0.3)] flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse mix-blend-overlay"></div>
          <span className="text-4xl font-bold text-primary-foreground">T</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3 text-center">CreatorHeroOs</h2>
        
        {/* Status indicator */}
        <div className="flex items-center gap-3 text-muted-foreground bg-secondary/80 px-5 py-2.5 rounded-full mt-4 border border-border/50 shadow-sm">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium tracking-wide">Connecting to database...</span>
        </div>
      </div>
    </div>
  );
}
