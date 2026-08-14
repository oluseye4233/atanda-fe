import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Coins,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Gauge,
  Tag,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { CC_PILLARS, formatPriceUsd } from "@/lib/sphinx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SpcTaxonomyPanel } from "@/components/marketplace/SpcTaxonomyPanel";
import { TierBadge, CategoryChip, PillarBadge, GradeChip } from "./badges";
import { PerfBars } from "./PerfBars";
import { AiAnalysisPanel } from "./AiAnalysisPanel";
import type { AuthUser } from "@/types/auth";
import type { SpcListing, PurchaseResponse } from "@/types/sphinx";

const DETAIL_TABS = ["overview", "pillars", "tests"] as const;
type DetailTab = (typeof DETAIL_TABS)[number];

function TabStub({ id, label }: { id: string; label: string }) {
  return (
    <div
      className="glass-card p-10 rounded-xl border border-white/10 text-center"
      data-testid={`stub-${id}`}
    >
      <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
      <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
        {label} — Coming in next phase
      </p>
      <p className="font-mono text-[11px] text-muted-foreground/70 mt-2">
        This surface arrives with the synergy + synthesis rollout.
      </p>
    </div>
  );
}

export function ListingDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<SpcListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [outcome, setOutcome] = useState<PurchaseResponse | null>(null);
  const [tab, setTab] = useState<DetailTab>("overview");

  // Hash-based deep links (e.g. /marketplace/abc#pillars).
  useEffect(() => {
    const sync = () => {
      const raw = window.location.hash.replace("#", "").toLowerCase();
      if (DETAIL_TABS.includes(raw as DetailTab)) setTab(raw as DetailTab);
      else setTab("overview");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id]);

  const setTabAndHash = (next: string) => {
    const t = (DETAIL_TABS as readonly string[]).includes(next)
      ? (next as DetailTab)
      : "overview";
    setTab(t);
    if (t === "overview") {
      history.replaceState(null, "", window.location.pathname);
    } else {
      history.replaceState(null, "", `${window.location.pathname}#${t}`);
    }
  };

  useEffect(() => {
    let active = true;
    sphinxService
      .listListings()
      .then((r) => {
        if (!active) return;
        const found = r.data.data.find((l) => l.id === id);
        if (found) setListing(found);
        else setError("Listing not found.");
      })
      .catch((e: unknown) => {
        if (active) setError(getApiErrorMessage(e, "Failed to load."));
      });
    return () => {
      active = false;
    };
  }, [id]);

  const isOwnListing = user?.id === listing?.creatorUserId;
  const userPlan = (user as AuthUser | null)?.subscriptionPlan as
    | string
    | undefined;
  const isPro =
    userPlan === "INDIVIDUAL_PRO" ||
    userPlan === "SCHOOL_STUDENT" ||
    userPlan === "ENTERPRISE";

  const handlePurchase = async () => {
    if (!user || !listing) return;
    setPurchasing(true);
    setError(null);
    try {
      const result = await sphinxService.purchaseListing(listing.id);
      setOutcome(result.data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Purchase failed."));
    } finally {
      setPurchasing(false);
    }
  };

  if (error && !listing) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Link
          to="/marketplace"
          className="font-mono text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
        <div className="glass-card p-6 rounded-xl border border-destructive/30 mt-6 font-mono text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/marketplace"
        className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary inline-flex items-center gap-2"
        data-testid="link-back-marketplace"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      {/* Header card */}
      <div className="glass-card p-6 md:p-8 rounded-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge hive={listing.hiveScore} size="lg" />
              <CategoryChip pillar={listing.pillar ?? ""} />
              <PillarBadge pillar={listing.pillar ?? ""} />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10">
                {listing.status}
              </span>
            </div>
            <h1
              className="text-3xl font-display font-bold text-white leading-tight"
              data-testid="text-listing-title"
            >
              {listing.title}
            </h1>
            <p
              className="text-muted-foreground font-mono text-sm"
              data-testid="text-listing-description"
            >
              {listing.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <GradeChip hive={listing.hiveScore} size="lg" />
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-400/10 border border-amber-400/30">
              <Coins className="h-5 w-5 text-amber-400" />
              <span
                className="font-mono text-lg font-bold text-amber-400"
                data-testid="text-listing-price"
              >
                {formatPriceUsd(listing.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-tab layout */}
      <Tabs value={tab} onValueChange={setTabAndHash} className="space-y-5">
        <TabsList
          className="w-full grid grid-cols-2 md:grid-cols-3 h-auto bg-black/40 border border-white/10 rounded-lg p-1 gap-1"
          data-testid="tabs-detail"
        >
          {DETAIL_TABS.map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              data-testid={`tab-${t}`}
              className="font-mono text-[11px] uppercase tracking-wider py-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 rounded-lg border border-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
                HIVE Score
              </div>
              <div
                className="font-mono text-2xl font-bold text-blue-400"
                data-testid="text-hive-score"
              >
                {Math.round(listing.hiveScore)}
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg border border-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
                KCSE
              </div>
              <div
                className="font-mono text-2xl font-bold text-secondary"
                data-testid="text-kcse-score"
              >
                {Math.round(listing.kcseScore * 10) / 10}
              </div>
            </div>
          </div>

          <SpcTaxonomyPanel
            data={{
              pillar: listing.pillar ?? "",
              hiveScore: listing.hiveScore,
              kcseScore: listing.kcseScore,
              priceCredits: listing.price,
              salesCount: 0,
              bodyLength: listing.body?.length ?? 0,
            }}
            locked
          />

          {error && (
            <div
              className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive flex items-center gap-2"
              data-testid="text-purchase-error"
            >
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}

          {outcome && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-secondary/30 bg-secondary/5 space-y-2"
              data-testid="text-purchase-success"
            >
              <div className="flex items-center gap-2 text-secondary font-mono text-sm">
                <CheckCircle2 className="h-4 w-4" /> Purchase complete — full
                prompt unlocked.
              </div>
              <div className="text-xs text-muted-foreground font-mono space-y-1">
                <div>
                  Price:{" "}
                  <span className="text-white">
                    {formatPriceUsd(outcome.price)}
                  </span>
                </div>
                <div>
                  Creator share:{" "}
                  <span className="text-white">
                    {formatPriceUsd(outcome.creatorShare)}
                  </span>{" "}
                  · Platform share:{" "}
                  <span className="text-white">
                    {formatPriceUsd(outcome.platformShare)}
                  </span>
                </div>
                {outcome.isFirstSaleForCreator && (
                  <div className="text-secondary">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    First sale for this creator — JST Talent boost applied.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!user && (
            <div className="p-4 rounded-lg border border-white/10 bg-white/5 font-mono text-sm text-muted-foreground text-center">
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>{" "}
              to purchase this SPC.
            </div>
          )}

          {user && !isOwnListing && !outcome && (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              data-testid="button-purchase-spc"
              className="w-full px-6 py-4 rounded-lg font-mono text-sm uppercase tracking-wider transition-all bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {purchasing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Coins className="h-4 w-4" />
              )}
              {purchasing
                ? "Processing…"
                : `Purchase for ${formatPriceUsd(listing.price)}`}
            </button>
          )}

          {user && isOwnListing && (
            <div
              className="p-4 rounded-lg border border-amber-400/20 bg-amber-400/5 font-mono text-xs text-amber-400 text-center"
              data-testid="text-own-listing"
            >
              This is your listing — you can't buy it.
            </div>
          )}
        </TabsContent>

        {/* Pillars */}
        <TabsContent value="pillars" className="space-y-5">
          <div
            className="glass-card rounded-xl border border-white/10 p-5 space-y-4"
            data-testid="panel-perf-bars"
          >
            <div>
              <h3 className="font-display font-bold text-base text-white tracking-wider uppercase flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" /> Performance Metrics
              </h3>
              <p className="font-mono text-[11px] text-muted-foreground mt-1">
                Derived live from HIVE, KCSE, and prompt length. No data is
                stored.
              </p>
            </div>
            <PerfBars listing={listing} />
          </div>

          <div
            className="glass-card rounded-xl border border-white/10 p-5 space-y-3"
            data-testid="panel-pillar-focus"
          >
            <h3 className="font-display font-bold text-base text-white tracking-wider uppercase flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> Primary Pillar
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {CC_PILLARS.map((p) => (
                <span
                  key={p}
                  data-testid={`chip-pillar-${p.toLowerCase()}`}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider border ${
                    p === listing.pillar
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-white/5 text-muted-foreground border-white/10"
                  }`}
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              This card slots into the{" "}
              <span className="text-primary">{listing.pillar}</span> pillar of
              the Context-Craft framework. AI analysis below grades every pillar
              individually.
            </p>
          </div>

          <AiAnalysisPanel listing={listing} isPro={isPro} />
        </TabsContent>

        <TabsContent value="tests">
          <TabStub id="tests" label="Tests" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
