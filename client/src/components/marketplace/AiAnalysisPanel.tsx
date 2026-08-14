import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { GradeChip } from "./badges";
import type { SpcListing, HiveAnalysis } from "@/types/sphinx";

export function AiAnalysisPanel({
  listing,
  isPro,
}: {
  listing: SpcListing;
  isPro: boolean;
}) {
  const [analysis, setAnalysis] = useState<HiveAnalysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await sphinxService.analyzeListing(listing.id);
      setAnalysis(result.data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Analysis failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="glass-card rounded-xl border border-primary/20 p-5 space-y-4"
      data-testid="panel-ai-analysis"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-base text-white tracking-wider uppercase flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Analysis
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground mt-1">
            Claude-graded letter score + per-pillar improvements. Cached 24h per
            listing.
          </p>
        </div>
        {analysis && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
              analysis.cached
                ? "bg-secondary/10 text-secondary border-secondary/30"
                : "bg-primary/10 text-primary border-primary/30"
            }`}
            data-testid="badge-analysis-source"
          >
            {analysis.cached ? "Cached" : "Fresh"}
          </span>
        )}
      </div>

      {!isPro && !analysis && (
        <div
          className="p-3 rounded-lg border border-amber-400/30 bg-amber-400/5 font-mono text-xs text-amber-400 flex items-start gap-2"
          data-testid="text-ai-pro-gate"
        >
          <Lock className="h-4 w-4 mt-0.5" />
          <span>
            AI Analysis requires{" "}
            <span className="font-bold">Individual Pro</span>, School/Student,
            or Enterprise.{" "}
            <Link
              to="/subscription"
              data-testid="link-upgrade-from-ai-gate"
              className="underline hover:text-amber-300"
            >
              View plans →
            </Link>
          </span>
        </div>
      )}

      {error && (
        <div
          className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 font-mono text-xs text-destructive flex items-center gap-2"
          data-testid="text-ai-error"
        >
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {!analysis && (
        <button
          onClick={run}
          disabled={!isPro || busy}
          data-testid="button-run-ai-analysis"
          className="w-full px-5 py-3 rounded-lg font-mono text-xs uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {busy ? "Analyzing…" : "Run AI Analysis"}
        </button>
      )}

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <GradeChip hive={analysis.hiveScore} size="lg" />
            <div className="flex-1">
              <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
                Quality Grade
              </div>
              <div className="font-mono text-sm text-white">
                HIVE{" "}
                <span className="font-bold">
                  {Math.round(analysis.hiveScore)}
                </span>{" "}
                · Letter{" "}
                <span
                  style={{ color: analysis.letterGradeColor }}
                  className="font-bold"
                >
                  {analysis.letterGrade}
                </span>
              </div>
            </div>
            <button
              onClick={run}
              disabled={busy}
              data-testid="button-rerun-ai-analysis"
              className="px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10 hover:text-primary hover:border-primary/40 disabled:opacity-40 transition-all"
            >
              Re-run
            </button>
          </div>

          <div className="space-y-2" data-testid="list-pillar-suggestions">
            <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
              Per-Pillar Suggestions
            </div>
            {analysis.pillarSuggestions.map((s) => (
              <div
                key={s.pillar}
                className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-2"
                data-testid={`row-pillar-${s.pillar.toLowerCase()}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                    {s.pillar}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {s.suggestion}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
