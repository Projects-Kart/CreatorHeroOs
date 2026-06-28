import { useState } from "react";
import { Card } from "@/components/ui/card";

export function MoodCheckin({ existing, onSave }: { existing?: { mood: number; energy: number }; onSave: (m: number, e: number) => void }) {
  const [mood, setMood] = useState(existing?.mood ?? 0);
  const [energy, setEnergy] = useState(existing?.energy ?? 0);
  return (
    <Card className="p-5 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
      <h3 className="text-sm font-semibold tracking-tight">How are you today?</h3>
      <div className="mt-3 space-y-3">
        <Rating label="Mood" value={mood} onChange={(v) => { setMood(v); if (energy) onSave(v, energy); }} />
        <Rating label="Energy" value={energy} onChange={(v) => { setEnergy(v); if (mood) onSave(mood, v); }} />
      </div>
      {existing && <p className="mt-3 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1">Saved. Tracked for correlation with output.</p>}
    </Card>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={"h-7 w-7 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-110 active:scale-95 " + (value >= n ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80")}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
