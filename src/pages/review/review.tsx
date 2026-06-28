import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Save, Flame, Brain, Dumbbell, Zap, Coffee } from "lucide-react";

export function ReviewPage() {
  const { checkins, addCheckin } = useStore();
  const [mood, setMood] = useState<number>(3);
  const [notes, setNotes] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const hasCheckedIn = checkins.some((c) => c.date === today);

  const submit = () => {
    addCheckin({ date: today, mood, notes: notes.trim() || undefined });
    setNotes("");
  };

  const recent = checkins.slice(-7).reverse();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Daily Review" subtitle="Reflect on your energy levels and document lessons learned." />
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {!hasCheckedIn ? (
          <Card className="p-8 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />
            <h2 className="text-xl font-bold tracking-tight mb-6">How was your day?</h2>
            <div className="space-y-8 relative z-10">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Energy & Flow</label>
                <div className="flex gap-4">
                  {[
                    { val: 1, label: "Burnout", icon: Flame, color: "text-destructive hover:bg-destructive/10" },
                    { val: 2, label: "Tired", icon: Coffee, color: "text-orange-500 hover:bg-orange-500/10" },
                    { val: 3, label: "Okay", icon: Brain, color: "text-yellow-500 hover:bg-yellow-500/10" },
                    { val: 4, label: "Good", icon: Dumbbell, color: "text-success hover:bg-success/10" },
                    { val: 5, label: "Unstoppable", icon: Zap, color: "text-primary hover:bg-primary/10" }
                  ].map((m) => (
                    <button
                      key={m.val}
                      onClick={() => setMood(m.val)}
                      className={"flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 group " + (mood === m.val ? `border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)] ${m.color}` : "border-border/50 bg-secondary/20 opacity-70 hover:opacity-100 " + m.color)}
                    >
                      <m.icon className={"h-6 w-6 mb-2 transition-transform duration-300 " + (mood === m.val ? "scale-110" : "group-hover:scale-110")} />
                      <span className="text-xs font-semibold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Notes & Learnings</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What went well? What caused friction? Any new ideas?"
                  className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary transition-colors text-sm font-medium p-4 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={submit} className="bg-primary text-primary-foreground font-bold tracking-wide px-8 shadow-md hover:shadow-lg transition-all active:scale-95">
                  <Save className="h-4 w-4 mr-2" /> Save entry
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="bg-success/10 border border-success/20 text-success rounded-xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
            <CheckCircle2 className="h-10 w-10 mb-3" />
            <p className="font-bold text-lg">You've checked in for today!</p>
            <p className="text-sm opacity-80 mt-1">Consistency is key. See you tomorrow.</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">Recent entries</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-secondary/20 p-6 rounded-xl border border-dashed border-border/50 text-center">No recent entries found.</p>
          ) : (
            <div className="space-y-4">
              {recent.map((c) => {
                const date = new Date(c.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                return (
                  <Card key={c.id} className="p-5 backdrop-blur-sm bg-card/40 border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-primary font-bold shadow-sm">{c.mood}/5</div>
                      <div className="text-sm font-bold tracking-wide">{date}</div>
                    </div>
                    {c.notes ? <p className="text-sm text-foreground/80 leading-relaxed font-medium bg-background/30 p-3 rounded-lg">{c.notes}</p> : <p className="text-sm text-muted-foreground italic">No notes written.</p>}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
