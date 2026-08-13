import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Loader2 } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { useNotificationStream } from "@/lib/useArkStream";
import type { RoundtableSeat } from "@/types/sphinx";

function formatHeldDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function RoundtablePage() {
  const [seats, setSeats] = useState<RoundtableSeat[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const r = await sphinxService.getRoundtable();
      setSeats(r.data || []);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Failed to load roundtable."));
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Live rotation refresh — when any seat changes hands, re-fetch via the
  // shared SSE hub. The hook multiplexes the same EventSource the bell uses.
  useNotificationStream(true, undefined, () => {
    refresh();
  });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="glass-card p-4 rounded-xl border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }
  if (seats === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Crown className="h-7 w-7 text-amber-400" />
        <div>
          <h1
            className="text-2xl font-display font-bold text-primary tracking-widest uppercase"
            data-testid="text-roundtable-title"
          >
            ARK Roundtable — Top 12
          </h1>
          <p className="text-muted-foreground font-mono text-xs">
            Ranked by 60% HIVE score + 40% normalized sales. Live updates on
            every publish/purchase.
          </p>
        </div>
      </div>

      {seats.length === 0 ? (
        <div
          className="glass-card p-8 rounded-xl text-center"
          data-testid="text-empty-roundtable"
        >
          <p className="font-mono text-sm text-muted-foreground uppercase">
            No active SPCs yet — be the first to claim a seat.
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-testid="list-roundtable-seats">
          {seats.map((s) => (
            <Link
              key={s.seatNumber}
              to={s.listing ? `/marketplace/${s.listing.id}` : "/marketplace"}
              data-testid={`row-seat-${s.seatNumber}`}
              className="block p-3 rounded-lg border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-amber-400/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-display font-bold text-lg border ${
                    s.seatNumber <= 3
                      ? "bg-amber-400/15 text-amber-400 border-amber-400/40"
                      : s.seatNumber <= 6
                        ? "bg-slate-300/10 text-slate-300 border-slate-300/30"
                        : "bg-white/5 text-muted-foreground border-white/10"
                  }`}
                >
                  {s.seatNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-mono text-sm text-white font-bold truncate"
                    data-testid={`text-seat-title-${s.seatNumber}`}
                  >
                    {s.listing?.title ?? "(deleted)"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">
                    by {s.creator?.name ?? "—"} • {s.listing?.pillar ?? ""}
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-end gap-0.5 mr-3">
                  <span className="font-mono text-[9px] uppercase text-muted-foreground tracking-widest">
                    Held
                  </span>
                  <span
                    className="font-mono text-sm text-white font-bold"
                    data-testid={`text-seat-held-${s.seatNumber}`}
                  >
                    {formatHeldDuration(s.timeHeldMs)}
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-end gap-0.5 mr-3">
                  <span className="font-mono text-[9px] uppercase text-muted-foreground tracking-widest">
                    Δ Rank
                  </span>
                  <span
                    data-testid={`text-seat-rankdelta-${s.seatNumber}`}
                    className={`font-mono text-sm font-bold ${
                      s.rankDelta > 0
                        ? "text-emerald-400"
                        : s.rankDelta < 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {s.rankDelta > 0
                      ? `▲${s.rankDelta}`
                      : s.rankDelta < 0
                        ? `▼${Math.abs(s.rankDelta)}`
                        : "—"}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-0.5 mr-3">
                  <span className="font-mono text-[9px] uppercase text-muted-foreground tracking-widest">
                    HIVE
                  </span>
                  <span className="font-mono text-sm text-white font-bold">
                    {s.hiveScore}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-0.5 mr-3">
                  <span className="font-mono text-[9px] uppercase text-muted-foreground tracking-widest">
                    Sales
                  </span>
                  <span className="font-mono text-sm text-white font-bold">
                    {s.salesCount}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono text-[9px] uppercase text-amber-400 tracking-widest">
                    Score
                  </span>
                  <span
                    className="font-mono text-base text-amber-400 font-bold"
                    data-testid={`text-seat-score-${s.seatNumber}`}
                  >
                    {s.score}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
