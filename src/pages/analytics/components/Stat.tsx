import { Card } from "@/components/ui/card";

export function Stat({ label, value, hint, icon: Icon, accent }: { label: string; value: string; hint?: string; icon: any; accent?: "destructive" | "success" }) {
  const color = accent === "destructive" ? "text-destructive drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" : accent === "success" ? "text-success drop-shadow-[0_0_8px_rgba(22,163,74,0.4)]" : "text-foreground";
  
  return (
    <Card className="p-5 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <Icon className={"h-4 w-4 " + (accent === "destructive" ? "text-destructive" : accent === "success" ? "text-success" : "text-primary")} /> {label}
      </div>
      <div className={"mt-3 text-3xl font-bold tracking-tight " + color}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-3 bg-secondary/50 inline-block px-2 py-1 rounded-md font-medium">{hint}</div>}
    </Card>
  );
}
