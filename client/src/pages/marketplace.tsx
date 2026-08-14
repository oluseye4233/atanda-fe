import { useEffect, useMemo, useState } from "react";
import NotFound from "@/pages/not-found";
import { Link, useMatch } from "react-router-dom";
import { ShoppingBag, Plus, Lock, Loader2, Search } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  ALL_CARD_PILLARS,
  CERT_LEVEL_RANK,
  SPC_MIN_CERT_TO_PUBLISH,
  SPC_CREATOR_SHARE_PCT,
  SPC_PLATFORM_SHARE_PCT,
  MARKETPLACE_CATEGORIES,
  type ContextCraftLevel,
} from "@/lib/sphinx";
import type { SpcListing } from "@/types/sphinx";
import { MatrixListingCard } from "@/components/marketplace/MatrixListingCard";
import { FilterChipRow } from "@/components/marketplace/FilterChipRow";
import { ListingDetail } from "@/components/marketplace/ListingDetail";
import { PublishPage } from "@/components/marketplace/PublishPage";

const CATEGORY_FILTER = ["All", ...MARKETPLACE_CATEGORIES] as const;
const DISC_FILTER = [
  "All",
  "Discovery",
  "Build",
  "Optimize",
  "Scale",
  "Defend",
  "Govern",
] as const;
const RARITY_FILTER = [
  "All",
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
] as const;
const VERSION_FILTER = ["All", "v1", "v2", "v3"] as const;
const TIER_FILTER = ["All", "ULTRA", "PREMIUM", "STANDARD"] as const;
const PILLAR_FILTER = ["All", ...ALL_CARD_PILLARS] as const;

function ListingsList() {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>("All");
  const [disc, setDisc] = useState<string>("All");
  const [rarity, setRarity] = useState<string>("All");
  const [version, setVersion] = useState<string>("All");
  const [tier, setTier] = useState<string>("All");
  const [pillar, setPillar] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [listings, setListings] = useState<SpcListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce free-text search so we don't hammer the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setListings(null);
    setError(null);
    sphinxService
      .listListings()
      .then((r) => {
        if (active) setListings(r.data.data);
      })
      .catch((e: unknown) => {
        if (active)
          setError(getApiErrorMessage(e, "Failed to load listings."));
      });
    return () => {
      active = false;
    };
  }, []);

  const canPublish = useMemo(() => {
    const level = (user?.contextCraftCertLevel as ContextCraftLevel) || "NONE";
    return CERT_LEVEL_RANK[level] >= CERT_LEVEL_RANK[SPC_MIN_CERT_TO_PUBLISH];
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-7 w-7 text-primary" />
            <h1
              className="text-3xl font-display font-bold text-primary tracking-widest uppercase"
              data-testid="text-marketplace-title"
            >
              SPHINX Marketplace
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm">
            SUPER PROMPT CARDS // CREATOR/PLATFORM SPLIT {SPC_CREATOR_SHARE_PCT}
            /{SPC_PLATFORM_SHARE_PCT}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/marketplace/publish">
            <button
              data-testid="button-publish-spc"
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all hover:scale-[1.02] bg-primary/10 text-primary border border-primary/30"
            >
              {canPublish ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Publish SPC
            </button>
          </Link>
        </div>
      </div>

      {/* Free-text search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          data-testid="input-search-listings"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or description…"
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white font-mono text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Category chips (M19) */}
      <div className="flex flex-wrap gap-2" data-testid="filter-category-row">
        {CATEGORY_FILTER.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              data-testid={`filter-category-${c.toLowerCase()}`}
              className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all border ${
                active
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* M3 — full 6-dim taxonomy filter rail (tier · disc · rarity · pillar · version). Category sits in its own chip row above. */}
      <div className="space-y-2" data-testid="filter-six-dim-row">
        <FilterChipRow
          label="Tier"
          testGroup="tier"
          options={TIER_FILTER as readonly string[]}
          value={tier}
          onChange={setTier}
        />
        <FilterChipRow
          label="Discipline"
          testGroup="disc"
          options={DISC_FILTER as readonly string[]}
          value={disc}
          onChange={setDisc}
        />
        <FilterChipRow
          label="Rarity"
          testGroup="rarity"
          options={RARITY_FILTER as readonly string[]}
          value={rarity}
          onChange={setRarity}
        />
        <FilterChipRow
          label="Pillar"
          testGroup="pillar"
          options={PILLAR_FILTER as readonly string[]}
          value={pillar}
          onChange={setPillar}
        />
        <FilterChipRow
          label="Version"
          testGroup="version"
          options={VERSION_FILTER as readonly string[]}
          value={version}
          onChange={setVersion}
        />
      </div>

      {error && (
        <div className="glass-card p-4 rounded-xl border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive">
          {error}
        </div>
      )}

      {listings === null && !error && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {listings && listings.length === 0 && (
        <div
          className="glass-card p-8 rounded-xl text-center"
          data-testid="text-empty-listings"
        >
          <p className="font-mono text-sm text-muted-foreground uppercase">
            No listings match this filter yet.
          </p>
        </div>
      )}

      {listings && listings.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          data-testid="grid-listings"
        >
          {listings.map((l) => (
            <MatrixListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  const matchDetail = useMatch("/marketplace/:id");
  const paramsDetail = matchDetail?.params as { id: string } | undefined;
  const matchPublish = useMatch("/marketplace/publish");

  if (matchPublish) return <PublishPage />;
  if (matchDetail && paramsDetail) {
    if (paramsDetail.id === "publish") return <PublishPage />;
    return <ListingDetail id={paramsDetail.id} />;
  }
  return <ListingsList />;
}
