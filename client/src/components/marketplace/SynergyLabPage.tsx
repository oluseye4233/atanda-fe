import { useEffect, useMemo, useState } from "react";
import { Sparkles, Loader2, Search } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import type { JngCardLite, SynergyResult } from "@/types/sphinx";

export function SynergyLabPage() {
  const [cards, setCards] = useState<JngCardLite[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<SynergyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let active = true;
    sphinxService
      .getJnomicsCards()
      .then((r) => {
        if (active) setCards(r.data || []);
      })
      .catch((e: unknown) => {
        if (active) setError(getApiErrorMessage(e, "Failed to load cards."));
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
    setResult(null);
  };

  const calculate = async () => {
    if (selected.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const r = await sphinxService.calculateSynergy(selected);
      setResult(r.data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Synergy calculation failed."));
    } finally {
      setBusy(false);
    }
  };

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.disc ?? "").toLowerCase().includes(q) ||
        (c.rarity ?? "").toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q),
    );
  }, [cards, filter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-primary" />
        <div>
          <h1
            className="text-2xl font-display font-bold text-primary tracking-widest uppercase"
            data-testid="text-synergy-lab-title"
          >
            Synergy Lab
          </h1>
          <p className="text-muted-foreground font-mono text-xs">
            Pick 2-5 Junglenomics cards to preview the composite synergy score.
            Informational only — no ARK impact.
          </p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-primary/20 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Selected ({selected.length}/5)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelected([]);
                setResult(null);
              }}
              disabled={selected.length === 0}
              data-testid="button-clear-selection"
              className="px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={calculate}
              disabled={selected.length < 2 || busy}
              data-testid="button-calculate-synergy"
              className="px-4 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 disabled:opacity-40 flex items-center gap-2"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Calculate
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {selected.map((id) => {
            const c = cards?.find((x) => x.id === id);
            if (!c) return null;
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                data-testid={`chip-selected-${id}`}
                className="px-2.5 py-1 rounded bg-primary/15 text-primary border border-primary/40 font-mono text-[11px] flex items-center gap-1.5"
              >
                <span>{c.emoji ?? "•"}</span>
                {c.name}
                <span className="opacity-60">×</span>
              </button>
            );
          })}
          {selected.length === 0 && (
            <span className="font-mono text-[11px] text-muted-foreground/60 italic">
              Select cards from the list below.
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-card p-3 rounded-lg border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div
          className="glass-card p-5 rounded-xl border border-primary/30 space-y-3"
          data-testid="panel-synergy-result"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Composite Synergy
              </div>
              <div
                className="font-display text-4xl font-bold text-primary"
                data-testid="text-synergy-score"
              >
                {result.synergyScore}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {result.pairCount} pair{result.pairCount === 1 ? "" : "s"}{" "}
              analyzed
            </span>
          </div>
          <ul className="space-y-1.5">
            {result.breakdown.map((b, i) => {
              const ca = cards?.find((c) => c.id === b.a);
              const cb = cards?.find((c) => c.id === b.b);
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 text-[11px] font-mono"
                  data-testid={`row-pair-${b.a}-${b.b}`}
                >
                  <span className="text-white">{ca?.name ?? b.a}</span>
                  <span className="text-muted-foreground">×</span>
                  <span className="text-white">{cb?.name ?? b.b}</span>
                  <span className="ml-auto text-primary font-bold">
                    {b.score}
                  </span>
                  <span className="text-muted-foreground/60 text-[10px] italic">
                    {b.rationale}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          data-testid="input-synergy-card-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, discipline, rarity, category…"
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
        />
      </div>

      {cards === null ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5"
          data-testid="grid-synergy-cards"
        >
          {filteredCards.map((c) => {
            const active = selected.includes(c.id);
            const disabled = !active && selected.length >= 5;
            return (
              <button
                key={c.id}
                onClick={() => !disabled && toggle(c.id)}
                disabled={disabled}
                data-testid={`card-pick-${c.id}`}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  active
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : disabled
                      ? "bg-white/5 border-white/5 text-muted-foreground/40 cursor-not-allowed"
                      : "bg-white/5 border-white/10 text-foreground hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <div className="text-lg mb-1">{c.emoji ?? "•"}</div>
                <div className="font-mono text-[11px] font-bold truncate">
                  {c.name}
                </div>
                <div className="font-mono text-[9px] uppercase text-muted-foreground/70 mt-0.5 truncate">
                  {[c.disc, c.rarity, c.version].filter(Boolean).join(" · ")}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
