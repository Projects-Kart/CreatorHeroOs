import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TimeTracker" },
      { name: "description", content: "Working hours, daily task limits, notifications, and data export." },
      { property: "og:title", content: "Settings — TimeTracker" },
      { property: "og:description", content: "Tune TimeTracker to your workflow." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings, exportJSON, importJSON, resetAll } = useStore();
  const [importText, setImportText] = useState("");

  return (
    <>
      <PageHeader title="Settings" subtitle="Tune limits, schedule, and data." />
      <div className="p-8 max-w-3xl space-y-6">
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold tracking-tight">Workspace</h3>
          <div>
            <Label>Channel name</Label>
            <Input value={settings.channelName} onChange={(e) => updateSettings({ channelName: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Day starts</Label><Input type="time" value={settings.workingHoursStart} onChange={(e) => updateSettings({ workingHoursStart: e.target.value })} /></div>
            <div><Label>Day ends</Label><Input type="time" value={settings.workingHoursEnd} onChange={(e) => updateSettings({ workingHoursEnd: e.target.value })} /></div>
            <div><Label>Max tasks / day</Label><Input type="number" value={settings.maxDailyTasks} onChange={(e) => updateSettings({ maxDailyTasks: parseInt(e.target.value, 10) || 0 })} /></div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Notifications</h3>
          {[
            { key: "email", label: "Email reminders" },
            { key: "push", label: "Push reminders" },
            { key: "streakWarnings", label: "Streak-at-risk warnings" },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between py-1">
              <Label className="font-normal">{n.label}</Label>
              <Switch
                checked={(settings.notifications as any)[n.key]}
                onCheckedChange={(v) => updateSettings({ notifications: { ...settings.notifications, [n.key]: v } as any })}
              />
            </div>
          ))}
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Integrations</h3>
          <p className="text-sm text-muted-foreground">Webhook placeholders for YouTube Analytics, Google Calendar, Notion, and Trello will land here.</p>
          <div className="grid grid-cols-2 gap-2">
            {["YouTube Analytics", "Google Calendar", "Notion", "Trello"].map((x) => (
              <div key={x} className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">{x} · coming soon</div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Data</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => {
              const blob = new Blob([exportJSON()], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `timetracker-${new Date().toISOString().slice(0, 10)}.json`; a.click();
              URL.revokeObjectURL(url);
            }}>Export JSON</Button>
            <Button variant="ghost" onClick={() => { if (confirm("Reset all data to seed?")) resetAll(); }}>Reset to seed</Button>
          </div>
          <div>
            <Label>Import JSON</Label>
            <Textarea rows={4} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste backup JSON here" />
            <Button className="mt-2" size="sm" variant="secondary" onClick={() => { if (importText.trim()) { importJSON(importText); setImportText(""); } }}>Import</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
