import React, { useState } from "react";
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
import { DemoHelperCallout } from "@/components/demo/DemoHelperCallout";
import { FlippableCard } from "@/components/ui/flippable-card";

// Mock Scenarios for Demo
const DEMO_SCENARIOS = [
  {
    id: "scen-1",
    title: "SOC-2 Audit Response Drafter",
    tier: "Gold" as const,
    industry: "FinTech / Compliance",
    difficulty: 4,
    prompt:
      "A client is requesting your company's full data-retention policy as part of their vendor security review. Draft a polite, complete, accurate response that cites the right policy sections without leaking internal infrastructure details.",
    targetPillars: ["P1: System", "P3: Instruction", "P5: Constraint"],
    tokenBudget: 600,
    hand: [
      { id: "c1", name: "System Persona", cost: 120, type: "System" },
      { id: "c2", name: "Formal Tone Guard", cost: 80, type: "Constraint" },
      { id: "c3", name: "Reference Policy PDF", cost: 200, type: "Data" },
      { id: "c4", name: "RFP Output Schema", cost: 150, type: "Format" },
      { id: "c5", name: "Few-Shot Precedent", cost: 130, type: "Example" },
    ],
  },
  {
    id: "scen-2",
    title: "Cardiology Discharge Note Synthesizer",
    tier: "Platinum" as const,
    industry: "Healthcare / EHR",
    difficulty: 5,
    prompt:
      "Convert raw cardiology EHR fragments into a patient-friendly summary. You must strictly adhere to HIPAA constraints and avoid any diagnostic speculation.",
    targetPillars: ["P2: Role", "P5: Constraint", "P6: Format"],
    tokenBudget: 500,
    hand: [
      { id: "c6", name: "Physician Assistant Voice", cost: 150, type: "Role" },
      { id: "c7", name: "HIPAA Scrub Filter", cost: 100, type: "Constraint" },
      { id: "c8", name: "Layman Translation Guide", cost: 120, type: "Example" },
    ],
  },
];

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
};

function SectionExplanation({ text }: { text: string }) {
  return (
    <div className="p-3 bg-primary/5 border-l-2 border-primary text-xs text-muted-foreground font-mono leading-relaxed mt-3 rounded-r">
      <span className="text-primary font-bold uppercase tracking-wider">Guide · </span>{text}
    </div>
  );
}

export default function DemoSkillGames() {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "design" | "result">("lobby");
  const [activeScenario, setActiveScenario] = useState<typeof DEMO_SCENARIOS[0] | null>(null);
  const [playedCards, setPlayedCards] = useState<string[]>([]);
  const [cardName, setCardName] = useState("");
  const [cardBody, setCardBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const startRound = (scen: typeof DEMO_SCENARIOS[0]) => {
    setActiveScenario(scen);
    setPlayedCards([]);
    setCardName("");
    setCardBody("");
    setGameState("playing");
  };

  const handlePlayCard = (id: string) => {
    if (playedCards.includes(id)) {
      setPlayedCards(playedCards.filter((c) => c !== id));
    } else {
      if (playedCards.length < 5) {
        setPlayedCards([...playedCards, id]);
      }
    }
  };

  const submitCard = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setGameState("result");
    }, 1200);
  };

  const tokensUsed = playedCards.reduce((sum, id) => {
    const card = activeScenario?.hand.find((c) => c.id === id);
    return sum + (card?.cost ?? 0);
  }, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Helper Callout */}
      <DemoHelperCallout
        stepLabel="Step 2 of 7 · CCGE Prompting Arena"
        title="Skill Games"
        subtitle="The CCGE Arena — learn prompt engineering by playing"
        description="Pick a scenario matching your industry, build a prompt from Context Craft cards, and write a custom final template. The system scores you dynamically across Knowledge, Clarity, Specificity, and Efficiency. Succeeding in rounds increases your CCMI and pumps up your overall JST score."
        takeaways={[
          "Four difficulty tiers (Bronze → Platinum) matching your role JST",
          "Each completed round feeds your daily ARK score boost limit",
          "Includes real-time grading checks powered by Claude"
        ]}
      />

      {/* Lobby View */}
      {gameState === "lobby" && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-secondary/30">
            <div className="flex items-center gap-3 mb-3">
              <Gamepad2 className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-display font-bold tracking-wide text-primary uppercase">Skill Games Lobby</h1>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Below are active prompt engineering challenges. Tap a card to flip it and read the scoring criteria, then start a practice round.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {DEMO_SCENARIOS.map((s) => (
              <FlippableCard
                key={s.id}
                testId={`scenario-${s.id}`}
                minHeight="260px"
                flipLabel="Flip card"
                unflipLabel="Flip card"
                faceClassName={cn("glass-card rounded-xl border-2 hover:border-primary/45 transition-all bg-black/40", TIER_BORDER[s.tier])}
                backFaceClassName={cn("glass-card rounded-xl border-2 bg-black/40", TIER_BORDER[s.tier])}
                front={
                  <div className="p-5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn("font-display", `bg-linear-to-br ${TIER_COLORS[s.tier]} text-background`)}>
                          {s.tier}
                        </Badge>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          Difficulty {s.difficulty}/5 · {s.tokenBudget} tokens
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-white mb-2">{s.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                        {s.prompt}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {s.targetPillars.map((p) => (
                          <Badge key={p} variant="outline" className="font-mono text-[9px] text-cyan-300 border-cyan-400/20">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button onClick={() => startRound(s)} className="w-full font-mono text-xs uppercase tracking-wider">
                      Start Practice Round
                    </Button>
                  </div>
                }
                back={
                  <div className="p-5 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Scoring Criteria</span>
                      <h4 className="font-display font-bold text-sm text-white mt-1 mb-3">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To earn Gold, you must ensure:
                        <br />• Tone is formal and matches corporate standards.
                        <br />• System constraints are strictly respected.
                        <br />• Output is formatted as a clear bulleted list.
                      </p>
                    </div>
                    <Button onClick={() => startRound(s)} className="w-full font-mono text-xs uppercase tracking-wider">
                      Start Round
                    </Button>
                  </div>
                }
              />
            ))}
          </div>

          <SectionExplanation text="Real users select from dozens of scenarios. The flippable animation teaches users what constraints are evaluated server-side before they burn tokens." />
        </div>
      )}

      {/* Playing / Card selection stage */}
      {gameState === "playing" && activeScenario && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("font-display", `bg-linear-to-br ${TIER_COLORS[activeScenario.tier]} text-background`)}>
                    {activeScenario.tier}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    Difficulty {activeScenario.difficulty}/5
                  </span>
                </div>
                <h1 className="text-2xl font-display font-bold text-white">{activeScenario.title}</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{activeScenario.prompt}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Token Budget</div>
                <div className={cn("text-3xl font-display font-bold tabular-nums", tokensUsed > activeScenario.tokenBudget ? "text-rose-400" : "text-amber-400")}>
                  {tokensUsed}<span className="text-base text-muted-foreground">/{activeScenario.tokenBudget}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hand Cards */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Select Context Craft Cards (up to 5)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {activeScenario.hand.map((c) => {
                const isSelected = playedCards.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => handlePlayCard(c.id)}
                    className={cn(
                      "text-left rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between h-36 bg-black/30",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(68,136,255,0.2)]"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{c.type}</span>
                    <h4 className="font-display font-bold text-sm text-white mt-1 leading-tight">{c.name}</h4>
                    <span className="text-xs font-mono text-amber-400 mt-auto">{c.cost} tokens</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setGameState("lobby")} className="flex-1 font-mono uppercase text-xs">
              Back to Lobby
            </Button>
            <Button
              disabled={playedCards.length === 0}
              onClick={() => setGameState("design")}
              className="flex-1 font-mono uppercase text-xs bg-primary text-background hover:bg-primary/90"
            >
              Next: Design Custom Prompt <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <SectionExplanation text="In this step, players build a context structure. Selecting cards adds tokens to the budget. Managing card selections helps users understand prompt efficiency." />
        </div>
      )}

      {/* Prompt Design Stage */}
      {gameState === "design" && activeScenario && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Step 2: Prompt Templates</span>
            <h2 className="text-xl font-display font-bold text-white mt-1">Compose your Final Card</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Write a short test template that will combine with your selected card components. Let's draft the response:
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2">Card Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="e.g. Audit Response Template"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2">Prompt Body</label>
              <textarea
                rows={6}
                value={cardBody}
                onChange={(e) => setCardBody(e.target.value)}
                placeholder="Write your template parameters here..."
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setGameState("playing")} className="flex-1 font-mono uppercase text-xs">
              Back to Cards
            </Button>
            <Button
              disabled={submitting || !cardName || !cardBody}
              onClick={submitCard}
              className="flex-1 font-mono uppercase text-xs bg-primary text-background"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
              Submit & Score Prompt
            </Button>
          </div>

          <SectionExplanation text="Here, users merge static parameters with dynamic prompting logic. Submitting calls the evaluation LLM to score the response against the criteria." />
        </div>
      )}

      {/* Result view */}
      {gameState === "result" && activeScenario && (
        <div className="space-y-6">
          <div className="glass-card border-2 border-yellow-500/50 p-8 rounded-xl bg-black/40">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Trophy className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Round Score</p>
                  <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary tabular-nums">46</h1>
                  <p className="text-sm text-muted-foreground mt-1">out of 50</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Tier Earned</p>
                <div className="inline-block px-4 py-2 rounded-md font-display text-2xl font-bold bg-gradient-to-br from-yellow-500 to-amber-400 text-background">
                  Gold
                </div>
              </div>
            </div>
          </div>

          {/* Flywheel Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-xl border border-white/10 bg-black/20">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Zap className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest font-mono">ARK Score Boost</span>
              </div>
              <div className="text-3xl font-display font-bold text-cyan-300 tabular-nums">
                +15
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your JST Index has been boosted.
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/10 bg-black/20">
              <div className="flex items-center gap-2 text-fuchsia-400 mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest font-mono">Cert Progress</span>
              </div>
              <div className="text-xl font-display font-bold text-fuchsia-300">
                CC-400 (Gold)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                92% to CC-500 (Platinum)
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/10 bg-black/20">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Coins className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest font-mono">Token Budget</span>
              </div>
              <div className="text-3xl font-display font-bold text-amber-300 tabular-nums">
                {tokensUsed} <span className="text-base text-muted-foreground">/ {activeScenario.tokenBudget}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Under budget! No penalty applied.
              </p>
            </div>
          </div>

          {/* Metric breakdown */}
          <div className="glass-card p-6 rounded-xl border border-white/10 bg-black/20">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Detailed Metrics</h2>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { label: "Knowledge", value: 48, pct: 96 },
                { label: "Clarity", value: 45, pct: 90 },
                { label: "Specificity", value: 44, pct: 88 },
                { label: "Efficiency", value: 47, pct: 94 },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>{m.label}</span>
                    <span>{m.value}/50</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => setGameState("lobby")} className="w-full font-mono uppercase text-xs">
            Back to Skill Games Lobby
          </Button>

          <SectionExplanation text="Finishing a round calculates weights and multiplies points. The results page feeds back into the user's dashboard and updates their live Human-Computer signals." />
        </div>
      )}
    </div>
  );
}
