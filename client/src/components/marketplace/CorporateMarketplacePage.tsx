import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Loader2, Tag, Coins } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { CC_PILLARS, formatPriceUsd, hiveToTierBadge } from "@/lib/sphinx";
import { FilterChipRow } from "./FilterChipRow";
import type { CorporateListings } from "@/types/sphinx";

export function CorporateMarketplacePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<CorporateListings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pillar, setPillar] = useState<string>("All");
  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    sphinxService
      .getCorporateListings(pillar)
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((e: unknown) => {
        if (active)
          setError(
            getApiErrorMessage(e, "Failed to load corporate marketplace."),
          );
      });
    return () => {
      active = false;
    };
  }, [pillar]);
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/marketplace")}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
          data-testid="button-back-to-market"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="font-display font-bold text-2xl tracking-wider uppercase">
            Corporate Marketplace
          </h1>
        </div>
      </div>
      {data && (
        <div className="glass-card p-4 rounded-xl border border-primary/20">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Institution
          </p>
          <p
            className="font-display text-lg text-primary"
            data-testid="text-institution-name"
          >
            {data.institution}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground mt-1">
            Internal SPCs published by members of your institution. Purchases
            are restricted to fellow members.
          </p>
        </div>
      )}
      {error && (
        <div className="glass-card p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <p
            className="font-mono text-sm text-destructive"
            data-testid="text-corporate-error"
          >
            {error}
          </p>
        </div>
      )}
      <FilterChipRow
        label="Pillar"
        testGroup="corp-pillar"
        options={["All", ...CC_PILLARS]}
        value={pillar}
        onChange={setPillar}
      />
      {!data && !error && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {data && data.listings.length === 0 && (
        <div
          className="glass-card p-8 rounded-xl text-center"
          data-testid="text-corporate-empty"
        >
          <p className="font-mono text-sm text-muted-foreground">
            No corporate SPCs published yet for {data.institution}.
          </p>
        </div>
      )}
      {data && data.listings.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="grid-corporate-listings"
        >
          {data.listings.map((l) => (
            <Link
              key={l.id}
              to={`/marketplace/${l.id}`}
              data-testid={`card-corporate-${l.id}`}
              className="glass-card p-4 rounded-xl border border-white/10 hover:border-primary/40 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-3 w-3 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {l.pillar}
                </span>
                <span className="ml-auto font-mono text-[10px] text-primary">
                  {hiveToTierBadge(l.hiveScore)}
                </span>
              </div>
              <h3 className="font-display font-bold text-base mb-1 line-clamp-2">
                {l.title}
              </h3>
              <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-3">
                {l.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary flex items-center gap-1">
                  <Coins className="h-3 w-3" />{" "}
                  {formatPriceUsd(l.priceCredits)}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  HIVE {l.hiveScore}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
