// ── Budget status ─────────────────────────────────────────────────────────────

export interface AiUsageCap {
  tokens: number;
  costCents: number;
}

export interface AiStatus {
  usage: AiUsageCap;
  caps: AiUsageCap;
  remaining: AiUsageCap;
  ratioPct: number;
  upgradeAtPct: number;
  hardStopAtPct: number;
  guardrailActive: boolean;
}

// ── Models ────────────────────────────────────────────────────────────────────

export interface AiModel {
  id: string;
  provider: string;
  costTier: string;
  available: boolean;
}

export interface AiModelsResponse {
  preferred: string | null;
  models: AiModel[];
}

// ── Resume narrative ──────────────────────────────────────────────────────────

export interface ResumeNarrative {
  summary: string;
  archetypeInsight: string;
  topRisks: string[];
  growthPath: string[];
  generatedAt: string;
  cached: boolean;
}

// ── Job-role guide ────────────────────────────────────────────────────────────

export interface JobRoleGuide {
  role: string;
  onet: string[];
  sfia: string[];
  wef: {
    outlook: string;
    summary: string;
    signals: string[];
  };
  cached: boolean;
}

// ── Admin scenario generation ─────────────────────────────────────────────────

export interface GenerateScenarioBody {
  brief: string;
  industry?: string;
  role?: string;
  tierHint?: "Bronze" | "Silver" | "Gold" | "Platinum";
}

export interface GeneratedScenario {
  tier: string;
  title: string;
  prompt: string;
  targetPillars: string[];
  tokenBudget: number;
  difficulty: number;
  industry?: string;
  isCustom: boolean;
}
