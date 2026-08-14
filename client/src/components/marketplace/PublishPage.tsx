import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  Loader2,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  ALL_CARD_PILLARS,
  CONTEXT_CRAFT_LEVELS,
  CERT_LEVEL_RANK,
  SPC_MIN_CERT_TO_PUBLISH,
  SPC_PRICE_MIN,
  SPC_PRICE_MAX,
  SPC_CREATOR_SHARE_PCT,
  SPC_PLATFORM_SHARE_PCT,
  formatPriceUsd,
  suggestedPriceForHive,
  type ContextCraftLevel,
} from "@/lib/sphinx";
import type { HiveAnalysis, SpcScope } from "@/types/sphinx";
import { PricingMatrixBanner } from "./PricingMatrixBanner";
import { TierBadge, GradeChip } from "./badges";

export function PublishPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    body: "",
    pillar: "System" as string,
    priceCredits: 25,
    scope: "OPEN" as SpcScope,
  });
  const [precheck, setPrecheck] = useState<HiveAnalysis | null>(null);
  const [precheckBusy, setPrecheckBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const certLevel =
    (user?.contextCraftCertLevel as ContextCraftLevel) || "NONE";
  const allowed =
    CERT_LEVEL_RANK[certLevel] >= CERT_LEVEL_RANK[SPC_MIN_CERT_TO_PUBLISH];

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="font-mono text-sm text-muted-foreground uppercase">
          Please log in to publish a Super Prompt Card.
        </p>
        <Link
          to="/login"
          className="text-primary hover:underline font-mono text-xs uppercase mt-4 inline-block"
        >
          Go to login →
        </Link>
      </div>
    );
  }

  if (!allowed) {
    const required = CONTEXT_CRAFT_LEVELS[SPC_MIN_CERT_TO_PUBLISH];
    const current = CONTEXT_CRAFT_LEVELS[certLevel];
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6">
        <Link
          to="/marketplace"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
        <div
          className="glass-card p-8 rounded-xl border border-amber-400/30 bg-amber-400/5 text-center space-y-4"
          data-testid="text-cert-locked"
        >
          <ShieldAlert className="h-12 w-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-display font-bold text-amber-400 uppercase tracking-widest">
            Publishing Locked
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            SPHINX requires <span className="text-white">{required.label}</span>{" "}
            or higher to publish.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Your current level:{" "}
            <span style={{ color: current.color }}>{current.label}</span>
          </p>
          <Link to="/play">
            <button
              data-testid="button-go-ccge"
              className="px-5 py-3 rounded-lg font-mono text-xs uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/15 transition-all"
            >
              Win Gold in CCGE Arena →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const runPrecheck = async () => {
    setPrecheckBusy(true);
    setError(null);
    try {
      const result = await sphinxService.hivePrecheck({
        title: form.title,
        body: form.body,
        pillar: form.pillar,
      });
      setPrecheck(result.data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Pre-check failed."));
    } finally {
      setPrecheckBusy(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await sphinxService.createListing({
        title: form.title,
        description: form.description,
        body: form.body,
        pillar: form.pillar,
        price: form.priceCredits,
        hiveScore: precheck?.hiveScore ?? 0,
        kcseScore: 0,
        scope: form.scope,
      });
      navigate(`/marketplace/${result.data.id}`);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Publish failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const suggestion = precheck
    ? suggestedPriceForHive(precheck.hiveScore)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/marketplace"
        className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary inline-flex items-center gap-2"
        data-testid="link-back-from-publish"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div>
        <h1
          className="text-3xl font-display font-bold text-primary tracking-widest uppercase"
          data-testid="text-publish-title"
        >
          Publish Super Prompt Card
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-2">
          HIVE PRE-CHECK MUST PASS BEFORE LISTING GOES LIVE
        </p>
      </div>

      <PricingMatrixBanner />

      <div className="glass-card p-6 rounded-xl space-y-5">
        <div>
          <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-2">
            Title
          </label>
          <input
            data-testid="input-spc-title"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              setPrecheck(null);
            }}
            placeholder="e.g. Tier-1 Support Triage Architect"
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-2">
            Description
          </label>
          <input
            data-testid="input-spc-description"
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              setPrecheck(null);
            }}
            placeholder="Short summary buyers will see in the listings grid."
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-2">
              Pillar
            </label>
            <select
              data-testid="select-spc-pillar"
              value={form.pillar}
              onChange={(e) => {
                setForm({ ...form, pillar: e.target.value });
                setPrecheck(null);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
            >
              {ALL_CARD_PILLARS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-2">
              Price (credits, {SPC_PRICE_MIN}–{SPC_PRICE_MAX})
            </label>
            <input
              data-testid="input-spc-price"
              type="number"
              min={SPC_PRICE_MIN}
              max={SPC_PRICE_MAX}
              value={form.priceCredits}
              onChange={(e) =>
                setForm({
                  ...form,
                  priceCredits: Math.max(
                    SPC_PRICE_MIN,
                    Math.min(
                      SPC_PRICE_MAX,
                      parseInt(e.target.value) || SPC_PRICE_MIN,
                    ),
                  ),
                })
              }
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
            />
            <p
              className="text-[10px] font-mono text-muted-foreground mt-1"
              data-testid="text-publish-price-usd"
            >
              {formatPriceUsd(form.priceCredits)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">
              Prompt Body
            </label>
            <label
              data-testid="button-import-spc-file"
              className="text-[10px] uppercase font-mono tracking-widest text-primary/80 hover:text-primary cursor-pointer border border-primary/30 hover:border-primary/60 rounded px-2 py-1 transition-colors"
            >
              Import .md / .txt
              <input
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 200_000) {
                    setError(
                      `File too large (${Math.round(file.size / 1024)}KB). Max 200KB.`,
                    );
                    e.target.value = "";
                    return;
                  }
                  try {
                    const text = await file.text();
                    setForm((f) => ({ ...f, body: text.slice(0, 50000) }));
                    setPrecheck(null);
                    setError(null);
                  } catch (err: unknown) {
                    setError(getApiErrorMessage(err, "Failed to read file."));
                  } finally {
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>
          <textarea
            data-testid="input-spc-body"
            value={form.body}
            onChange={(e) => {
              setForm({ ...form, body: e.target.value });
              setPrecheck(null);
            }}
            placeholder="Full prompt — role, instructions, examples, constraints, format spec… or import a .md/.txt file above."
            rows={12}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-primary/50 leading-relaxed"
          />
          <p className="text-[10px] font-mono text-muted-foreground mt-1">
            {form.body.length.toLocaleString()} chars • min 80 / max 50,000
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={runPrecheck}
            disabled={precheckBusy || !form.title || !form.body}
            data-testid="button-run-precheck"
            className="px-5 py-3 rounded-lg font-mono text-xs uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/15 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {precheckBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Run HIVE Pre-Check
          </button>
          <button
            onClick={submit}
            disabled={submitting || !precheck}
            data-testid="button-publish-confirm"
            className="px-5 py-3 rounded-lg font-mono text-xs uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Publish Listing
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {precheck && (
          <div
            className="p-4 rounded-lg border border-secondary/30 bg-secondary/5 space-y-3"
            data-testid="text-precheck-result"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <div className="flex-1">
                <div className="font-mono text-sm text-white flex flex-wrap items-center gap-3">
                  HIVE:{" "}
                  <span className="font-bold" data-testid="text-precheck-hive">
                    {precheck.hiveScore}
                  </span>{" "}
                  / 100
                  <span
                    className="font-bold"
                    style={{ color: precheck.letterGradeColor }}
                    data-testid="text-precheck-grade"
                  >
                    {precheck.letterGrade}
                  </span>
                  <TierBadge hive={precheck.hiveScore} />
                  <GradeChip hive={precheck.hiveScore} />
                </div>
                <div className="text-xs font-mono mt-1 text-secondary">
                  Pre-check complete — ready to publish.
                </div>
                {suggestion && (
                  <div
                    className="text-[11px] font-mono text-muted-foreground mt-1"
                    data-testid="text-pricing-suggestion"
                  >
                    Suggested price band:{" "}
                    <span className="text-white font-bold">
                      {suggestion.suggestedMin}–{suggestion.suggestedMax} cr
                    </span>{" "}
                    <span className="text-muted-foreground/80">
                      — {suggestion.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <ul
              className="text-xs font-mono text-muted-foreground space-y-1"
              data-testid="list-precheck-suggestions"
            >
              {precheck.pillarSuggestions.map((s) => (
                <li key={s.pillar} className="flex gap-2">
                  <span className="text-muted-foreground/50">•</span>
                  <span>
                    <span className="text-white font-bold uppercase">
                      {s.pillar}
                    </span>
                    : {s.suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-[10px] font-mono text-muted-foreground border-t border-white/5 pt-3">
          Revenue split: {SPC_CREATOR_SHARE_PCT}% creator /{" "}
          {SPC_PLATFORM_SHARE_PCT}% platform. First sale grants +3 JST Talent.
        </div>
      </div>
    </div>
  );
}
