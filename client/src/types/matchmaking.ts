export type ArchetypePreference = "A" | "O" | "C";
export type RequirementTier = "Bronze" | "Silver" | "Gold" | "Platinum";
export type MatchStatus = "met" | "partial" | "missing";
export type SkillGapKind = "missing" | "upgrade";

// ── Opportunity ─────────

export interface OpportunityRequirement {
  cardId: string;
  minTier: RequirementTier;
  weight: number;
  roleLabel?: string;
}

export interface Opportunity {
  id: string;
  createdByUserId: string;
  title: string;
  description: string | null;
  jstFloor: number;
  archetypePreference: ArchetypePreference | null;
  requirements: OpportunityRequirement[];
  createdAt: string;
}

export interface CreateOpportunityBody {
  title: string;
  description?: string;
  jstFloor?: number;
  archetypePreference?: ArchetypePreference | null;
  requirements: OpportunityRequirement[];
}

// ── Match detail ────────

interface MatchRequirement extends OpportunityRequirement {
  userTier: string | null;
  status: MatchStatus;
  credit: number;
}

interface MatchResult {
  matchScore: number;
  coveragePct: number;
  jstFactorPct: number;
  archetypeFitPct: number;
  evidenceCount: number;
  totalRequirements: number;
  projectedMatchScore: number;
  requirements: MatchRequirement[];
}

interface SkillGap {
  cardId: string;
  minTier: RequirementTier;
  userTier: string | null;
  kind: SkillGapKind;
}

export interface OpportunityDetail {
  opportunity: Opportunity;
  placeable: boolean;
  match: MatchResult | null;
  skillGap: SkillGap[];
}

// ── Team assembly ─────────────────────────────────────────────────────────────

export interface AssembleTeamBody {
  candidateUserIds: string[];
}

interface TeamAssignment {
  roleLabel: string;
  userId: string | null;
  coveragePct: number;
}

export interface AssembleTeamResponse {
  txs: unknown;
  skillCoveragePct: number;
  diversityPct: number;
  jstDepthPct: number;
  filledRoles: number;
  totalRoles: number;
  assignments: TeamAssignment[];
}
