import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ArkIdentityCard } from "@/components/dashboard/ArkIdentityCard";
import { JstCcmiDoughnuts } from "@/components/dashboard/JstCcmiDoughnuts";
import { CcmiPillars } from "@/components/dashboard/CcmiPillars";
import { JSTGauge } from "@/components/dashboard/JSTGauge";
import { JSTRadar } from "@/components/dashboard/JSTRadar";
import { VulnerabilityMeter } from "@/components/dashboard/VulnerabilityMeter";
import { ArchetypeHandicap } from "@/components/dashboard/ArchetypeHandicap";
import { LhcsSignal } from "@/components/dashboard/LhcsSignal";
import { FlywheelCard } from "@/components/dashboard/FlywheelCard";
import { DemoHelperCallout } from "@/components/demo/DemoHelperCallout";

const DUMMY_IDENTITY = {
  arkScore: 487,
  jstIndex: 247,
  ccmi: 240,
  ccmiTier: "Gold (CC-400)",
  vmstLevel: "L4",
  typology: "Orchestrator-dominant",
  arkIdString: "ARK-CHEN-8291-ATLAS",
  resumeReplacementPct: 15,
};

const DUMMY_PILLARS = {
  P1: 72,
  P2: 66,
  P3: 76,
  P4: 68,
  P5: 60, // weakest
  P6: 70,
  P7: 68,
  composite: 240,
  tier: "Gold (CC-400)",
  multiplier: 1.35,
};

const DUMMY_LHCS = {
  cprScore: 78,
  mpsScore: 72,
  lcisScore: 81,
  cprLight: "green" as const,
  mpsLight: "green" as const,
  lcisLight: "green" as const,
  status: "green" as const,
  readinessPct: 77,
};

function SectionExplanation({ text }: { text: string }) {
  return (
    <div className="p-3 bg-primary/5 border-l-2 border-primary text-xs text-muted-foreground font-mono leading-relaxed mt-3 rounded-r">
      <span className="text-primary font-bold uppercase tracking-wider">Guide · </span>{text}
    </div>
  );
}

export default function DemoJstIndex() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Helper Callout */}
      <DemoHelperCallout
        stepLabel="Step 1 of 7 · For: Sarah Chen, Senior Product Manager"
        title="JST Index"
        subtitle="Jobs · Skills · Talent — your single AI-readiness score"
        description="Every resume is parsed into three weighted sub-scores — Jobs (30%), Skills (40%), Talent (30%) — then multiplied by your Context Craft handicap. The 0–300 result lands you in one of five zones, from Critical to Flourishing, with industry percentile and AI-vulnerability level computed at the same time."
        takeaways={[
          "Single number, defensible math — no black-box AI rating",
          "Context Craft certification acts as a multiplier (0.5x → 1.5x)",
          "Tracked over time so you can see the slope of your career"
        ]}
      />

      <DashboardHeader name="Sarah Chen" role="Senior Product Manager" />

      {/* ARK Identity Card */}
      <div>
        <ArkIdentityCard identity={DUMMY_IDENTITY} />
        <SectionExplanation text="The canonical ARK score is the sum of two engines: how the market values you (JST) and how skilfully you wield AI (CCMI). The flywheel feeds itself — every Skill Game session and every Marketplace transaction nudges both numbers." />
      </div>

      {/* Composite & Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col justify-between">
          <JstCcmiDoughnuts jst={DUMMY_IDENTITY.jstIndex} ccmi={DUMMY_IDENTITY.ccmi} />
          <SectionExplanation text="Doughnut charts illustrate your index composition. It quickly alerts you if one of the scores is dragging down your overall ARK score." />
        </div>
        <div className="lg:col-span-2">
          <CcmiPillars data={DUMMY_PILLARS} />
          <SectionExplanation text="The CCMI 7-Pillar vector shows your command of specific prompt engineering components. Your weakest pillar is dynamically flagged below the chart to guide your CCGE practice focus." />
        </div>
      </div>

      {/* Gauge and Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <JSTGauge
            score={DUMMY_IDENTITY.jstIndex}
            jobsScore={JST.jobs}
            skillsScore={JST.skills}
            talentScore={JST.talent}
            contextCraftLevel="CC_400"
            contextCraftMultiplier={1.35}
            percentileRank={91}
            previousScore={218}
            industryAverage={168}
            rawTotal={235}
          />
          <SectionExplanation text="The JST Gauge normalizes your composite score and classifies you into readiness zones. It benchmarks you against the industry average and highlights your Context Craft multiplier." />
        </div>
        <div>
          <JSTRadar jobsScore={JST.jobs} skillsScore={JST.skills} talentScore={JST.talent} />
          <SectionExplanation text="A radar projection showing relative strengths across Jobs (market demand), Skills (specific competencies), and Talent (general ability)." />
        </div>
      </div>

      {/* Vulnerability & LHCS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <VulnerabilityMeter level={3} />
          <SectionExplanation text="Vulnerability Meter scores your job's task-exposure index. Level 3 (Resilient) represents a balanced profile where tasks can be amplified by AI rather than replaced." />
        </div>
        <div>
          <LhcsSignal data={DUMMY_LHCS} />
          <SectionExplanation text="Live Human Career Signals monitor Career Pivot Readiness (CPR), Marketplace Productivity Strength (MPS), and Live Career Intent (LCIS) to measure active market synthesis." />
        </div>
      </div>

      {/* Archetype */}
      <div>
        <ArchetypeHandicap
          architect={28}
          orchestrator={52}
          conductor={20}
          profile="Orchestrator-dominant: thrives connecting people, systems, and decisions across functions."
        />
        <SectionExplanation text="The cognitive archetype profiles your default work style. This determines how well you balance independent problem definition (Architect) and direct execution (Conductor) vs system coordination (Orchestrator)." />
      </div>

      {/* Flywheel Card */}
      <div>
        <FlywheelCard top={null} ranked={[]} />
        <SectionExplanation text="The Flywheel records your active credits and daily contributions. Practicing CCGE and publishing prompts directly increments your score up to a capped amount." />
      </div>
    </div>
  );
}

// Fallbacks for missing references
const JST = {
  jobs: 79,
  skills: 88,
  talent: 80
};
