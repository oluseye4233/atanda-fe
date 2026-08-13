// ── Book Companion — shared types ─────────────────────────────────────────────

import type { JourneyNode } from "@shared/bookCompanion";

/** A journey node enriched with the reader's earned state. */
export interface JourneyNodeView {
  id: string;
  order: number;
  stage: string;
  chapterLabel: string;
  title: string;
  pillar: string | null;
  badge: string;
  ccLevel: string | null;
  tierArt: string;
  slug: string;
  deepLink: string;
  quest: string[];
  earned: boolean;
  earnedAt: string | null;
  earnedVia: string | null;
}

/** Immutable ledger snapshot (baseline / final). */
export interface LedgerSnap {
  jstIndex: number;
  ccmi: number;
  arkScore: number;
  badgesEarned: number;
  spcPublished: number;
}

/** The reader's current ledger with baseline/final for delta display. */
export interface LedgerView {
  baseline: LedgerSnap | null;
  final: LedgerSnap | null;
  current: {
    jstIndex: number;
    ccmi: number;
    arkScore: number;
    badgesEarned: number;
    spcPublished: number;
  };
  delta: { jstIndex: number; ccmi: number; arkScore: number } | null;
}

/** GET /v1/book/journey */
export interface BookJourney {
  nodes: JourneyNodeView[];
  earnedCount: number;
}

/** POST /v1/book/ledger/capture */
export interface CaptureSnapshotBody {
  kind: "baseline" | "final";
}

export interface CaptureSnapshotResponse {
  ledger: LedgerView;
}

export type { JourneyNode };
