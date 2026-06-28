import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Database, Trash2, Download, Upload } from "lucide-react";

export function SettingsPage() {
  const store = useStore();

  const exportData = () => {
    const data = JSON.stringify(store);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (confirm("This will overwrite all current data. Are you sure?")) {
            useStore.setState(data);
          }
        } catch (err) {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const resetData = () => {
    if (confirm("Are you absolutely sure you want to delete all data? This cannot be undone.")) {
      useStore.setState({ tasks: [], checkins: [], videos: [], goals: [] });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Settings" subtitle="Manage your preferences and data." />
      <div className="p-8 max-w-2xl mx-auto space-y-8">
        
        <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all">
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Database className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">Data Management</h3>
              <p className="text-sm text-muted-foreground">Your data lives locally in your browser. Back it up often.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">Download a JSON backup of your tasks and goals.</p>
              </div>
              <Button variant="outline" size="sm" onClick={exportData} className="border-primary/20 hover:bg-primary/10">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div>
                <p className="text-sm font-medium">Import Data</p>
                <p className="text-xs text-muted-foreground">Restore from a previous backup.</p>
              </div>
              <Button variant="outline" size="sm" onClick={importData} className="border-primary/20 hover:bg-primary/10">
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-destructive/5 shadow-lg border-destructive/20 transition-all border-dashed">
          <div className="flex items-center gap-3 mb-6 border-b border-destructive/20 pb-4">
            <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><Trash2 className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-destructive">Danger Zone</h3>
              <p className="text-sm text-destructive/70">Irreversible actions.</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-destructive">Factory Reset</p>
              <p className="text-xs text-destructive/70">Delete all your data forever.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={resetData} className="shadow-sm">
              Delete Everything
            </Button>
          </div>
        </Card>
        
      </div>
    </div>
  );
}
