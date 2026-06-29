import { useState } from "react";
import { useStore } from "@/lib/store";
import { type Video, PIPELINE_STAGES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

export function NewVideoDialog({ trigger }: { trigger?: ReactNode }) {
  const { addVideo, goals, tasks } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [stage, setStage] = useState<Video["stage"]>("idea");
  const [publishDate, setPublishDate] = useState("");
  const [linkedGoalId, setLinkedGoalId] = useState("none");
  const [linkedTaskId, setLinkedTaskId] = useState("none");

  const submit = () => {
    if (!title.trim()) return;
    addVideo({ 
      title: title.trim(), 
      stage, 
      publishDate: publishDate || undefined, 
      priority: "medium",
      description: description.trim() || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      linkedGoalId: linkedGoalId === "none" ? undefined : linkedGoalId,
      linkedTaskId: linkedTaskId === "none" ? undefined : linkedTaskId
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    setTags("");
    setPublishDate("");
    setStage("idea");
    setLinkedGoalId("none");
    setLinkedTaskId("none");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />Add Idea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-card/95">
        <DialogHeader><DialogTitle className="text-xl font-bold text-primary">Add Content Idea</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 10 tips for productivity" autoFocus className="font-medium" /></div>
          
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this piece of content about?" className="resize-none" rows={3} /></div>
          
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Flutter, Tutorial, Tech" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link Goal (Optional)</Label>
              <Select value={linkedGoalId} onValueChange={setLinkedGoalId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {goals.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link Task (Optional)</Label>
              <Select value={linkedTaskId} onValueChange={setLinkedTaskId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Stage</Label>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className={"px-3 py-1 text-sm rounded-full capitalize font-medium transition-colors " + (stage === s.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Publish Date</Label><Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="font-medium" /></div>
        </div>
        <DialogFooter className="border-t border-border/50 pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-secondary/50">Cancel</Button>
          <Button onClick={submit} className="bg-primary text-primary-foreground">Add Idea</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
