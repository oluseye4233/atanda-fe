import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { f1000Service } from "@/services/f1000.service";
import { getApiErrorMessage } from "@/lib/apiError";
import type { F1000RandomCode } from "@/types/f1000";

interface F1000RandomCodePanelProps {
  onClaimed: () => void;
}

/**
 * The QR-scan landing flow: fetches a single-use code from
 * `GET /v1/f1000/random-code`, lets the user copy it, then claims it via
 * `POST /v1/f1000/claim` with the code in the body.
 */
export function F1000RandomCodePanel({ onClaimed }: F1000RandomCodePanelProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [soldOut, setSoldOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await f1000Service.getRandomCode();
      if (data.code) {
        setCode(data.code);
        setSoldOut(false);
      } else {
        setCode(null);
        setSoldOut(true);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not fetch a code."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const claim = async () => {
    if (!code) return;
    setClaiming(true);
    setError(null);
    try {
      await f1000Service.claim({ code });
      setClaimed(true);
      onClaimed();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not claim this code."));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 space-y-5" data-testid="card-f1000-random-code">
      <div className="inline-flex items-center gap-2 text-secondary font-mono text-xs uppercase tracking-widest">
        <Sparkles className="h-3.5 w-3.5" /> Scan to claim your free seat
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground font-mono text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Fetching your code…
        </div>
      )}

      {!loading && soldOut && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive"
          data-testid="text-f1000-random-soldout"
        >
          No available codes — all 1,000 F1000 seats have been claimed.
        </div>
      )}

      {!loading && !soldOut && code && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Your single-use code
            </div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 rounded-lg border border-primary/40 bg-black/50 px-4 py-3 font-mono text-base text-primary tracking-wide break-all"
                data-testid="text-f1000-random-code"
              >
                {code}
              </code>
              <button
                onClick={copyCode}
                data-testid="button-copy-f1000-random-code"
                className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Copy code"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {claimed ? (
            <div
              className="rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 font-mono text-sm text-secondary"
              data-testid="text-f1000-random-claimed"
            >
              <Check className="h-4 w-4 inline mr-1" /> Code claimed — your seat is reserved.
            </div>
          ) : (
            <button
              onClick={claim}
              disabled={claiming}
              data-testid="button-claim-f1000-random"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-mono text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {claiming ? "Claiming…" : "Claim my F1000 code"} <ArrowRight className="h-5 w-5" />
            </button>
          )}

          {error && (
            <p className="text-xs font-mono text-destructive" data-testid="text-f1000-random-error">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}