import { TransferabilityRadar } from "@/components/pathways/TransferabilityRadar";
import { UpskillingTimeline } from "@/components/pathways/UpskillingTimeline";
import { FlippableCard } from "@/components/ui/flippable-card";
import { Compass, Clock, Target, ArrowUpRight, TrendingUp, DollarSign, Users } from "lucide-react";
import { DemoHelperCallout } from "@/components/demo/DemoHelperCallout";

const TRANSFER = [
  { subject: "Tech Fluency", A: 78, fullMark: 100 },
  { subject: "Innovation Trans.", A: 85, fullMark: 100 },
  { subject: "Agility Index", A: 88, fullMark: 100 },
  { subject: "Leadership Scal.", A: 81, fullMark: 100 },
  { subject: "Data Literacy", A: 74, fullMark: 100 },
  { subject: "Strategic Vision", A: 90, fullMark: 100 },
  { subject: "Industry Mobility", A: 72, fullMark: 100 },
  { subject: "Comm. Impact", A: 86, fullMark: 100 },
  { subject: "Domain Breadth", A: 68, fullMark: 100 },
  { subject: "Execution Speed", A: 83, fullMark: 100 },
  { subject: "Geographic Port.", A: 65, fullMark: 100 },
  { subject: "Creative Problem", A: 79, fullMark: 100 },
];

const PIVOTS = [
  { role: "AI Integration Manager", feasibility: 87, gapCost: "$2,400", time: "4 months", salary: "+18%" },
  { role: "Product Operations Director", feasibility: 82, gapCost: "$1,800", time: "6 months", salary: "+24%" },
  { role: "Data Strategy Lead", feasibility: 74, gapCost: "$3,200", time: "8 months", salary: "+31%" },
];

const UPSKILLING: Array<{
  id: string;
  phase: "30-Day" | "90-Day" | "12-Month";
  title: string;
  description: string;
  type: "new-skilling" | "up-skilling" | "ready-skilling";
  hours: number;
}> = [
  { id: "u1", phase: "30-Day", title: "Prompt Engineering Foundations", description: "Master CCMI Pillars 1-3: structured prompting, role-conditioning, and output formatting", type: "ready-skilling", hours: 12 },
  { id: "u2", phase: "30-Day", title: "AI-Assisted Product Discovery", description: "Use Claude/GPT for user-interview synthesis and persona validation", type: "up-skilling", hours: 8 },
  { id: "u3", phase: "90-Day", title: "SQL + Looker for PMs", description: "Self-serve product analytics without blocking on data team", type: "up-skilling", hours: 40 },
  { id: "u4", phase: "90-Day", title: "AI Workflow Orchestration", description: "Design multi-agent pipelines using LangGraph or n8n", type: "new-skilling", hours: 30 },
  { id: "u5", phase: "12-Month", title: "Machine Learning Product Strategy", description: "Stanford XCS229i or equivalent — model selection, evaluation, MLOps fluency", type: "new-skilling", hours: 120 },
];

function feasibilityNarrative(score: number): string {
  if (score >= 80) return "Strong fit — most core skills already transfer.";
  if (score >= 60) return "Solid pivot — targeted upskilling closes the gap.";
  if (score >= 40) return "Moderate lift — plan for a structured transition period.";
  return "Long-haul pivot — treat as a 12+ month roadmap.";
}

function SectionExplanation({ text }: { text: string }) {
  return (
    <div className="p-3 bg-primary/5 border-l-2 border-primary text-xs text-muted-foreground font-mono leading-relaxed mt-3 rounded-r">
      <span className="text-primary font-bold uppercase tracking-wider">Guide · </span>{text}
    </div>
  );
}

export default function DemoCareerMobility() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Helper Callout */}
      <DemoHelperCallout
        stepLabel="Step 4 of 7 · Career Mobility Engine"
        title="Career Mobility"
        subtitle="12-vector transferability + concrete pivots + upskilling"
        description="Pivoting is computed by projecting your existing JST skills across 12 transferability vectors. The mobility engine matches your archetype against live labor-market data to reveal optimal pivot routes, time-to-competency estimations, gap upskilling costs, and target salary deltas."
        takeaways={[
          "Calculates pivot feasibility index based on verified skill overlap",
          "Includes ROI time-to-transition estimates and learning hours",
          "Prioritizes upskilling roadmap: ready-skilling, up-skilling, and new-skilling"
        ]}
      />

      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
          Career Mobility & Pathways
        </h2>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Predictive modeling for career pivots and dynamic upskilling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div>
            <TransferabilityRadar data={TRANSFER} />
            <SectionExplanation text="The 12-vector radar visualizes your transferable career capital. High ratings represent versatile skills that easily carry over to new role categories." />
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-widest mb-4">
              Top Pivot Opportunities
            </h3>
            <div className="space-y-4">
              {PIVOTS.map((pivot, i) => (
                <div key={i}>
                  <FlippableCard
                    testId={`pivot-${i}`}
                    minHeight="140px"
                    flipLabel={`Reveal pivot detail for ${pivot.role}`}
                    unflipLabel={`Hide pivot detail for ${pivot.role}`}
                    faceClassName="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
                    backFaceClassName="rounded-lg bg-primary/5 border border-primary/30"
                    front={
                      <div className="flex items-center justify-between p-4 h-full pr-12">
                        <div>
                          <h4 className="font-display font-semibold text-primary group-hover:neon-text">{pivot.role}</h4>
                          <p className="text-xs font-mono text-muted-foreground mt-1">
                            GAP COST: {pivot.gapCost} | EST: {pivot.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-mono text-white block leading-none">{pivot.feasibility}%</span>
                          <span className="text-[10px] text-muted-foreground uppercase">Feasibility</span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 -ml-4" />
                      </div>
                    }
                    back={
                      <div className="p-4 h-full flex flex-col justify-between pr-12">
                        <div className="flex items-center gap-2">
                          <Compass className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Pivot detail</span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed my-2">
                          {feasibilityNarrative(pivot.feasibility)}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                          <div>
                            <div className="text-muted-foreground uppercase">Time</div>
                            <div className="text-cyan-300 font-bold">{pivot.time}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Gap</div>
                            <div className="text-amber-400 font-bold">{pivot.gapCost}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase">Comp</div>
                            <div className="text-emerald-400 font-bold">{pivot.salary}</div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
            <SectionExplanation text="Pivot cards estimate feasibility by matching overlaps in Jnomics profiles. Flip the cards to read qualitative assessments and return-on-effort comp adjustments." />
          </div>
        </div>

        <div>
          <UpskillingTimeline items={UPSKILLING} />
          <SectionExplanation text="The upskilling timeline layouts a structured progression path (30-day, 90-day, and 12-month) designed to close skill gaps and build career capital resilience." />
        </div>
      </div>
    </div>
  );
}
