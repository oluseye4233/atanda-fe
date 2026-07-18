// ── ARK Identity ──────────────────────────────────────────────────────────────

export interface ArkIdentity {
  arkScore: number;
  jstIndex: number;
  jstSub: { jobs: number; skills: number; talent: number };
  ccmi: number;
  ccmiTier: string | null;
  ccmiPillars: {
    P1: number; P2: number; P3: number; P4: number;
    P5: number; P6: number; P7: number;
  };
  arkTierKey: string | null;
  vmstLevel: string | null;
  typology: string | null;
  arkIdString: string | null;
  resumeReplacementPct: number;
  cprScore: number;
  mpsScore: number;
  lcisScore: number;
  lhcsStatus: string | null;
}

// ── LHCS signal ───────────────────────────────────────────────────────────────

export interface LhcsSignal {
  cprScore: number;
  mpsScore: number;
  lcisScore: number;
  cprLight: string | null;
  mpsLight: string | null;
  lcisLight: string | null;
  status: string | null;
  readinessPct: number;
}

// ── History ───────────────────────────────────────────────────────────────────

export interface ArkHistoryItem {
  arkScore: number;
  jstIndex: number;
  ccmi: number;
  delta: number;
  trigger: string;
  createdAt: string;
}

export interface ArkHistoryResponse {
  days: number;
  data: ArkHistoryItem[];
}

// ── Flywheel CTA ──────────────────────────────────────────────────────────────

export type FlywheelUrgency = "critical" | "high" | "medium" | "low";

export interface FlywheelCta {
  position: number;
  id: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  pillar?: string;
  expectedDelta: number;
  urgency: FlywheelUrgency;
}

// ── Recalc ────────────────────────────────────────────────────────────────────

export interface RecalcResult {
  arkScore: number;
  appliedDelta: number;
  rawDelta: number;
  capReason: string | null;
}
