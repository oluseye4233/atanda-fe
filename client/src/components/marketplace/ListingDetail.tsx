import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Coins,
  User,
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
import { FEATURES } from "@shared/featureFlags";
import {
  CONTEXT_CRAFT_LEVELS,
  CC_PILLARS,
  formatPriceUsd,
  type ContextCraftLevel,
} from "@/lib/sphinx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SpcTaxonomyPanel } from "@/components/marketplace/SpcTaxonomyPanel";
import { TierBadge, CategoryChip, PillarBadge, GradeChip } from "./badges";
import { PerfBars } from "./PerfBars";
import { AiAnalysisPanel } from "./AiAnalysisPanel";
import { ComplementaryPairsTab } from "./ComplementaryPairsTab";
import { SynthesisTab } from "./SynthesisTab";
import { SpcFeedbackPanel } from "./SpcFeedbackPanel";
import type { AuthUser } from "@/types/auth";
import type {
  SpcListing,
  UserCredits,
  PurchaseResult,
} from "@/types/sphinx";

const DETAIL_TABS = [
  "overview",
  "pillars",
  "tests",
  "pairs",
  "synthesis",
] as const;
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
  const [data, setData] = useState<{
    listing: SpcListing & { bodyLocked?: boolean; bodyLength?: number };
    creator: { id: string; name: string; contextCraftCertLevel: string } | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [outcome, setOutcome] = useState<PurchaseResult | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
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
      .getListing(id, user?.id)
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((e: unknown) => {
        if (active) setError(getApiErrorMessage(e, "Failed to load."));
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
  }, [id, user]);

  const isOwnListing = user?.id === data?.listing.creatorId;
  const userPlan = (user as AuthUser | null)?.subscriptionPlan as
    | string
    | undefined;
  const isPro =
    userPlan === "INDIVIDUAL_PRO" ||
    userPlan === "SCHOOL_STUDENT" ||
    userPlan === "ENTERPRISE";

  const handlePurchase = async () => {
    if (!user || !data) return;
    setPurchasing(true);
    setError(null);
    try {
      const result = await sphinxService.purchaseListing(data.listing.id, user.id);
      setOutcome(result.data);
      setData((d) => (d ? { ...d, listing: result.data.listing } : d));
      const refreshed = await sphinxService.getCredits(user.id);
      setCredits(refreshed.data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Purchase failed."));
    } finally {
      setPurchasing(false);
    }
  };

  if (error && !data) {
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

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  const { listing, creator } = data;
  const creatorCert =
    (creator?.contextCraftCertLevel as ContextCraftLevel) || "NONE";
  const certInfo = CONTEXT_CRAFT_LEVELS[creatorCert];

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
              <CategoryChip pillar={listing.pillar} />
              <PillarBadge pillar={listing.pillar} />
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
                {formatPriceUsd(listing.priceCredits)}
              </span>
            </div>
          </div>
        </div>

        {creator && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">
                Creator
              </div>
              <div
                className="font-mono text-sm text-white"
                data-testid="text-creator-name"
              >
                {creator.name}
              </div>
            </div>
            <span
              className="px-2 py-1 rounded text-[10px] font-mono uppercase"
              style={{
                color: certInfo.color,
                backgroundColor: `${certInfo.color}15`,
                border: `1px solid ${certInfo.color}30`,
              }}
            >
              {certInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* 5-tab layout */}
      <Tabs value={tab} onValueChange={setTabAndHash} className="space-y-5">
        <TabsList
          className="w-full grid grid-cols-2 md:grid-cols-5 h-auto bg-black/40 border border-white/10 rounded-lg p-1 gap-1"
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
          <div className="grid grid-cols-3 gap-3">
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
            <div className="glass-card p-4 rounded-lg border border-white/5">
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground mb-1">
                Sales
              </div>
              <div
                className="font-mono text-2xl font-bold text-white"
                data-testid="text-sales-count"
              >
                {listing.salesCount}
              </div>
            </div>
          </div>

          {listing.bodyLocked !== false ? (
            <SpcTaxonomyPanel
              data={{
                pillar: listing.pillar,
                hiveScore: listing.hiveScore,
                kcseScore: listing.kcseScore,
                priceCredits: listing.priceCredits,
                salesCount: listing.salesCount,
                bodyLength: listing.bodyLength ?? 0,
                creatorCertLevel: creator?.contextCraftCertLevel,
              }}
              locked
            />
          ) : (
            <div>
              <h3 className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-3">
                Full Prompt — Unlocked
              </h3>
              <pre
                className="glass-card p-4 rounded-lg border border-secondary/30 text-xs text-white/90 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto"
                data-testid="text-listing-body"
              >
                {listing.body}
              </pre>
            </div>
          )}

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
              <div className="text-xs text-muted-foreground font-mono">
                Balance:{" "}
                <span className="text-white">
                  {formatPriceUsd(outcome.buyerBalance)}
                </span>{" "}
                remaining.
                {outcome.isFirstSaleForCreator && (
                  <span className="text-secondary ml-2">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    First sale for {creator?.name} — JST Talent +
                    {outcome.creatorTalentBoost}.
                  </span>
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
              disabled={
                purchasing ||
                (credits ? credits.balance < listing.priceCredits : false)
              }
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
                : credits && credits.balance < listing.priceCredits
                  ? `Need ${formatPriceUsd(listing.priceCredits - credits.balance)} more`
                  : `Purchase for ${formatPriceUsd(listing.priceCredits)}`}
            </button>
          )}

          {user && isOwnListing && (
            <div
              className="p-4 rounded-lg border border-amber-400/20 bg-amber-400/5 font-mono text-xs text-amber-400 text-center"
              data-testid="text-own-listing"
            >
              This is your listing — you can't buy it. Total earned:{" "}
              <span className="font-bold">
                {formatPriceUsd(listing.totalEarned)}
              </span>
              .
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
        <TabsContent value="pairs">
          <ComplementaryPairsTab listingId={listing.id} />
        </TabsContent>
        <TabsContent value="synthesis">
          <SynthesisTab listingId={listing.id} />
        </TabsContent>
      </Tabs>
      {FEATURES.corporateMarketplace && (
        <div data-testid="panel-feedback-section">
          <SpcFeedbackPanel listing={listing} viewer={user} />
        </div>
      )}
    </div>
  );
}
