// ── SPHINX marketplace — shared types ─────────────────────────────────────────

export type ListingStatus = string;
export type ListingScope = "OPEN" | "CORPORATE" | "BOTH";
/** Alias kept for parity with the API's SpcScope naming. */
export type SpcScope = ListingScope;

// ── Listing ───────────────────────────────────────────────────────────────────

export interface SpcListing {
  id: string;
  creatorUserId: string;
  title: string;
  description: string | null;
  body: string;
  pillar: string | null;
  hiveScore: number;
  kcseScore: number;
  price: number;
  status: ListingStatus;
  scope: ListingScope;
  institution: string | null;
  createdAt: string;
}

export interface CreateListingBody {
  title: string;
  description?: string;
  body: string;
  pillar?: string;
  price: number;
  hiveScore: number;
  kcseScore?: number;
  scope?: ListingScope;
  institution?: string;
}

// ── HIVE analysis ─────────────────────────────────────────────────────────────

export interface HivePrecheckBody {
  title: string;
  body: string;
  pillar?: string;
}

export interface PillarSuggestion {
  pillar: string;
  suggestion: string;
}

export interface HiveAnalysis {
  letterGrade: string;
  letterGradeColor: string;
  hiveScore: number;
  pillarSuggestions: PillarSuggestion[];
  generatedAt: string;
  cached: boolean;
}

// ── Purchase ──────────────────────────────────────────────────────────────────

export interface PurchaseResponse {
  purchaseId: string;
  listingId: string;
  price: number;
  creatorShare: number;
  platformShare: number;
  isFirstSaleForCreator: boolean;
}
