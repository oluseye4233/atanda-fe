// ── F1000 founding-member promo — shared types ────────────────────────────────

export interface F1000Stats {
  total: number;
  claimed: number;
  remaining: number;
  limit: number;
}

export interface F1000Invite {
  id: string;
  seq: number;
  code: string;
  userId: string;
  promoApplied: boolean;
  createdAt: string;
}

/** GET /v1/f1000/me — authenticated founding-member status */
export interface F1000Membership {
  member: boolean;
  invite: F1000Invite | null;
  stats: F1000Stats;
}

/** POST /v1/f1000/claim */
export interface F1000ClaimBody {
  code: string;
}

export interface F1000ClaimResponse {
  code: string;
  seq: number;
  alreadyClaimed: boolean;
  member: true;
}

/** GET /v1/f1000/random-code — a single-use code for the QR scan flow */
export interface F1000RandomCode {
  code?: string;
  message?: string;
}
