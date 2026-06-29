import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

export function FocusTimer() {
  const [mode, setMode] = useState<25 | 50>(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    setSeconds(mode * 60);
    setRunning(false);
  }, [mode]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const total = mode * 60;
  const pct = ((total - seconds) / total) * 100;

  return (
    <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col items-center text-center">
      
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Clock className="h-4 w-4" />
        <h2 className="text-sm font-semibold tracking-widest uppercase">Focus Timer</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Pomodoro. Pair with any task.</p>
      
      <div className="text-7xl font-bold tabular-nums tracking-tighter bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent mb-8 mt-2">
        {mm}:{ss}
      </div>

      <div className="flex items-center justify-center gap-4 w-full mb-2">
        <Button onClick={() => setRunning((r) => !r)} size="lg" variant={running ? "secondary" : "default"} className="rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 h-16 w-16 p-0 flex items-center justify-center">
          {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
        </Button>
        <Button onClick={() => { setSeconds(mode * 60); setRunning(false); }} size="icon" variant="ghost" className="rounded-full hover:bg-secondary/50 transition-colors h-12 w-12 shrink-0">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mt-6 mb-2 flex justify-center gap-1 rounded-full bg-secondary/40 p-1 w-full max-w-[200px] backdrop-blur-md border border-white/5 z-10">
        <button onClick={() => setMode(25)} className={"flex-1 py-1.5 text-xs font-medium rounded-full transition-all " + (mode === 25 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>25m</button>
        <button onClick={() => setMode(50)} className={"flex-1 py-1.5 text-xs font-medium rounded-full transition-all " + (mode === 50 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>50m</button>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-secondary/30">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
