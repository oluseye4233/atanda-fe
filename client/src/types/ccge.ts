// ── Card ──────────────────────────────────────────────────────────────────────

export interface CcgeCard {
  id: string;
  name: string;
  pillar: string;
  type: string;
  baseKcse: number;
  tokenCost: number;
  body: string | null;
}

// ── Scenario ──────────────────────────────────────────────────────────────────

export interface CcgeScenario {
  id: string;
  slug?: string;
  tier: string;
  title: string;
  prompt: string;
  targetPillars: string[];
  tokenBudget: number;
  difficulty: number;
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface CcgeSession {
  id: string;
  userId: string;
  scenarioId: string;
  dealtCardIds: string[];
  playedCardIds: string[] | null;
  kcseScore: number | null;
  status: string;
  finishedAt: string | null;
  createdAt: string;
}

export interface StartSessionResponse {
  sessionId: string;
  scenarioId: string;
  dealtCardIds: string[];
}

// ── Finish session ────────────────────────────────────────────────────────────

export interface FinishSessionBody {
  playedCardIds: string[];
  customCard?: { name: string; body: string };
  useClaude?: boolean;
}

interface SessionBreakdown {
  knowledge: number;
  clarity: number;
  specificity: number;
  efficiency: number;
  pillarsCovered: string[];
  synergies: Array<{ name: string; multiplier: number }>;
  tokenUsed: number;
  tokenBudget: number;
  base: number;
  final: number;
}

interface SessionFlywheel {
  arkScoreDelta: number;
  certUpgradedFrom: string | null;
  certUpgradedTo: string | null;
  newJstSkills: number | null;
  newJstTotal: number | null;
}

interface SessionJudge {
  kcseDelta: number;
  narrative: string;
  strengths: string[];
  weaknesses: string[];
}

export interface FinishSessionResponse {
  sessionId: string;
  kcseScore: number;
  tier: string | null;
  breakdown: SessionBreakdown;
  flywheel: SessionFlywheel;
  judge: SessionJudge | null;
  appliedDelta: number;
}
