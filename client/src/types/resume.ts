// ── Resume counts ─────────────────────────────────────────────────────────────

export interface ResumeCount {
  id: string;
  user: { id: string; name: string };
  subscription: { id: string; status: string };
  total: number | null;
  count: number | null;
  createdAt: string;
  updatedAt: string;
}

// ── Assessment ────────────────────────────────────────────────────────────────

export interface RiskModifier {
  task: string;
  automatable: number;
}

export interface TransferabilityVector {
  id: string;
  assessmentId: string;
  subject: string;
  score: number;
}

export interface PivotOpportunity {
  id: string;
  assessmentId: string;
  role: string;
  feasibility: number;
  gapCost: string;
  time: string;
}

export interface UpskillingPlanItem {
  id: string;
  assessmentId: string;
  phase: "30-Day" | "90-Day" | "12-Month";
  title: string;
  description: string;
  type: "new-skilling" | "up-skilling" | "ready-skilling";
  hours: number;
}

export interface Assessment {
  id: string;
  userId: string;
  jstTotal: number;
  jstJobs: number;
  jstSkills: number;
  jstTalent: number;
  vulnerabilityLevel: number;
  readinessProfile: string;
  riskModifiers: RiskModifier[];
  matchedCardIds: string[];
  archetypeArchitect: number;
  archetypeOrchestrator: number;
  archetypeConductor: number;
  contextCraftLevel: string;
  resumeUrl: string | null;
  transferabilityVectors?: TransferabilityVector[];
  pivotOpportunities?: PivotOpportunity[];
  upskillingPlans?: UpskillingPlanItem[];
  createdAt: string;
}

// ── Analyze response (upload / paste) ─────────────────────────────────────────

export interface AnalyzeIdentitySnapshot {
  arkScore: number;
  jstIndex: number;
  ccmi: number;
  ccmiTier: string | null;
  arkTierKey: string | null;
  vmstLevel: string | null;
  typology: string | null;
  arkIdString: string | null;
  appliedDelta: number;
}

export interface AnalyzeResponse {
  assessment: Assessment;
  identity: AnalyzeIdentitySnapshot;
}
