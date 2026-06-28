import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { type Video as VideoType } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, CheckCircle2, Video, Clapperboard, PenTool, Lightbulb, Search, Image as ImageIcon, LineChart, CalendarClock } from "lucide-react";
import { NewVideoDialog } from "./components/NewVideoDialog";

const STAGES: { id: VideoType["stage"]; label: string; icon: any; color: string }[] = [
  { id: "idea", label: "Ideas", icon: Lightbulb, color: "text-amber-500 bg-amber-500/10" },
  { id: "research", label: "Research", icon: Search, color: "text-indigo-500 bg-indigo-500/10" },
  { id: "scripting", label: "Scripting", icon: PenTool, color: "text-blue-500 bg-blue-500/10" },
  { id: "recording", label: "Recording", icon: Clapperboard, color: "text-rose-500 bg-rose-500/10" },
  { id: "editing", label: "Editing", icon: Video, color: "text-purple-500 bg-purple-500/10" },
  { id: "thumbnail", label: "Thumbnail", icon: ImageIcon, color: "text-pink-500 bg-pink-500/10" },
  { id: "seo", label: "SEO", icon: LineChart, color: "text-emerald-500 bg-emerald-500/10" },
  { id: "scheduled", label: "Scheduled", icon: CalendarClock, color: "text-cyan-500 bg-cyan-500/10" },
  { id: "published", label: "Published", icon: CheckCircle2, color: "text-success bg-success/10" },
];

export function PipelinePage() {
  const { videos, updateVideo, deleteVideo } = useStore();

  const handleDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData("videoId", id);
  const handleDrop = (e: React.DragEvent, stage: VideoType["stage"]) => {
    const id = e.dataTransfer.getData("videoId");
    if (id) updateVideo(id, { stage });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <PageHeader title="Pipeline" subtitle="Drag and drop content through your production stages." action={<NewVideoDialog />} />
      <div className="p-8 flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full min-h-[500px]">
          {STAGES.map((s) => {
            const items = videos.filter((v) => v.stage === s.id);
            return (
              <div
                key={s.id}
                className="w-80 flex flex-col bg-secondary/20 rounded-2xl border border-border/50 p-4 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, s.id)}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={"p-1.5 rounded-md " + s.color}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold tracking-tight text-sm">{s.label}</h3>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-1">
                  {items.map((v) => (
                    <Card
                      key={v.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, v.id)}
                      className="p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md transition-all backdrop-blur-sm bg-card/80 group"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold leading-tight mb-2">{v.title}</h4>
                          <div className="flex items-center justify-between">
                            {v.publishDate ? (
                              <div className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                {new Date(v.publishDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </div>
                            ) : <div />}
                            <Button variant="ghost" size="icon" onClick={() => deleteVideo(v.id)} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <div className="h-24 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground font-medium opacity-50">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
