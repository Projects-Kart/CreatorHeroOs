import { useState, useEffect } from "react";
import { type Video, PIPELINE_STAGES, type PipelineStage } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Save, FileText, CalendarClock, CheckCircle2, Edit2, Share, MoreVertical, AlignLeft, Target, Calendar, CalendarX, Activity, Users, Link as LinkIcon, Hash, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  video: Video | null;
  onClose: () => void;
}

export function VideoDetailsDialog({ video, onClose }: Props) {
  const { updateVideo, deleteVideo, goals, tasks } = useStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [script, setScript] = useState("");
  const [notes, setNotes] = useState("");
  const [linkedGoalId, setLinkedGoalId] = useState("none");
  const [linkedTaskId, setLinkedTaskId] = useState("none");
  const [stage, setStage] = useState<Video["stage"]>("idea");
  const [priority, setPriority] = useState<Video["priority"]>("medium");
  const [publishDate, setPublishDate] = useState("");

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || "");
      setTags(video.tags?.join(", ") || "");
      setScript(video.script || "");
      setNotes(video.notes || "");
      setLinkedGoalId(video.linkedGoalId || "none");
      setLinkedTaskId(video.linkedTaskId || "none");
      setStage(video.stage);
      setPriority(video.priority || "medium");
      setPublishDate(video.publishDate || "");
    }
  }, [video]);

  if (!video) return null;

  const handleSave = () => {
    updateVideo(video.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      script: script.trim() || undefined,
      notes: notes.trim() || undefined,
      linkedGoalId: linkedGoalId === "none" ? undefined : linkedGoalId,
      linkedTaskId: linkedTaskId === "none" ? undefined : linkedTaskId,
      stage,
      priority,
      publishDate: publishDate || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteVideo(video.id);
    onClose();
  };

  const isPublished = stage === "published";
  
  const getStageProgress = (s: PipelineStage) => {
    switch (s) {
      case "idea": return 10;
      case "research": return 30;
      case "scripting": return 50;
      case "filming": return 70;
      case "editing": return 90;
      case "published": return 100;
      default: return 0;
    }
  };
  const progressPercent = getStageProgress(stage);
  
  const priorityColor = priority === 'urgent' ? 'text-red-500' : priority === 'high' ? 'text-rose-500' : priority === 'medium' ? 'text-amber-500' : 'text-emerald-500';

  return (
    <Sheet open={!!video} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:w-[500px] sm:max-w-none p-0 flex flex-col gap-0 border-l border-border/50 bg-background overflow-hidden [&>button.absolute]:hidden">
        
        {/* Custom Header Actions */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card shrink-0">
          <div className="flex items-center gap-2">
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Share className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Idea
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Title */}
            <SheetHeader>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="text-3xl font-black tracking-tight border-none shadow-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 h-auto py-0" 
                placeholder="Idea Title"
              />
            </SheetHeader>

            {/* Metadata Grid */}
            <div className="grid grid-cols-[120px_1fr] gap-y-4 items-center text-[13px]">
              
              <div className="text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Priority
              </div>
              <div>
                <Select value={priority} onValueChange={(v: Video["priority"]) => setPriority(v)}>
                  <SelectTrigger className={`h-7 w-auto inline-flex px-2 border-none bg-secondary/50 font-bold text-xs capitalize shadow-none ${priorityColor}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Status
              </div>
              <div>
                <Select value={stage} onValueChange={(v: Video["stage"]) => setStage(v)}>
                  <SelectTrigger className={`h-7 w-auto inline-flex px-2 border-none font-bold text-xs capitalize shadow-none ${isPublished ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Created date
              </div>
              <div className="font-medium text-foreground pl-2">
                {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <CalendarX className="h-4 w-4" /> Due date
              </div>
              <div className="font-medium text-foreground">
                <Input 
                   type="date" 
                   value={publishDate} 
                   onChange={(e) => setPublishDate(e.target.value)} 
                   className="h-7 border-none shadow-none px-2 bg-transparent focus-visible:ring-0 focus-visible:bg-secondary/50 font-medium"
                />
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Progress
              </div>
              <div className="flex items-center gap-3 pl-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${isPublished ? 'bg-success' : 'bg-primary'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs font-bold w-8">{progressPercent}%</span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" /> Tags
              </div>
              <div className="font-medium text-foreground">
                <Input 
                   value={tags} 
                   onChange={(e) => setTags(e.target.value)} 
                   className="h-7 border-none shadow-none px-2 bg-transparent focus-visible:ring-0 focus-visible:bg-secondary/50 font-medium placeholder:text-muted-foreground/50"
                   placeholder="tag1, tag2..."
                />
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> Link Goal
              </div>
              <div>
                <Select value={linkedGoalId} onValueChange={setLinkedGoalId}>
                  <SelectTrigger className="h-7 border-none bg-transparent shadow-none px-2 hover:bg-secondary/50">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {goals.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> Link Task
              </div>
              <div>
                <Select value={linkedTaskId} onValueChange={setLinkedTaskId}>
                  <SelectTrigger className="h-7 border-none bg-transparent shadow-none px-2 hover:bg-secondary/50">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Description */}
            <div className="bg-secondary/40 p-1 rounded-xl border border-border/50 group">
              <div className="px-3 pt-3 flex items-center gap-1.5">
                <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground">Description</h4>
              </div>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={3} 
                className="resize-none border-none shadow-none bg-transparent focus-visible:ring-0 text-sm leading-relaxed text-foreground/90 placeholder:italic" 
                placeholder="Add a description for this idea..."
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="script" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent p-0 h-auto gap-4">
                <TabsTrigger value="script" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3">
                  Script <span className="ml-2 bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm text-[10px] font-bold">{script ? 1 : 0}</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3">
                  Notes <span className="ml-2 bg-secondary px-1.5 py-0.5 rounded-sm text-[10px] font-bold">{notes ? 1 : 0}</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3">
                  Timeline
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="script" className="pt-6 outline-none">
                <div className="space-y-4">
                  <Textarea 
                    value={script} 
                    onChange={(e) => setScript(e.target.value)} 
                    className="min-h-[250px] bg-secondary/20 border-border/50 resize-y" 
                    placeholder="Write your script or outline here..." 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="notes" className="pt-6">
                <div className="space-y-4">
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="min-h-[150px] bg-secondary/20 border-border/50 resize-y" 
                    placeholder="Any additional notes..." 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="pt-6">
                <div className="space-y-4">
                  <div className="border-l-2 border-border/70 ml-2 space-y-6 pb-2 relative pt-1">
                    {((video.stageHistory && video.stageHistory.length > 0)
                      ? [...video.stageHistory]
                      : Object.entries(video.stageDates || {})
                          .map(([stageId, date]) => ({ stageId: stageId as PipelineStage, date }))
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    )
                      .reverse()
                      .map((entry, idx) => {
                        const stageLabel = PIPELINE_STAGES.find((s) => s.id === entry.stageId)?.label || entry.stageId;
                        return (
                          <div key={`${entry.stageId}-${idx}`} className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                              <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                            </div>
                            <div className="font-semibold text-sm capitalize text-foreground">{stageLabel}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {new Date(entry.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    {(!video.stageHistory?.length && (!video.stageDates || Object.keys(video.stageDates).length === 0)) ? (
                      <div className="text-sm text-muted-foreground pl-4">No timeline history recorded for this idea yet.</div>
                    ) : null}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-border/50 bg-card shrink-0 flex items-center gap-2">
          <Button variant="outline" onClick={onClose} className="w-1/3 py-6 font-bold">Cancel</Button>
          <Button onClick={handleSave} className="w-2/3 py-6 font-bold text-[15px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
