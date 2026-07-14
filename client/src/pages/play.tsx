import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ccgeService } from "@/services/ccge.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Coins,
  Zap,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  Crown,
  Target,
} from "lucide-react";
import { CcgeCard } from "@/components/play/CcgeCard";
import { FlippableCard } from "@/components/ui/flippable-card";
import type { CcgeCard as CcgeCardType, CcgeScenario, FinishSessionResponse } from "@/types/ccge";

// Short rationale per pillar shown on the back face of scenario cards so
// players know WHY the scenario targets them. Sourced from the same KCSE
// framing used by CcgeCard back faces.
const PILLAR_RATIONALE: Record<string, string> = {
  System: "Sets the AI's operating frame and guardrails.",
  Role: "Establishes persona, voice, and authority.",
  Instruction: "Spells out the task and required steps.",
  Example: "Anchors the model with a worked precedent.",
  Constraint: "Bounds the response (length, tone, policy).",
  Format: "Pins the output structure and schema.",
  Data: "Injects domain context and grounding.",
  SuperPrompt: "Composite play covering all four KCSE context types.",
};

const TIER_REWARD: Record<string, string> = {
  Bronze: "Foundation pass — earns Bronze certification at JCSE 30+.",
  Silver: "Solid prompt craft — Silver certification unlocks at JCSE 36+.",
  Gold: "Senior tier — Gold certification gates SPHINX publishing (JCSE 43+).",
  Platinum: "Apex tier — Platinum certification at JCSE 48+ marks top 1%.",
};

const TIER_COLORS: Record<string, string> = {
  Bronze: "from-amber-700 to-orange-600",
  Silver: "from-slate-400 to-slate-300",
  Gold: "from-yellow-500 to-amber-400",
  Platinum: "from-cyan-300 to-fuchsia-400",
};

const TIER_BORDER: Record<string, string> = {
  Bronze: "border-amber-600/40",
  Silver: "border-slate-400/40",
  Gold: "border-yellow-500/50",
  Platinum: "border-fuchsia-400/60",
};

const PILLAR_COLORS: Record<string, string> = {
  System: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
  Role: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40",
  Instruction: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  Example: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  Constraint: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  Format: "bg-violet-500/15 text-violet-300 border-violet-500/40",
  Data: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  SuperPrompt: "bg-gradient-to-br from-yellow-400/20 to-fuchsia-500/20 text-yellow-200 border-yellow-400/50",
};

// Local session shape assembled client-side from the documented
// POST /v1/ccge/sessions response (sessionId, scenarioId, dealtCardIds) plus
// the played-card selections tracked while the round is in progress. The
// real backend has no `hand`/`status`/`customCardName` fields on the session
// object itself — those live on the finish response instead.
type ActiveSession = {
  id: string;
  scenarioId: string;
  dealtCardIds: string[];
};

export default function PlayPage() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<CcgeScenario[]>([]);
  const [cards, setCards] = useState<CcgeCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [activeScenario, setActiveScenario] = useState<CcgeScenario | null>(null);
  const [played, setPlayed] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FinishSessionResponse | null>(null);
  const [stage, setStage] = useState<"select" | "design">("select");
  const [cardName, setCardName] = useState("");
  const [cardBody, setCardBody] = useState("");
  const [designError, setDesignError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("All");

  const cardMap = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([ccgeService.getScenarios(), ccgeService.getCards()])
      .then(([s, c]) => {
        if (cancelled) return;
        setScenarios(s.data.data);
        setCards(c.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Couldn't load CCGE scenarios."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = async (scenarioId: string) => {
    if (!user?.id) {
      setError("Please log in to start a session.");
      return;
    }
    setError(null);
    try {
      const { data } = await ccgeService.startSession(scenarioId);
      const scenario = scenarios.find((s) => s.id === data.scenarioId) ?? null;
      setSession({ id: data.sessionId, scenarioId: data.scenarioId, dealtCardIds: data.dealtCardIds });
      setActiveScenario(scenario);
      setPlayed([]);
      setResult(null);
      setStage("select");
      setCardName("");
      setCardBody("");
      setDesignError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't start this session."));
    }
  };

  const playCard = (id: string) => {
    if (played.includes(id)) return;
    if (played.length >= 5) return;
    setPlayed([...played, id]);
  };

  const removePlayed = (id: string) => {
    setPlayed(played.filter((p) => p !== id));
  };

  const advanceToDesign = () => {
    if (played.length === 0) return;
    setError(null);
    setStage("design");
  };

  const submitSession = async () => {
    if (!session || played.length === 0) return;
    const name = cardName.trim();
    const body = cardBody.trim();
    if (name.length < 2) {
      setDesignError("Give your card a name (at least 2 characters).");
      return;
    }
    if (body.length < 10) {
      setDesignError("Write a prompt of at least 10 characters.");
      return;
    }
    setDesignError(null);
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await ccgeService.finishSession(session.id, {
        playedCardIds: played,
        customCard: { name, body },
      });
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't score this session."));
    } finally {
      setSubmitting(false);
    }
  };

  const resetToLobby = () => {
    setSession(null);
    setActiveScenario(null);
    setPlayed([]);
    setResult(null);
    setError(null);
    setStage("select");
    setCardName("");
    setCardBody("");
    setDesignError(null);
  };

  const tokensUsed = played.reduce((sum, id) => sum + (cardMap.get(id)?.tokenCost ?? 0), 0);
  const filteredScenarios = tierFilter === "All" ? scenarios : scenarios.filter((s) => s.tier === tierFilter);

  // ─── RESULT VIEW ─────────────────────────────────────
  if (result) {
    const { breakdown, tier, flywheel } = result;
    const tierClass = tier ? TIER_BORDER[tier] : "border-muted-foreground/30";
    return (
      <div className="max-w-5xl mx-auto space-y-6" data-testid="ccge-result-view">
        <div className={cn("glass-card border-2 p-8 rounded-xl", tierClass)}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Trophy className="h-12 w-12 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">JCSE Final Score</p>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary tabular-nums" data-testid="text-jcse-score">{breakdown.final}</h1>
                <p className="text-sm text-muted-foreground mt-1">out of 50.0</p>
              </div>
            </div>
            <div className="text-right">
              {tier ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Tier Earned</p>
                  <div className={cn("inline-block px-4 py-2 rounded-md font-display text-2xl font-bold bg-gradient-to-br", TIER_COLORS[tier], "text-background")} data-testid="text-tier-earned">
                    {tier}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground font-mono text-sm">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Below Bronze threshold — try again
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flywheel impact */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-lg neon-border">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest font-mono">ARK Score Boost</span>
            </div>
            <div className="text-3xl font-display font-bold text-cyan-300 tabular-nums" data-testid="text-ark-delta">
              +{flywheel.arkScoreDelta}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {flywheel.newJstTotal !== null
                ? `New JST Total: ${flywheel.newJstTotal}`
                : "Run a CV assessment first to see your ARK Score update."}
            </p>
          </div>

          <div className={cn("glass-card p-5 rounded-lg", flywheel.certUpgradedTo ? "border-2 border-fuchsia-500/50" : "")}>
            <div className="flex items-center gap-2 text-fuchsia-400 mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest font-mono">Cert Upgrade</span>
            </div>
            {flywheel.certUpgradedTo ? (
              <>
                <div className="text-xl font-display font-bold text-fuchsia-300" data-testid="text-cert-upgrade">
                  {flywheel.certUpgradedFrom} → {flywheel.certUpgradedTo}
                </div>
                <p className="text-xs text-fuchsia-400/70 mt-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> JST multiplier increased
                </p>
              </>
            ) : (
              <>
                <div className="text-base text-muted-foreground font-mono">No upgrade this round</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Need JCSE ≥ 30 (Bronze), 36 (Silver), 43 (Gold), 48 (Platinum)
                </p>
              </>
            )}
          </div>

          <div className="glass-card p-5 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Coins className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest font-mono">Token Efficiency</span>
            </div>
            <div className="text-3xl font-display font-bold text-amber-300 tabular-nums">
              {breakdown.tokenUsed}<span className="text-base text-muted-foreground">/{breakdown.tokenBudget}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {breakdown.tokenUsed > breakdown.tokenBudget ? "Over budget — penalty applied" : "Within budget"}
            </p>
          </div>
        </div>

        {/* KCSE breakdown */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">KCSE Breakdown</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Knowledge", value: breakdown.knowledge, weight: "30%" },
              { label: "Clarity", value: breakdown.clarity, weight: "30%" },
              { label: "Specificity", value: breakdown.specificity, weight: "20%" },
              { label: "Efficiency", value: breakdown.efficiency, weight: "20%" },
            ].map((m) => (
              <div key={m.label} data-testid={`metric-${m.label.toLowerCase()}`}>
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>{m.label}</span>
                  <span>{m.weight}</span>
                </div>
                <div className="text-2xl font-display font-bold text-foreground tabular-nums mt-1">
                  {m.value}<span className="text-sm text-muted-foreground">/50</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${(m.value / 50) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Pillars Covered</p>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.pillarsCovered.length === 0 ? (
                  <span className="text-xs text-muted-foreground">None</span>
                ) : (
                  breakdown.pillarsCovered.map((p) => (
                    <Badge key={p} variant="outline" className={cn("font-mono text-[10px]", PILLAR_COLORS[p])}>
                      {p}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Synergies Triggered</p>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.synergies.length === 0 ? (
                  <span className="text-xs text-muted-foreground">None — try combining card types</span>
                ) : (
                  breakdown.synergies.map((s) => (
                    <Badge key={s.name} variant="outline" className="font-mono text-[10px] bg-secondary/10 text-secondary border-secondary/40">
                      {s.name} ×{s.multiplier}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Judge narrative (present only when useClaude was requested and allowed) */}
        {result.judge ? (
          <div className="glass-card p-6 rounded-xl" data-testid="card-judge-result">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">AI Judge Feedback</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{result.judge.narrative}</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1.5">Strengths</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {result.judge.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1.5">Weaknesses</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {result.judge.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex gap-3">
          <Button onClick={resetToLobby} className="flex-1" data-testid="button-back-to-lobby">
            <ArrowRight className="h-4 w-4 mr-2" />
            Back to Arena
          </Button>
          <Button variant="outline" onClick={() => activeScenario && startSession(activeScenario.id)} className="flex-1" data-testid="button-replay-scenario">
            Replay this scenario
          </Button>
        </div>
      </div>
    );
  }

  // ─── ACTIVE SESSION VIEW ─────────────────────────────
  if (session && activeScenario) {
    const handCards = session.dealtCardIds
      .map((id) => cardMap.get(id))
      .filter((c): c is CcgeCardType => !!c);
    const playedCards = played
      .map((id) => cardMap.get(id))
      .filter((c): c is CcgeCardType => !!c);

    // ─── CARD DESIGN STAGE (final stage before scoring) ───
    if (stage === "design") {
      return (
        <div className="max-w-4xl mx-auto space-y-6" data-testid="ccge-design-view">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Final Stage — Design Your Card
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Author your custom prompt</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Name your card and write the actual prompt (e.g. a SYSTEM prompt) for{" "}
              <span className="text-foreground font-medium">{activeScenario.title}</span>. This authored
              card is the final, scored artifact — craft it well.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mr-1">Target Pillars:</span>
              {activeScenario.targetPillars.map((p) => (
                <Badge key={p} variant="outline" className={cn("font-mono text-[10px]", PILLAR_COLORS[p])}>
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected cards reference */}
          <div className="glass-card p-5 rounded-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Your Selected Cards — {playedCards.length}
            </span>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3" data-testid="design-selected-cards">
              {playedCards.map((c, i) => (
                <CcgeCard key={c.id} card={c} variant="played" index={i + 1} />
              ))}
            </div>
          </div>

          {/* Authoring form */}
          <div className="glass-card p-6 rounded-xl space-y-5">
            <div>
              <label htmlFor="card-name" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Card Name
              </label>
              <input
                id="card-name"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                maxLength={80}
                placeholder="e.g. Compliance Sentinel"
                className="mt-2 w-full rounded-lg bg-background/60 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="input-card-name"
              />
            </div>
            <div>
              <label htmlFor="card-body" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Prompt
              </label>
              <textarea
                id="card-body"
                value={cardBody}
                onChange={(e) => setCardBody(e.target.value)}
                maxLength={4000}
                rows={10}
                placeholder="You are a... Your role is to... Constraints:... Output format:..."
                className="mt-2 w-full rounded-lg bg-background/60 border border-border px-3 py-2 text-sm text-foreground font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                data-testid="input-card-body"
              />
              <div className="text-[10px] font-mono text-muted-foreground mt-1 text-right" data-testid="text-card-body-count">
                {cardBody.trim().length}/4000
              </div>
            </div>

            {designError && (
              <div className="text-sm text-destructive flex items-center gap-2" data-testid="text-design-error">
                <AlertCircle className="h-4 w-4" /> {designError}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setStage("select"); setDesignError(null); }}
                disabled={submitting}
                className="flex-1"
                data-testid="button-back-to-select"
              >
                Back to Cards
              </Button>
              <Button
                onClick={submitSession}
                disabled={submitting}
                className="flex-1"
                data-testid="button-submit-session"
              >
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Submit & Score Card
              </Button>
            </div>
          </div>

          {error && (
            <div className="glass-card p-4 rounded-lg border border-destructive/40 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto space-y-6" data-testid="ccge-session-view">
        {/* Scenario header */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("font-display", `bg-gradient-to-br ${TIER_COLORS[activeScenario.tier]} text-background`)}>
                  {activeScenario.tier}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  Difficulty {activeScenario.difficulty}/5
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground" data-testid="text-scenario-title">{activeScenario.title}</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{activeScenario.prompt}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mr-1">Target Pillars:</span>
                {activeScenario.targetPillars.map((p) => (
                  <Badge key={p} variant="outline" className={cn("font-mono text-[10px]", PILLAR_COLORS[p])}>
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Token Budget</div>
              <div className={cn("text-3xl font-display font-bold tabular-nums", tokensUsed > activeScenario.tokenBudget ? "text-destructive" : "text-amber-400")}>
                {tokensUsed}<span className="text-base text-muted-foreground">/{activeScenario.tokenBudget}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetToLobby} className="mt-2 text-xs" data-testid="button-abandon-session">
                Abandon
              </Button>
            </div>
          </div>
        </div>

        {/* Played slot */}
        <div className="glass-card p-6 rounded-xl border-2 border-dashed border-primary/30 min-h-[180px]">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Played Stack — {played.length}/5 cards
            </span>
          </div>
          {playedCards.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic">Click a card from your hand to play it into your prompt. Tap the eye icon to reveal the underlying prompt.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {playedCards.map((c, i) => (
                <CcgeCard
                  key={c.id}
                  card={c}
                  variant="played"
                  index={i + 1}
                  onRemove={() => removePlayed(c.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Hand */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Your Hand</span>
            <Button
              onClick={advanceToDesign}
              disabled={played.length === 0}
              data-testid="button-advance-to-design"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Next: Design Your Card
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {handCards.map((c) => {
              const isPlayed = played.includes(c.id);
              const handFull = played.length >= 5;
              return (
                <CcgeCard
                  key={c.id}
                  card={c}
                  variant="hand"
                  disabled={isPlayed || handFull}
                  onPlay={() => playCard(c.id)}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <div className="glass-card p-4 rounded-lg border border-destructive/40 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
      </div>
    );
  }

  // ─── LOBBY VIEW ───────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="ccge-lobby-view">
      <div className="glass-card p-6 rounded-xl neon-border">
        <div className="flex items-center gap-3 mb-3">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-display font-bold tracking-wide text-primary">CCGE Arena</h1>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The <span className="text-foreground font-semibold">Context Craft Game Engine</span> measures your AI engineering skill in real time.
          Pick a scenario, play prompt-engineering cards from your hand, score JCSE 30+ to earn certifications, and watch your ARK Score climb.
        </p>
        <div className="grid sm:grid-cols-4 gap-3 mt-5">
          <div className="text-center p-3 rounded-lg bg-amber-700/10 border border-amber-600/40">
            <Crown className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <div className="font-display text-amber-400 text-sm">Bronze</div>
            <div className="text-[10px] font-mono text-muted-foreground">JCSE 30–35</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-400/10 border border-slate-400/40">
            <Crown className="h-5 w-5 mx-auto text-slate-300 mb-1" />
            <div className="font-display text-slate-300 text-sm">Silver</div>
            <div className="text-[10px] font-mono text-muted-foreground">JCSE 36–42</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40">
            <Crown className="h-5 w-5 mx-auto text-yellow-400 mb-1" />
            <div className="font-display text-yellow-300 text-sm">Gold</div>
            <div className="text-[10px] font-mono text-muted-foreground">JCSE 43–47</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/40">
            <Crown className="h-5 w-5 mx-auto text-fuchsia-400 mb-1" />
            <div className="font-display text-fuchsia-300 text-sm">Platinum</div>
            <div className="text-[10px] font-mono text-muted-foreground">JCSE 48–50</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-2">Filter Tier:</span>
        {["All", "Bronze", "Silver", "Gold", "Platinum"].map((t) => (
          <Button
            key={t}
            variant={tierFilter === t ? "default" : "outline"}
            size="sm"
            onClick={() => setTierFilter(t)}
            data-testid={`button-filter-${t.toLowerCase()}`}
          >
            {t}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading scenarios...
        </div>
      ) : error ? (
        <div className="glass-card p-6 rounded-xl border border-destructive/40 text-destructive">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="glass-card p-8 rounded-xl text-center text-muted-foreground">
          No scenarios for this tier yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredScenarios.map((s) => (
            <FlippableCard
              key={s.id}
              testId={`scenario-${s.id}`}
              minHeight="280px"
              flipLabel={`Reveal scoring rules for ${s.title}`}
              unflipLabel={`Hide scoring rules for ${s.title}`}
              faceClassName={cn("glass-card rounded-xl border-2 hover:border-primary/40 transition-all", TIER_BORDER[s.tier])}
              backFaceClassName={cn("glass-card rounded-xl border-2", TIER_BORDER[s.tier])}
              front={
                <div className="p-5 h-full flex flex-col" data-testid={`scenario-card-${s.id}`}>
                  <div className="flex items-center justify-between mb-2 pr-9">
                    <Badge className={cn("font-display", `bg-gradient-to-br ${TIER_COLORS[s.tier]} text-background`)}>
                      {s.tier}
                    </Badge>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Diff {s.difficulty}/5 · {s.tokenBudget}t budget
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground" data-testid={`scenario-title-${s.id}`}>{s.title}</h3>
                  <p className="text-sm text-muted-foreground my-3 flex-1 leading-relaxed">{s.prompt}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {s.targetPillars.map((p) => (
                      <Badge key={p} variant="outline" className={cn("font-mono text-[10px]", PILLAR_COLORS[p])}>
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <Button onClick={() => startSession(s.id)} disabled={!user} data-testid={`button-start-${s.id}`}>
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                </div>
              }
              back={
                <div className="p-5 h-full flex flex-col gap-3 pr-9" data-testid={`scenario-card-${s.id}-back`}>
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                      Scoring rules
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-foreground leading-tight">{s.title}</h3>
                  <div className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                    {TIER_REWARD[s.tier] ?? "Earn certification by passing the KCSE threshold."}
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-y-auto">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      Target pillars
                    </div>
                    {s.targetPillars.map((p) => (
                      <div key={p} className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className={cn("font-mono text-[9px] flex-shrink-0", PILLAR_COLORS[p])}>
                          {p}
                        </Badge>
                        <span className="text-white/70 leading-snug">
                          {PILLAR_RATIONALE[p] ?? "Required pillar for this scenario."}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/10">
                    <span className="text-muted-foreground">
                      Difficulty {s.difficulty}/5 · {s.tokenBudget}t budget
                    </span>
                    <Button
                      size="sm"
                      onClick={() => startSession(s.id)}
                      disabled={!user}
                      data-testid={`button-start-back-${s.id}`}
                      className="h-7 text-[10px]"
                    >
                      Start
                    </Button>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      {!user && (
        <div className="glass-card p-4 rounded-lg border border-amber-500/40 text-sm text-amber-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Please log in to play.
        </div>
      )}
    </div>
  );
}
