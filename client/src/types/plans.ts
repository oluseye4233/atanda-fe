import type { PaginationParams, PaginatedResponse } from "./users";

export type { PaginationParams, PaginatedResponse };

// ── Plan rule ─────────────────────────────────────────────────────────────────

export interface PlanRule {
  resumeUploads: "unlimited" | number;
  jstScore: boolean;
  fullDashboard: boolean;
  careerPathways: boolean;
  forgeCards: boolean;
  executiveReport: boolean;
  contextCraft: boolean;
  workforceIntel: boolean;
  institutionDashboard: boolean;
  prioritySupport: boolean;
  /** Full ARK RESUME access. Not currently returned by `/v1/plans/public`, so the client falls back to plan-title gating. */
  arkResume?: boolean;
}

// ── Plan object ───────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  title: string;
  freeTrial: boolean;
  description: string | null;
  features: string[];
  planRule: PlanRule;
  monthlyPrice: string;
  yearlyPrice: string;
  stripeMonthlyId: string | null;
  stripeYearlyId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface CreatePlanBody {
  title: string;
  freeTrial?: boolean;
  description?: string;
  features: string[];
  planRule: PlanRule;
  monthlyPrice: string;
  yearlyPrice: string;
  stripeMonthlyId?: string;
  stripeYearlyId?: string;
}

export type UpdatePlanBody = Partial<CreatePlanBody>;

export interface ListPlansParams extends PaginationParams {
  search?: string;
  freeTrial?: boolean;
}
