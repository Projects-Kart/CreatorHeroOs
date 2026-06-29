import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { Database, Trash2, Download, Upload, Share2, Link2, LinkIcon, UserCircle2, Copy, CheckCheck, X } from "lucide-react";
import { useState } from "react";
import { createShareToken, revokeShareToken } from "@/lib/firestore";

export function SettingsPage() {
  const store = useStore();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  // shareToken is stored in settings (injected via Firestore settings doc)
  const settings = store.settings as typeof store.settings & { shareToken?: string; shareEnabled?: boolean };
  const shareToken = (settings as Record<string, unknown>).shareToken as string | undefined;
  const shareEnabled = (settings as Record<string, unknown>).shareEnabled as boolean | undefined;
  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : null;

  const exportData = () => {
    const data = store.exportJSON();
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
          const json = e.target?.result as string;
          if (confirm("This will add/overwrite data from the backup. Continue?")) {
            store.importJSON(json);
          }
        } catch {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleGenerateLink = async () => {
    if (!user) return;
    setSharing(true);
    try {
      await createShareToken(user.uid, user.displayName ?? "Creator", user.photoURL ?? undefined);
    } catch (err) {
      console.error("Failed to generate share token:", err);
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeLink = async () => {
    if (!user || !shareToken) return;
    if (!confirm("This will invalidate the current link. Anyone with it won't be able to view your data. Continue?")) return;
    setSharing(true);
    try {
      await revokeShareToken(user.uid, shareToken);
    } catch (err) {
      console.error("Failed to revoke share token:", err);
    } finally {
      setSharing(false);
    }
  };

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Settings" subtitle="Manage your account, sharing, and data." />
      <div className="p-8 max-w-2xl mx-auto space-y-8">

        {/* ── Account Card ─────────────────────────────────── */}
        <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5">
          <div className="flex items-center gap-3 mb-5 border-b border-border/50 pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><UserCircle2 className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">Account</h3>
              <p className="text-sm text-muted-foreground">Signed in with Google</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
                  {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.displayName ?? "Unknown User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono truncate">uid: {user.uid.slice(0, 16)}…</p>
              </div>
            </div>
          )}
        </Card>

        {/* ── Share Progress Card ─────────────────────────── */}
        <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5">
          <div className="flex items-center gap-3 mb-5 border-b border-border/50 pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Share2 className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">Share Progress</h3>
              <p className="text-sm text-muted-foreground">Give your audience a read-only view of your timetable.</p>
            </div>
          </div>

          {shareEnabled && shareUrl ? (
            <div className="space-y-4">
              {/* Active link display */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-mono text-foreground flex-1 truncate">{shareUrl}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-primary/20 hover:bg-primary/10"
                  onClick={copyLink}
                >
                  {copied ? (
                    <><CheckCheck className="h-4 w-4 mr-2 text-green-500" /> Copied!</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> Copy Link</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={handleRevokeLink}
                  disabled={sharing}
                >
                  <X className="h-4 w-4 mr-2" /> Revoke
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view your goals, tasks, and pipeline. They cannot edit anything.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border/60">
                <Link2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">No active share link</p>
                  <p className="text-xs text-muted-foreground mt-1">Generate a link to let others view your progress. You can revoke it anytime.</p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleGenerateLink}
                disabled={sharing || !user}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {sharing ? "Generating…" : "Generate Share Link"}
              </Button>
            </div>
          )}
        </Card>

        {/* ── Data Management Card ────────────────────────── */}
        <Card className="p-6 backdrop-blur-xl bg-card/60 shadow-lg border-white/10 dark:border-white/5 transition-all">
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Database className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">Data Management</h3>
              <p className="text-sm text-muted-foreground">Your data is backed by Firebase. Back it up locally too.</p>
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

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div>
                <p className="text-sm font-medium">Insert Sample Data</p>
                <p className="text-xs text-muted-foreground">Populate your dashboard with dummy data to see how it works.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { store.resetAll(); }} className="border-primary/20 hover:bg-primary/10">
                <Database className="h-4 w-4 mr-2" /> Insert
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Danger Zone ─────────────────────────────────── */}
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
              <p className="text-xs text-destructive/70">Re-seed your account with default demo data.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { if (confirm("Reset all data to demo defaults?")) store.resetAll(); }}
              className="shadow-sm"
            >
              Reset Data
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
