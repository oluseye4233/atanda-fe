import { Link } from "react-router-dom";
import { Loader2, Upload as UploadIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useArkDashboard } from "@/hooks/useArkDashboard";
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
import { ContextCraftBookBanner } from "@/components/dashboard/ContextCraftBookBanner";

function DashboardLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center" data-testid="dashboard-loading">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="font-display text-lg text-white mb-1">Loading your intelligence…</p>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        Pulling your ARK identity and latest assessment.
      </p>
    </div>
  );
}

function DashboardEmpty() {
  return (
    <div className="w-full max-w-3xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center" data-testid="dashboard-empty">
      <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
        <UploadIcon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-2">Let's get your first reading</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        Upload your CV to generate your ARK score, JST index, AI-vulnerability profile
        and personalised next moves. It takes about a minute.
      </p>
      <Link
        to="/upload"
        data-testid="button-start-first-assessment"
        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-mono uppercase tracking-wider px-6 py-3 text-sm font-medium rounded-lg transition-all hover:-translate-y-0.5"
      >
        <UploadIcon className="h-4 w-4" /> Upload your CV
      </Link>

      <div className="mt-8 w-full max-w-md">
        <ContextCraftBookBanner />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isLoading, identity, identityCard, pillars, assessment, lhcs, flywheel, hasData } =
    useArkDashboard();

  if (isLoading) return <DashboardLoading />;
  if (!hasData) return <DashboardEmpty />;

  // Prefer assessment sub-scores; fall back to identity's JST breakdown.
  const jobs = assessment?.jstJobs ?? identity?.jstSub.jobs ?? 0;
  const skills = assessment?.jstSkills ?? identity?.jstSub.skills ?? 0;
  const talent = assessment?.jstTalent ?? identity?.jstSub.talent ?? 0;
  const jstScore = identity?.jstIndex ?? assessment?.jstTotal ?? 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader name={user?.name ?? "—"} role={user?.role ?? "—"} />

      <ContextCraftBookBanner />

      {identityCard && <ArkIdentityCard identity={identityCard} />}

      {identity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <JstCcmiDoughnuts jst={identity.jstIndex} ccmi={identity.ccmi} />
          <div className="lg:col-span-2">
            <CcmiPillars data={pillars} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JSTGauge
          score={jstScore}
          jobsScore={jobs}
          skillsScore={skills}
          talentScore={talent}
          contextCraftLevel={assessment?.contextCraftLevel}
        />
        <JSTRadar jobsScore={jobs} skillsScore={skills} talentScore={talent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assessment && <VulnerabilityMeter level={assessment.vulnerabilityLevel} />}
        <LhcsSignal data={lhcs} />
      </div>

      {assessment && (
        <ArchetypeHandicap
          architect={assessment.archetypeArchitect}
          orchestrator={assessment.archetypeOrchestrator}
          conductor={assessment.archetypeConductor}
          profile={assessment.readinessProfile}
        />
      )}

      <FlywheelCard top={flywheel ?? null} ranked={[]} />
    </div>
  );
}
