// ── SPHINX marketplace — shared types ─────────────────────────────────────────

export type ListingStatus = string;
export type ListingScope = "OPEN" | "CORPORATE" | "BOTH";
/** Alias kept for parity with the API's SpcScope naming. */
export type SpcScope = ListingScope;

// ── Listing ───────────────────────────────────────────────────────────────────

export interface SpcListing {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  body: string;
  pillar: string;
  hiveScore: number;
  kcseScore: number;
  priceCredits: number;
  status: ListingStatus;
  scope: ListingScope;
  institution: string | null;
  salesCount: number;
  totalEarned: number;
  /** Present on detail views: false once the buyer owns the card. */
  bodyLocked?: boolean;
  bodyLength?: number;
  createdAt: string;
}

export interface SpcListingDetail {
  listing: SpcListing & { bodyLocked?: boolean; bodyLength?: number };
  creator: { id: string; name: string; contextCraftCertLevel: string } | null;
}

export interface ListListingsParams {
  category?: string;
  search?: string;
  disc?: string;
  rarity?: string;
  version?: string;
  tier?: string;
  pillar?: string;
}

export interface CreateListingBody {
  title: string;
  description: string;
  body: string;
  pillar: string;
  priceCredits: number;
  scope: ListingScope;
}

export interface PurchaseResult {
  listing: SpcListing;
  buyerBalance: number;
  isFirstSaleForCreator: boolean;
  creatorTalentBoost: number;
}

// ── HIVE analysis ─────────────────────────────────────────────────────────────

export interface HivePrecheckBody {
  title: string;
  description?: string;
  body: string;
  pillar?: string | null;
}

export interface HivePrecheck {
  passes: boolean;
  hiveScore: number;
  kcseScore: number;
  reasons: string[];
  warnings: string[];
}

export interface PillarSuggestion {
  pillar: string;
  currentStrength: number;
  suggestion: string;
}

export interface SpcAiAnalysis {
  letterGrade: string;
  letterGradeColor: string;
  hiveScore: number;
  pillarSuggestions: PillarSuggestion[];
  generatedAt: string;
  cached: boolean;
}

// ── Credits ───────────────────────────────────────────────────────────────────

export interface UserCredits {
  balance: number;
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export interface FeedbackSummary {
  count: number;
  average: number;
  histogram: Record<string, number>;
  recent: Array<{
    id: string;
    stars: number;
    comment: string | null;
    createdAt: string;
    buyerName: string | null;
  }>;
  mine: {
    id: string;
    stars: number;
    comment: string | null;
    createdAt: string;
  } | null;
}

// ── Corporate ─────────────────────────────────────────────────────────────────

export interface CorporateListings {
  institution: string;
  listings: SpcListing[];
}

// ── Complementary pairs ───────────────────────────────────────────────────────

export interface ComplementaryRow {
  rank: number;
  score: number;
  partner: SpcListing & { bodyLocked?: boolean; bodyLength?: number };
}

// ── Synergy Lab (Junglenomics) ────────────────────────────────────────────────

export interface JngCardLite {
  id: string;
  name: string;
  emoji?: string | null;
  disc?: string | null;
  rarity?: string | null;
  version?: string | null;
  category?: string | null;
}

export interface SynergyResult {
  synergyScore: number;
  pairCount: number;
  breakdown: Array<{
    a: string;
    b: string;
    score: number;
    rationale: string;
    source: "table" | "computed";
  }>;
}

// ── Roundtable ────────────────────────────────────────────────────────────────

export interface RoundtableSeat {
  seatNumber: number;
  score: number;
  hiveScore: number;
  salesCount: number;
  snapshotAt: string;
  rankDelta: number;
  seatSinceAt: string;
  timeHeldMs: number;
  listing: {
    id: string;
    title: string;
    pillar: string;
    priceCredits: number;
    hiveScore: number;
  } | null;
  creator: { id: string; name: string } | null;
}

// ── Synthesis ─────────────────────────────────────────────────────────────────

export interface SynthSession {
  id: string;
  totalCreditPrice: number;
  zposMethod: string;
  preTokens: number;
  postTokens: number;
  reductionPct: number;
  semanticPreservation: number;
  combinedOutput: string;
  status: string;
  previewSnippet?: string;
  previewTruncated?: boolean;
  splitPreview: Array<{
    creatorId: string;
    sourceListingId: string;
    sourcePriceCredits: number;
    weight: number;
    creditedAmount: number;
  }>;
  lockedPrices: Array<{
    listingId: string;
    creatorId: string;
    priceCredits: number;
  }>;
}

export interface ListingSyntheses {
  count: number;
  recent: Array<{
    sessionId: string;
    createdAt: string;
    zposMethod: string;
    reductionPct: number;
  }>;
}

export interface FinalizeResult {
  session: SynthSession;
  buyerBalance: number;
}

// ── Forge Lab (.docx ingest) ──────────────────────────────────────────────────

export interface ForgeRunResult {
  body: string;
  bodyLength: number;
  fileName: string;
  precheck: HivePrecheck;
}
