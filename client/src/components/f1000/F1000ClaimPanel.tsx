import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, ArrowRight, LogIn, UserPlus, Compass, Crown, GraduationCap } from "lucide-react";
import type { F1000Invite } from "@/types/f1000";

interface F1000ClaimPanelProps {
  user: { id: string; name: string } | null;
  isLoading: boolean;
  invite: F1000Invite | null;
  limit: number;
  soldOut: boolean;
  claiming: boolean;
  claimError: string | null;
  onClaim: () => void;
}

/**
 * The F1000 claim / status panel: shows the sign-in CTA when logged out, the
 * reserved single-use code when claimed, or the claim button otherwise.
 */
export function F1000ClaimPanel({
  user,
  isLoading,
  invite,
  limit,
  soldOut,
  claiming,
  claimError,
  onClaim,
}: F1000ClaimPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 space-y-5" data-testid="card-f1000-claim">
      {!isLoading && !user && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-xl text-white">Sign in to reserve your seat</h2>
          <p className="text-sm text-muted-foreground">
            Your F1000 code is bound to one account. Log in or create a free account, then claim your code here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              data-testid="link-f1000-login"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-400/60 bg-background/60 px-5 py-3 font-mono text-sm uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            >
              <LogIn className="h-4 w-4" /> Log In
            </Link>
            <Link
              to="/signup"
              data-testid="link-f1000-signup"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary/60 bg-primary/10 px-5 py-3 font-mono text-sm uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors"
            >
              <UserPlus className="h-4 w-4" /> Sign Up Free
            </Link>
          </div>
        </div>
      )}

      {user && invite && (
        <div className="space-y-4" data-testid="block-f1000-code">
          <div className="inline-flex items-center gap-2 text-secondary font-mono text-xs uppercase tracking-widest">
            <Check className="h-4 w-4" /> You're member #{invite.seq} of {limit}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Your single-use code</div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 rounded-lg border border-primary/40 bg-black/50 px-4 py-3 font-mono text-base text-primary tracking-wide break-all"
                data-testid="text-f1000-code"
              >
                {invite.code}
              </code>
              <button
                onClick={copyCode}
                data-testid="button-copy-f1000-code"
                className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Copy code"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Compass className="h-4 w-4 text-secondary" /> Individual Explorer unlocked
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Free forever, Training Providers included. When you're ready for more, F1000 pricing caps Pro at
              <span className="text-primary font-semibold"> $10/mo</span> and Student at
              <span className="text-primary font-semibold"> $9/mo</span>.
            </p>
          </div>
          <Link
            to="/subscription"
            data-testid="link-f1000-upgrade"
            className="inline-flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-wider hover:text-primary/80 transition-colors"
          >
            See F1000 pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {user && !invite && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-xl text-white">Claim your F1000 seat</h2>
          <p className="text-sm text-muted-foreground">
            Lock in a free Individual Explorer account with Training Providers unlocked, plus capped F1000 upgrade
            pricing for life.
          </p>
          {soldOut ? (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive"
              data-testid="text-f1000-soldout"
            >
              All 1,000 F1000 seats have been claimed.
            </div>
          ) : (
            <button
              onClick={onClaim}
              disabled={claiming}
              data-testid="button-claim-f1000"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-mono text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {claiming ? "Reserving…" : "Claim my F1000 code"} <ArrowRight className="h-5 w-5" />
            </button>
          )}
          {claimError && (
            <p className="text-xs font-mono text-destructive" data-testid="text-f1000-error">
              {claimError}
            </p>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-white/10 flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Crown className="h-3.5 w-3.5 text-primary" /> Pro $10/mo
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5 text-purple-400" /> Student $9/mo
        </span>
      </div>
    </div>
  );
}
