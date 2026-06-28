import { useState } from "react";
import { useStore } from "@/lib/store";
import { type Video } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function NewVideoDialog() {
  const { addVideo } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<Video["stage"]>("idea");
  const [publishDate, setPublishDate] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addVideo({ title: title.trim(), stage, publishDate: publishDate || undefined });
    setOpen(false);
    setTitle("");
    setPublishDate("");
    setStage("idea");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />New video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-card/95">
        <DialogHeader><DialogTitle className="text-xl font-bold text-primary">Add to Pipeline</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 10 tips for productivity" autoFocus className="font-medium" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Stage</Label>
            <div className="flex flex-wrap gap-2">
              {(["idea", "scripting", "filming", "editing", "published"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={"px-3 py-1 text-sm rounded-full capitalize font-medium transition-colors " + (stage === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Publish Date</Label><Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="font-medium" /></div>
        </div>
        <DialogFooter className="border-t border-border/50 pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-secondary/50">Cancel</Button>
          <Button onClick={submit} className="bg-primary text-primary-foreground">Add video</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
