import { useState, useEffect } from "react";
import { type Video, PIPELINE_STAGES } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Save, FileText, CalendarClock, CheckCircle2 } from "lucide-react";
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

  return (
    <Dialog open={!!video} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border/50 shadow-2xl sm:rounded-2xl [&>button]:top-6 [&>button]:right-6 [&>button]:bg-secondary/50 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:hover:bg-secondary">
        <DialogHeader className={`p-6 pb-4 transition-colors ${isPublished ? 'bg-success/10' : 'bg-secondary/20'}`}>
          <div className="flex items-center gap-4">
            <DialogTitle className={`text-xl font-bold transition-colors ${isPublished ? 'text-success' : 'text-primary'}`}>
              Content Details
            </DialogTitle>
            {isPublished ? (
              <div className="px-2 py-0.5 rounded-md text-xs font-semibold bg-success text-success-foreground mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </div>
            ) : (
              <div className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground capitalize mt-0.5">
                {stage}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content & Notes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Stage</Label>
                  <Select value={stage} onValueChange={(v: Video["stage"]) => setStage(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Priority</Label>
                  <Select value={priority} onValueChange={(v: Video["priority"]) => setPriority(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Target Date</Label>
                  <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase text-muted-foreground">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="resize-none font-medium" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase text-muted-foreground">Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Linked Goal</Label>
                  <Select value={linkedGoalId} onValueChange={setLinkedGoalId}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {goals.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Linked Task</Label>
                  <Select value={linkedTaskId} onValueChange={setLinkedTaskId}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-1.5 flex-1 flex flex-col">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Script</Label>
                <Textarea value={script} onChange={(e) => setScript(e.target.value)} className="flex-1 min-h-[150px]" placeholder="Write your script or outline here..." />
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-[100px]" placeholder="Any additional notes..." />
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /> Stage Timeline</h3>
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
                          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-card border-2 border-primary flex items-center justify-center">
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

        <DialogFooter className="p-6 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-2">
          <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
