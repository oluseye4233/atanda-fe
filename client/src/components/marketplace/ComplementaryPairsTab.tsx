import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Coins } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatPriceUsd } from "@/lib/sphinx";
import { TierBadge } from "./badges";
import type { ComplementaryRow } from "@/types/sphinx";

export function ComplementaryPairsTab({ listingId }: { listingId: string }) {
  const [rows, setRows] = useState<ComplementaryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setRows(null);
    setError(null);
    sphinxService
      .getComplementary(listingId)
      .then((r) => {
        if (active) setRows(r.data || []);
      })
      .catch((e: unknown) => {
        if (active) setError(getApiErrorMessage(e, "Failed to load complementary pairs."));
      });
    return () => {
      active = false;
    };
  }, [listingId]);
  if (error) {
    return (
      <div
        className="glass-card p-4 rounded-xl border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive"
        data-testid="text-pairs-error"
      >
        {error}
      </div>
    );
  }
  if (rows === null) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div
        className="glass-card p-6 rounded-xl text-center"
        data-testid="text-empty-pairs"
      >
        <p className="font-mono text-sm text-muted-foreground uppercase">
          No complementary partners yet — check back after the marketplace
          grows.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3" data-testid="list-complementary-pairs">
      <p className="font-mono text-[11px] text-muted-foreground">
        Top-{rows.length} partner cards by cross-tag synergy (0-100). Buy both
        to unlock multiplicative effects.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((p) => (
          <Link
            key={p.partner.id}
            to={`/marketplace/${p.partner.id}`}
            data-testid={`row-pair-${p.partner.id}`}
            className="block p-3 rounded-lg border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                #{p.rank} • {p.partner.pillar}
              </span>
              <span
                className="font-mono text-xs font-bold text-primary"
                data-testid={`text-pair-score-${p.partner.id}`}
              >
                {p.score}% synergy
              </span>
            </div>
            <p className="font-mono text-sm text-white font-bold truncate">
              {p.partner.title}
            </p>
            <div className="flex items-center justify-between mt-2">
              <TierBadge hive={p.partner.hiveScore} />
              <span className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold">
                <Coins className="h-3 w-3" />{" "}
                {formatPriceUsd(p.partner.priceCredits)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
