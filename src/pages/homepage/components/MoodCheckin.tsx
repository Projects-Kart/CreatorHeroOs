import { useState } from "react";

export function MoodCheckin({ existing, onSave }: { existing?: { mood: number; energy: number }; onSave: (m: number, e: number) => void }) {
  const [mood, setMood] = useState(existing?.mood ?? 0);
  const [energy, setEnergy] = useState(existing?.energy ?? 0);
  return (
    <div>
      <h3 className="text-[13px] font-bold text-black tracking-tight mb-5">How are you today?</h3>
      <div className="space-y-4">
        <Rating label="Mood" value={mood} onChange={(v) => { setMood(v); if (energy) onSave(v, energy); }} />
        <Rating label="Energy" value={energy} onChange={(v) => { setEnergy(v); if (mood) onSave(mood, v); }} />
      </div>
      {existing && <p className="mt-4 text-[11px] font-medium text-muted-foreground animate-in fade-in slide-in-from-top-1">Saved. Tracked for correlation with output.</p>}
    </div>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-muted-foreground font-medium">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-7 w-7 rounded-full text-[11px] font-bold transition-all duration-200 transform hover:scale-110 active:scale-95 ${value >= n ? "bg-[#E35D43] text-white shadow-sm shadow-[#E35D43]/30" : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80"}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
