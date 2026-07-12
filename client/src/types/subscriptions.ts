import type { PaginationParams, PaginatedResponse } from "./users";

export type { PaginationParams, PaginatedResponse };

export type SubscriptionStatus = "active" | "inactive";
export type SubscriptionDuration = "monthly" | "yearly";

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus | null;
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
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
