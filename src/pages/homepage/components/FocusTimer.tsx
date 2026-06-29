import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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

  return (
    <Card className="p-8 bg-white shadow-sm border-0 rounded-[20px] flex flex-col items-center text-center relative">
      
      <div className="flex items-center gap-1.5 mb-1.5 text-[#E35D43]">
        <Clock className="h-3.5 w-3.5" />
        <h2 className="text-[11px] font-bold tracking-widest uppercase">Focus Timer</h2>
      </div>
      <p className="text-[12px] text-muted-foreground font-medium mb-6">Pomodoro. Pair with any task.</p>
      
      <div className="text-6xl font-black tabular-nums tracking-tight text-[#E35D43] mb-8">
        {mm}:{ss}
      </div>

      <div className="flex items-center justify-center gap-4 w-full mb-8 relative">
        <Button 
          onClick={() => setRunning((r) => !r)} 
          className="rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 h-14 w-14 p-0 flex items-center justify-center bg-[#E35D43] hover:bg-[#c94d35] text-white"
        >
          {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
        </Button>
        <Button 
          onClick={() => { setSeconds(mode * 60); setRunning(false); }} 
          size="icon" 
          variant="ghost" 
          className="rounded-full hover:bg-secondary/50 text-black transition-colors h-10 w-10 absolute right-12 sm:right-16"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex justify-center gap-1 rounded-full bg-secondary/30 p-1 w-full max-w-[180px]">
        <button 
          onClick={() => setMode(25)} 
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all ${mode === 25 ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-black"}`}
        >
          25m
        </button>
        <button 
          onClick={() => setMode(50)} 
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all ${mode === 50 ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-black"}`}
        >
          50m
        </button>
      </div>

    </Card>
  );
}
