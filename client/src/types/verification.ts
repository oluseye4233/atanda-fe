export type VerificationStandard = "onet" | "sfia" | "wef";

// ── Quest ─────────────────────────────────────────────────────────────────────

export interface VerificationChallenge {
  standard: VerificationStandard;
  cardId: string;
  cardName: string;
  skills: string[];
  targetPillars: string[];
  tokenBudget: number;
  instructions: string;
}

export interface VerificationQuest {
  cardId: string;
  cardName: string;
  challenges: VerificationChallenge[];
}

// ── Submit ────────────────────────────────────────────────────────────────────

export interface VerificationPrompt {
  standard: VerificationStandard;
  prompt: string;
  dataPillarSatisfied?: boolean;
}

export interface SubmitVerificationBody {
  cardId: string;
  prompts: VerificationPrompt[];
}

export interface SubmitVerificationResponse {
  cardId: string;
  score: number;
  tier: string | null;
  prevTier: string | null;
  improved: boolean;
  crafts: number[];
  appliedDelta: number;
}
