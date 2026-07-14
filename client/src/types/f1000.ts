export interface F1000Stats {
  total: number;
  claimed: number;
  remaining: number;
}

export interface F1000Membership {
  member: boolean;
}

export interface F1000ClaimBody {
  code: string;
}

export interface F1000ClaimResponse {
  code: string;
  seq: number;
  alreadyClaimed: boolean;
  member: true;
}
