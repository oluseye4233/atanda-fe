import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { bookService } from "@/services/book.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { FEATURES } from "@shared/featureFlags";
import {
  JOURNEY_NODES,
  JOURNEY_STAGES,
  BOOK_TITLE,
  BOOK_TOTAL_NODES,
  type JourneyStageId,
} from "@shared/bookCompanion";
import { ChapterCard } from "@/components/book/ChapterCard";
import { LedgerPanel } from "@/components/book/LedgerPanel";
import { F1000BookBanner } from "@/components/book/F1000BookBanner";
import type { JourneyNodeView, LedgerView } from "@/types/book";

// Static node list (used logged-out). Mirrors the canonical shared model so the
// page renders the full journey before any per-user status is fetched.
const STATIC_NODES: JourneyNodeView[] = JOURNEY_NODES.map((n) => ({
  id: n.id,
  order: n.order,
  stage: n.stage,
  chapterLabel: n.chapterLabel,
  title: n.title,
  pillar: n.pillar,
  badge: n.badge,
  ccLevel: n.ccLevel,
  tierArt: n.tierArt,
  slug: n.slug,
  deepLink: n.deepLink,
  quest: [...n.quest],
  earned: false,
  earnedAt: null,
  earnedVia: null,
}));

export default function BookCompanionPage() {
  const { user, isAuthenticated } = useAuth();
  const [nodes, setNodes] = useState<JourneyNodeView[]>(STATIC_NODES);
  const [earnedCount, setEarnedCount] = useState(0);
  const [ledger, setLedger] = useState<LedgerView | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const highlightId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("book");
  }, []);

  const loadJourney = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [j, l] = await Promise.all([
        bookService.getJourney().then((r) => r.data),
        bookService.getLedger().then((r) => r.data),
      ]);
      setNodes(j.nodes);
      setEarnedCount(j.earnedCount);
      setLedger(l);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJourney();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const captureFinal = async () => {
    setCapturing(true);
    setError(null);
    try {
      const { ledger: l } = (await bookService.captureSnapshot({ kind: "final" })).data;
      setLedger(l);
      await loadJourney();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCapturing(false);
    }
  };

  const nodesByStage = useMemo(() => {
    const map = new Map<JourneyStageId, JourneyNodeView[]>();
    for (const s of JOURNEY_STAGES) map.set(s.id, []);
    for (const n of [...nodes].sort((a, b) => a.order - b.order)) {
      const arr = map.get(n.stage as JourneyStageId);
      if (arr) arr.push(n);
    }
    return map;
  }, [nodes]);

  const progressPct = Math.round((earnedCount / BOOK_TOTAL_NODES) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
              Book Companion
            </h2>
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            {BOOK_TITLE} · {BOOK_TOTAL_NODES} chapters → real ARK surfaces
          </p>
        </div>
        {isAuthenticated && (
          <div className="text-right">
            <div className="font-display text-3xl font-black text-primary neon-text leading-none" data-testid="text-progress-count">
              {earnedCount}/{BOOK_TOTAL_NODES}
            </div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              Badges Earned
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="glass-card border border-destructive/40 rounded-lg p-4 text-destructive font-mono text-sm" data-testid="text-book-error">
          {error}
        </div>
      )}

      {FEATURES.f1000Promo && <F1000BookBanner />}

      {/* Logged-out banner */}
      {!isAuthenticated && (
        <div className="glass-card border border-primary/40 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-testid="banner-login">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-white font-display font-bold">Scan a chapter QR or log in to track your journey.</p>
              <p className="text-muted-foreground text-sm mt-1">
                Every chapter maps to a real challenge in the platform. Badges are earned by doing the work — never self-marked.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-primary text-black font-mono text-xs uppercase tracking-widest h-10 px-5 rounded-md"
            data-testid="link-login"
          >
            Log In
          </Link>
        </div>
      )}

      {/* Progress bar */}
      {isAuthenticated && (
        <div className="glass-card border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Journey Progress</span>
            <span className="font-mono text-sm text-primary">{progressPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-secondary to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      )}

      {/* Digital Ledger */}
      {isAuthenticated && ledger && (
        <LedgerPanel ledger={ledger} capturing={capturing} onCaptureFinal={captureFinal} />
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground font-mono text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading your journey…
        </div>
      )}

      {/* Stages */}
      {JOURNEY_STAGES.map((stage) => {
        const stageNodes = nodesByStage.get(stage.id) ?? [];
        if (stageNodes.length === 0) return null;
        return (
          <section key={stage.id} className="space-y-4" data-testid={`stage-${stage.id}`}>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h3 className="font-display font-bold text-xl text-white uppercase tracking-widest">{stage.label}</h3>
              <p className="text-muted-foreground text-sm">{stage.blurb}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stageNodes.map((n) => (
                <ChapterCard key={n.id} node={n} highlight={highlightId === n.id} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
