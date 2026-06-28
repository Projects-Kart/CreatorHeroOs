import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { PIPELINE_STAGES, type PipelineStage, type Priority } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Content Pipeline — TimeTracker" },
      { name: "description", content: "Kanban board for every video from idea to published." },
      { property: "og:title", content: "Content Pipeline — TimeTracker" },
      { property: "og:description", content: "Track every video from idea to publish." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const { videos, moveVideo, deleteVideo } = useStore();
  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Content pipeline" subtitle="Drag any video between stages. Auto-task generation flows from here." action={<NewVideoDialog />} />
      <div className="p-8 overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const items = videos.filter((v) => v.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="w-64 shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragId) { moveVideo(dragId, stage.id); setDragId(null); } }}
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-sm font-semibold tracking-tight">{stage.label}</h3>
                  <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
                </div>
                <div className="space-y-2 min-h-[120px] rounded-lg bg-surface-2/60 p-2 border border-border">
                  {items.map((v) => (
                    <Card
                      key={v.id}
                      draggable
                      onDragStart={() => setDragId(v.id)}
                      onDragEnd={() => setDragId(null)}
                      className="p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium leading-tight">{v.title}</div>
                          {v.hook && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.hook}</div>}
                        </div>
                        <button onClick={() => deleteVideo(v.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        {v.series && <span className="rounded bg-secondary px-1.5 py-0.5">{v.series}</span>}
                        {v.estimatedLength && <span>{v.estimatedLength}m</span>}
                        <span className={"capitalize " + (v.priority === "urgent" ? "text-destructive font-medium" : v.priority === "high" ? "text-primary font-medium" : "")}>{v.priority}</span>
                        {v.publishDate && <span>· 📅 {v.publishDate}</span>}
                      </div>
                      {v.metrics && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border pt-2">
                          <span>👁 {(v.metrics.views ?? 0).toLocaleString()}</span>
                          <span>👍 {v.metrics.likes}</span>
                          <span>CTR {v.metrics.ctr}%</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <Select value={v.stage} onValueChange={(s) => moveVideo(v.id, s as PipelineStage)}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function NewVideoDialog() {
  const { addVideo } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [stage, setStage] = useState<PipelineStage>("idea");
  const [priority, setPriority] = useState<Priority>("medium");
  const [series, setSeries] = useState("");
  const [length, setLength] = useState("");
  const submit = () => {
    if (!title.trim()) return;
    addVideo({
      title: title.trim(),
      hook: hook.trim() || undefined,
      stage,
      priority,
      series: series.trim() || undefined,
      estimatedLength: length ? parseInt(length, 10) : undefined,
    });
    setOpen(false);
    setTitle(""); setHook(""); setSeries(""); setLength("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New video</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New video</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus /></div>
          <div><Label>Hook</Label><Input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="What's the angle?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as PipelineStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Series</Label><Input value={series} onChange={(e) => setSeries(e.target.value)} /></div>
            <div><Label>Length (min)</Label><Input type="number" value={length} onChange={(e) => setLength(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add to pipeline</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}