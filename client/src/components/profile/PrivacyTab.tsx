import { useState } from "react";
import { profileService } from "@/services/profile.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { Download, Trash2 } from "lucide-react";

export function PrivacyTab() {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setBusy(true);
    try {
      const { data } = await profileService.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ark-data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't export your data. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError("Type DELETE to confirm.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await profileService.deleteAccount({ confirm: "DELETE" });
      window.location.href = "/";
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't delete account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider mb-6">Export Your Data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Download a JSON file containing all your account data, assessments, and activity.
        </p>
        <button
          onClick={handleExport}
          disabled={busy}
          className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
        >
          {busy ? "Exporting…" : "Export Data"}
        </button>
      </div>

      <div className="glass-card p-6 rounded-xl border border-destructive/30 bg-destructive/5">
        <h2 className="font-display font-bold text-lg text-destructive uppercase tracking-wider mb-4">Delete Account</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This action is irreversible. All your data, assessments, and history will be permanently removed.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-destructive/50 transition-colors"
          />
          <button
            onClick={handleDelete}
            disabled={busy}
            className="w-full px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
          >
            {busy ? "Deleting…" : "Delete Account Permanently"}
          </button>
        </div>
        {error && <p className="text-xs font-mono text-destructive mt-3">{error}</p>}
      </div>
    </div>
  );
}