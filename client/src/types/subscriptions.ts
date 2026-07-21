import type { PaginationParams, PaginatedResponse } from "./users";

export type { PaginationParams, PaginatedResponse };

export type SubscriptionStatus = "active" | "inactive";
export type SubscriptionDuration = "monthly" | "yearly";

export interface SubscriptionPlanSummary {
  planId: string;
  title: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus | null;
  stripeSubscriptionId: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlanSummary | null;
}

export interface CreateSubscriptionBody {
  planId: string;
  duration: SubscriptionDuration;
}

export interface CreateSubscriptionResponse {
  checkoutUrl: string;
  checkoutSessionId: string;
  subscriptionId: string;
  paymentId: string;
  status: string;
  idempotentReplay: boolean;
}

export interface UpdateSubscriptionBody {
  planId?: string;
  status?: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  duration?: SubscriptionDuration;
}

export interface ListSubscriptionsParams extends PaginationParams {
  userId?: string;
  planId?: string;
  status?: SubscriptionStatus;
}
