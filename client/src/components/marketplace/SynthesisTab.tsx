import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import type { ListingSyntheses } from "@/types/sphinx";

export function SynthesisTab({ listingId }: { listingId: string }) {
  const [data, setData] = useState<ListingSyntheses | null>(null);
  useEffect(() => {
    let active = true;
    sphinxService
      .getListingSyntheses(listingId)
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [listingId]);
  return (
    <div
      className="glass-card p-6 rounded-xl border border-white/10 space-y-4"
      data-testid="panel-synthesis"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display font-bold text-base text-white tracking-wider uppercase">
            Synthesis Activity
          </h3>
        </div>
        <Link
          to="/marketplace/synthesis"
          className="px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15"
          data-testid="link-open-synthesis"
        >
          Combine cards →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
            Used in
          </div>
          <div
            className="font-mono text-2xl font-bold text-primary"
            data-testid="text-synthesis-count"
          >
            {data ? data.count : "—"}{" "}
            <span className="text-sm text-muted-foreground font-normal">
              syntheses
            </span>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
            Avg ZPOS reduction
          </div>
          <div
            className="font-mono text-2xl font-bold text-secondary"
            data-testid="text-avg-reduction"
          >
            {data && data.recent.length
              ? `${Math.round(data.recent.reduce((s, r) => s + (r.reductionPct ?? 0), 0) / data.recent.length)}%`
              : "—"}
          </div>
        </div>
      </div>
      {data && data.recent.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
            Recent finalized syntheses
          </div>
          {data.recent.map((r) => (
            <div
              key={r.sessionId}
              className="flex items-center justify-between p-2.5 rounded border border-white/5 bg-white/5"
              data-testid={`row-synthesis-${r.sessionId}`}
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
              <span className="font-mono text-xs text-primary">
                {r.zposMethod}
              </span>
              <span className="font-mono text-xs text-secondary">
                −{Math.round(r.reductionPct)}%
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="font-mono text-[11px] text-muted-foreground/80 border-t border-white/5 pt-3">
        When buyers combine this SPC with others, you earn a pro-rata share of
        the synthesis revenue (70% creator pool, weighted by source price).
      </p>
    </div>
  );
}
