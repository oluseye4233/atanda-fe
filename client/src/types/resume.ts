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
