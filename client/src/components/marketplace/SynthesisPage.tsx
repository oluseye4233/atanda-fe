import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertTriangle,
  Lock,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAuth } from "@/lib/useAuth";
import { formatPriceUsd } from "@/lib/sphinx";
import { TierBadge } from "./badges";
import type {
  SpcListing,
  UserCredits,
  SynthSession,
  FinalizeResult,
} from "@/types/sphinx";

export function SynthesisPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<SpcListing[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [session, setSession] = useState<SynthSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [outcome, setOutcome] = useState<FinalizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [credits, setCredits] = useState<UserCredits | null>(null);

  useEffect(() => {
    let active = true;
    sphinxService
      .listListings()
      .then((r) => {
        if (active) setListings(r.data.data);
      })
      .catch((e: unknown) => {
        if (active) setError(getApiErrorMessage(e));
      });
    if (user)
      sphinxService
        .getCredits(user.id)
        .then((r) => {
          if (active) setCredits(r.data);
        })
        .catch(() => null);
    return () => {
      active = false;
    };
  }, [user?.id]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 7
          ? prev
          : [...prev, id],
    );
    setSession(null);
    setOutcome(null);
    setError(null);
  };

  const preview = async () => {
    if (selected.length < 2) return;
    setBusy(true);
    setError(null);
    setOutcome(null);
    try {
      const s = await sphinxService.createSynthesisSession(selected);
      setSession(s.data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Synthesis preview failed."));
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    if (!session || !user) return;
    setFinalizing(true);
    setError(null);
    try {
      const r = await sphinxService.finalizeSynthesisSession(session.id);
      setOutcome(r.data);
      setSession(r.data.session);
      const refreshed = await sphinxService.getCredits(user.id);
      setCredits(refreshed.data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Finalize failed."));
    } finally {
      setFinalizing(false);
    }
  };

  const filtered = useMemo(() => {
    if (!listings) return [];
    const q = filter.trim().toLowerCase();
    const own = user?.id;
    return listings.filter(
      (l) =>
        l.creatorId !== own &&
        (!q ||
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)),
    );
  }, [listings, filter, user?.id]);

  const insufficient = !!(
    credits &&
    session &&
    credits.balance < session.totalCreditPrice
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1
              className="text-2xl font-display font-bold text-primary tracking-widest uppercase"
              data-testid="text-synthesis-title"
            >
              Synthesis Engine
            </h1>
            <p className="text-muted-foreground font-mono text-xs">
              Combine 2–7 SPCs into one ZPOS-compressed prompt. Royalties split
              70/30 by source price weight.
            </p>
          </div>
        </div>
        <Link
          to="/marketplace"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary inline-flex items-center gap-2"
          data-testid="link-back-synthesis"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      {!user && (
        <div
          className="glass-card p-6 rounded-xl border border-amber-400/30 bg-amber-400/5 text-center font-mono text-sm text-amber-400"
          data-testid="text-synthesis-login"
        >
          Please{" "}
          <Link to="/login" className="underline">
            log in
          </Link>{" "}
          to run a synthesis.
        </div>
      )}

      <div className="glass-card p-4 rounded-xl border border-primary/20 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
            data-testid="text-cart-count"
          >
            Cart ({selected.length}/7)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter active listings…"
              data-testid="input-synthesis-filter"
              className="px-3 py-1.5 rounded bg-black/30 border border-white/10 font-mono text-xs text-white placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setSelected([]);
                setSession(null);
                setOutcome(null);
              }}
              disabled={selected.length === 0}
              data-testid="button-clear-cart"
              className="px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={preview}
              disabled={selected.length < 2 || busy}
              data-testid="button-preview-synthesis"
              className="px-4 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 disabled:opacity-40 flex items-center gap-2"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Preview ZPOS
            </button>
          </div>
        </div>

        {listings === null ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
            {filtered.map((l) => {
              const on = selected.includes(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggle(l.id)}
                  data-testid={`button-toggle-${l.id}`}
                  className={`text-left p-3 rounded-lg border transition-all ${on ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/5 hover:border-primary/30"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <TierBadge hive={l.hiveScore} />
                    <span className="font-mono text-[10px] text-amber-400">
                      {l.priceCredits} cr
                    </span>
                  </div>
                  <p className="font-mono text-xs text-white font-bold truncate">
                    {l.title}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">
                    {l.pillar}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div
          className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive flex items-center gap-2"
          data-testid="text-synthesis-error"
        >
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {session && (
        <div
          className="glass-card p-5 rounded-xl border border-secondary/30 bg-secondary/5 space-y-4"
          data-testid="panel-synthesis-preview"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded border border-white/10 bg-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">
                ZPOS
              </div>
              <div
                className="font-mono text-base font-bold text-primary"
                data-testid="text-zpos-method"
              >
                {session.zposMethod}
              </div>
            </div>
            <div className="p-3 rounded border border-white/10 bg-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">
                Pre tokens
              </div>
              <div
                className="font-mono text-base font-bold text-white"
                data-testid="text-pre-tokens"
              >
                {session.preTokens}
              </div>
            </div>
            <div className="p-3 rounded border border-white/10 bg-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">
                Post tokens
              </div>
              <div
                className="font-mono text-base font-bold text-white"
                data-testid="text-post-tokens"
              >
                {session.postTokens}
              </div>
            </div>
            <div className="p-3 rounded border border-white/10 bg-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">
                Reduction
              </div>
              <div
                className="font-mono text-base font-bold text-secondary"
                data-testid="text-reduction-pct"
              >
                −{Math.round(session.reductionPct)}%
              </div>
            </div>
            <div className="p-3 rounded border border-white/10 bg-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">
                Semantic
              </div>
              <div
                className="font-mono text-base font-bold text-amber-400"
                data-testid="text-semantic"
              >
                {session.semanticPreservation}%
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-2">
              Royalty split (locked at preview)
            </div>
            <div className="space-y-1">
              {session.splitPreview.map((s) => (
                <div
                  key={s.sourceListingId}
                  className="flex items-center justify-between p-2 rounded border border-white/5 bg-white/5 font-mono text-xs"
                  data-testid={`row-split-${s.sourceListingId}`}
                >
                  <span className="text-muted-foreground truncate flex-1">
                    {s.sourceListingId.slice(0, 12)}…
                  </span>
                  <span className="text-white mx-3">
                    {Math.round(s.weight * 100)}%
                  </span>
                  <span className="text-amber-400">+{s.creditedAmount} cr</span>
                </div>
              ))}
            </div>
          </div>

          {session.status === "preview" && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
                Compressed prompt preview
              </div>
              <pre
                className="glass-card p-3 rounded border border-primary/20 text-[11px] text-white/80 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto"
                data-testid="text-combined-preview"
              >
                {session.previewSnippet || ""}
                {session.previewTruncated ? " …" : ""}
              </pre>
              <div
                className="p-2.5 rounded border border-amber-400/30 bg-amber-400/5 text-amber-400 font-mono text-[11px] flex items-center gap-2"
                data-testid="text-locked-preview"
              >
                <Lock className="h-3.5 w-3.5" />
                Full compressed body locked — finalize for{" "}
                {session.totalCreditPrice} cr to unlock.
              </div>
            </div>
          )}
          {session.status === "finalized" && session.combinedOutput && (
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-secondary mb-1">
                Compressed prompt (unlocked)
              </div>
              <pre
                className="glass-card p-3 rounded border border-secondary/30 text-[11px] text-white/80 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto"
                data-testid="text-combined-output"
              >
                {session.combinedOutput}
              </pre>
            </div>
          )}

          {!outcome && session.status === "preview" && (
            <button
              onClick={finalize}
              disabled={finalizing || insufficient}
              data-testid="button-finalize-synthesis"
              className="w-full px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-all bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {finalizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Coins className="h-4 w-4" />
              )}
              {insufficient
                ? `Need ${session.totalCreditPrice - (credits?.balance ?? 0)} more credits`
                : `Finalize for ${session.totalCreditPrice} cr`}
            </button>
          )}

          {outcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg border border-secondary/30 bg-secondary/5 font-mono text-sm text-secondary flex items-center gap-2"
              data-testid="text-synthesis-success"
            >
              <CheckCircle2 className="h-4 w-4" /> Synthesis finalized —
              combined prompt unlocked. Balance:
              <span className="text-white">
                {formatPriceUsd(outcome.buyerBalance)}
              </span>
              .
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
