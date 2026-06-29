import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { type Video as VideoType } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Trash2, GripVertical, CheckCircle2, Video, Clapperboard, PenTool, Lightbulb, Search, Image as ImageIcon, LineChart, CalendarClock, Plus, MoreHorizontal, Flag, Calendar, Paperclip, Tag } from "lucide-react";
import { NewVideoDialog } from "./components/NewVideoDialog";
import { VideoDetailsDialog } from "./components/VideoDetailsDialog";

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
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);

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
                    <h3 className="font-bold tracking-tight text-base">{s.label}</h3>
                    <span className="text-xs font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">{items.length}</span>
                  </div>
                  <NewVideoDialog trigger={
                    <button className="h-6 w-8 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  } />
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-1">
                  {items.map((v) => {
                    const stageIndex = STAGES.findIndex(st => st.id === v.stage);
                    const progressPercent = Math.round(((stageIndex + 1) / STAGES.length) * 100);
                    const isPublished = v.stage === "published";
                    
                    return (
                      <Card
                        key={v.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, v.id)}
                      onClick={() => setSelectedVideo(v)}
                        className={`rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all group flex flex-col relative pb-1 ${
                          isPublished 
                            ? "bg-success/5 border-success/30 hover:border-success/50 hover:shadow-md" 
                            : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                            isPublished ? 'text-success' :
                            v.priority === 'low' ? 'text-emerald-500' :
                            v.priority === 'medium' ? 'text-amber-500' :
                            v.priority === 'high' ? 'text-rose-500' : 'text-purple-500'
                          }`}>
                            {isPublished ? <CheckCircle2 className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                            {isPublished ? "COMPLETED" : `${v.priority} PRIORITY`}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:bg-secondary" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to delete this idea?")) {
                                  deleteVideo(v.id);
                                }
                              }} className="text-destructive focus:text-destructive cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Idea
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                      
                      <div className="px-4 py-2 space-y-3">
                        <h4 className="text-sm font-bold leading-tight text-foreground">{v.title}</h4>
                        
                        {v.publishDate && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(v.publishDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        )}

                        {v.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {v.description}
                          </p>
                        )}
                      </div>

                      <div className="px-4 pb-4 pt-2 mt-auto space-y-3">
                        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground font-medium">
                          <div className="flex items-center gap-1.5">
                            {(v.linkedGoalId || v.linkedTaskId) ? (
                              <>
                                <Paperclip className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[100px]">
                                  {v.linkedGoalId ? 'Goal' : 'Task'} linked
                                </span>
                              </>
                            ) : <span className="opacity-0">-</span>}
                          </div>
                          
                          {v.tags && v.tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]">{v.tags.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1 w-full bg-secondary/50 absolute bottom-0 left-0">
                        <div 
                          className={`h-full transition-all duration-500 ${isPublished ? 'bg-success' : 'bg-primary'}`} 
                          style={{ width: `${progressPercent}%` }} 
                        />
                      </div>
                    </Card>
                  );
                })}
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
      <VideoDetailsDialog video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}
