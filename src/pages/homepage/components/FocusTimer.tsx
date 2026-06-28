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
    <Card className="p-5 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-primary">
            <Clock className="h-4 w-4" /> Focus timer
          </h2>
          <p className="text-sm text-muted-foreground">Pomodoro. Pair with any task above.</p>
        </div>
        <div className="flex gap-1 rounded-md bg-secondary/50 p-1 backdrop-blur-md">
          <button onClick={() => setMode(25)} className={"px-3 py-1 text-xs rounded transition-all " + (mode === 25 ? "bg-background shadow-sm font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}>25/5</button>
          <button onClick={() => setMode(50)} className={"px-3 py-1 text-xs rounded transition-all " + (mode === 50 ? "bg-background shadow-sm font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}>50/10</button>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-5xl font-semibold tracking-tight tabular-nums bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {mm}:{ss}
        </div>
        <div className="flex-1">
          <Progress value={pct} className="h-2 rounded-full overflow-hidden" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setRunning((r) => !r)} size="sm" variant={running ? "secondary" : "default"} className="rounded-full shadow-md hover:shadow-lg transition-all active:scale-95">
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={() => { setSeconds(mode * 60); setRunning(false); }} size="sm" variant="ghost" className="rounded-full hover:bg-secondary/50 transition-colors">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
