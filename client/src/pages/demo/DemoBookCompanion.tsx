import { BookOpen, Compass, Award, TrendingUp, QrCode } from "lucide-react";
import { DemoHelperCallout } from "@/components/demo/DemoHelperCallout";

const BOOK_LEDGER = {
  baselineArk: 312,
  finalArk: 487, // JST 247 + CCMI 240
};

const JOURNEY_STAGES = [
  { id: "S1", label: "Stage 1: The Context Shift", blurb: "Chapters 1–4: From search keywords to structured instructions." },
  { id: "S2", label: "Stage 2: The Action Space", blurb: "Chapters 5–8: Multi-turn prompt state and few-shot example selection." },
];

const JOURNEY_NODES = [
  { id: "node-1", stage: "S1", chapterLabel: "Chapter 1", pillar: "P1: System", title: "Establishing Persona voice", badge: "CC-PA-1", tierArt: "Bronze" },
  { id: "node-2", stage: "S1", chapterLabel: "Chapter 2", pillar: "P3: Instruction", title: "Targeting clear objectives", badge: "CC-PA-2", tierArt: "Silver" },
  { id: "node-3", stage: "S2", chapterLabel: "Chapter 5", pillar: "P4: Example", title: "Selecting representative cases", badge: "CC-PA-5", tierArt: "Gold" },
  { id: "node-4", stage: "S2", chapterLabel: "Chapter 6", pillar: "P5: Constraint", title: "Setting policy boundaries", badge: "CC-PA-6", tierArt: "Gold" },
];

const BOOK_TIER_ART: Record<string, string> = {
  Bronze: "from-amber-700 to-orange-500",
  Silver: "from-slate-400 to-slate-200",
  Gold: "from-yellow-500 to-amber-300",
  Platinum: "from-fuchsia-500 to-cyan-400",
};

function SectionExplanation({ text }: { text: string }) {
  return (
    <div className="p-3 bg-primary/5 border-l-2 border-primary text-xs text-muted-foreground font-mono leading-relaxed mt-3 rounded-r">
      <span className="text-primary font-bold uppercase tracking-wider">Guide · </span>{text}
    </div>
  );
}

export default function DemoBookCompanion() {
  const delta = BOOK_LEDGER.finalArk - BOOK_LEDGER.baselineArk;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Helper Callout */}
      <DemoHelperCallout
        stepLabel="Step 6 of 7 · Context Craft Book Companion"
        title="Book Companion"
        subtitle="Verify book learning chapters and earn ARK credits"
        description="Every chapter of the printed book 'Context Craft' includes a QR code that maps directly to a platform CCGE scenario. Scan the QR code, solve the prompting challenge, verify your learning, and record your proven score growth in the ARK Ledger."
        takeaways={[
          "Bridges offline paper chapters with online interactive practice",
          "Verification triggers immediate chapter badge QR registry updates",
          "Includes the ARK Ledger to prove and benchmark career capital gains"
        ]}
      />

      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Book Companion Journey
          </h2>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Explore the book companion chapters and track your reading journey.
        </p>
      </div>

      {/* Book header + Ledger */}
      <div className="glass-card rounded-xl border-2 border-fuchsia-400/40 p-6 bg-black/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-cyan-400/20 border border-fuchsia-400/40 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-fuchsia-300 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-300">The Book Companion</div>
              <h3 className="font-display font-bold text-xl text-white leading-tight">Context Craft: Prompt Engineering Principles</h3>
              <div className="text-xs text-muted-foreground mt-0.5">8 chapters · 3 stages · Scan book QR codes to verify modules.</div>
            </div>
          </div>
        </div>

        {/* Ledger stats */}
        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          <div className="glass-card rounded-lg border border-white/10 p-3 bg-black/30">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              <Compass className="h-3 w-3" /> Baseline ARK · Prologue
            </div>
            <div className="font-display text-xl font-bold text-muted-foreground">{BOOK_LEDGER.baselineArk} / 600</div>
          </div>
          <div className="glass-card rounded-lg border border-white/10 p-3 bg-black/30">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-secondary mb-1">
              <Award className="h-3 w-3" /> Final ARK · Epilogue
            </div>
            <div className="font-display text-xl font-bold text-secondary">{BOOK_LEDGER.finalArk} / 600</div>
          </div>
          <div className="glass-card rounded-lg border border-white/10 p-3 bg-black/30">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-300 mb-1">
              <TrendingUp className="h-3 w-3" /> Proven Delta
            </div>
            <div className="font-display text-xl font-bold text-emerald-300">+{delta} ARK</div>
          </div>
        </div>
      </div>
      <SectionExplanation text="The Ledger is a trust ledger documenting verified score improvement. It records the baseline ARK score prior to reading the book, and tracks incremental deltas." />

      {/* Stage-by-stage journey */}
      <div className="space-y-5">
        {JOURNEY_STAGES.map((stage, si) => {
          const nodes = JOURNEY_NODES.filter((n) => n.stage === stage.id);
          return (
            <div key={stage.id} className="glass-card rounded-xl border border-white/10 p-5 bg-black/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-6 w-6 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center font-display text-xs text-primary font-bold">{si + 1}</span>
                <h4 className="font-display text-sm uppercase tracking-widest text-white">{stage.label}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4 ml-8">{stage.blurb}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-8">
                {nodes.map((n) => (
                  <div key={n.id} className="rounded-md border border-white/10 bg-background/40 p-3 flex items-start gap-3">
                    <div className={cn("h-8 w-8 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0", BOOK_TIER_ART[n.tierArt] ?? "from-slate-500 to-slate-300")}>
                      <Award className="h-4 w-4 text-background" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        {n.chapterLabel}
                        {n.pillar && <span className="text-cyan-300">· {n.pillar}</span>}
                      </div>
                      <div className="font-display text-xs font-bold text-white leading-tight truncate">{n.title}</div>
                      <div className="text-[9px] font-mono text-fuchsia-200 mt-1 flex items-center gap-1">
                        <QrCode className="h-3 w-3" /> {n.badge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <SectionExplanation text="Progress nodes match book chapters. Solving prompting challenges verifies learning objectives and automatically unlocks the respective stage badge." />
    </div>
  );
}
