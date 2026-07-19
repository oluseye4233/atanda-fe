import { Key, ShieldCheck, Crown, Settings } from "lucide-react";

export function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider mb-6">Password & Security</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-sm text-white">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple/10 border border-purple/30 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-mono text-sm text-white">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="font-mono text-sm text-white">Session Management</p>
                <p className="text-xs text-muted-foreground">View and revoke active sessions</p>
              </div>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl border border-destructive/30 bg-destructive/5">
        <h2 className="font-display font-bold text-lg text-destructive uppercase tracking-wider mb-4">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}