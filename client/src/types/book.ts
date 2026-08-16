// ── Book Companion (Context Craft journey) — API response shapes ────────────────

import type { JourneyNode } from "@shared/bookCompanion";

/** A narrative stage returned by GET /api/book/journey. */
export interface BookJourneyStage {
  id: string;
  label: string;
  blurb: string;
}

/** A journey node annotated with the reader's earned state. */
export interface BookJourneyNode extends JourneyNode {
  earned: boolean;
}

/** GET /api/book/journey */
export interface BookJourneyResponse {
  title: string;
  totalNodes: number;
  stages: BookJourneyStage[];
  nodes: BookJourneyNode[];
}

/** A single badge awarded by the server. */
export interface BookBadge {
  nodeId: string;
  badge: string;
  awardedAt: string;
  meta?: Record<string, unknown>;
}

/** Snapshot of the reader's ARK identity. */
export interface LedgerSnapshot {
  scope: "baseline" | "final";
  arkScore: number;
  jstIndex: number;
  ccmi: number;
  ccmiTier: string;
  arkIdString: string;
}

/** Delta between the final and baseline Ledger snapshots. */
export interface LedgerDelta {
  arkScore: number;
  jstIndex: number;
  ccmi: number;
}

/** Reader's baseline + final snapshots and the delta between them. */
export interface BookLedger {
  baseline: LedgerSnapshot | null;
  final: LedgerSnapshot | null;
  delta: LedgerDelta | null;
}

/** GET /api/book/progress */
export interface BookProgressResponse {
  badges: BookBadge[];
  ledger: BookLedger;
}

/** POST /api/book/finalize */
export interface FinalizeResponse {
  nodeId: string;
  badge: string;
  ledger: BookLedger;
}
