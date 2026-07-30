import { apiClient } from "./api";

export interface StartCheckoutBody {
  plan: string;
  institution?: string;
}

export interface CheckoutStartResponse {
  sessionId: string;
  requiresPayment: boolean;
  redirectUrl?: string;
}

export interface CheckoutSession {
  id: string;
  userId: string;
  plan: string;
  amountCents: number;
  status: "pending" | "completed" | "failed" | "canceled";
  externalSessionId: string | null;
  institution: string | null;
  redirectUrl?: string;
}

export interface CheckoutCompletionResponse {
  ok: boolean;
}

export interface CancelSubscriptionResponse {
  effectiveAt: string;
}

export const billingService = {
  startCheckout: (body: StartCheckoutBody) =>
    apiClient.post<CheckoutStartResponse>("/billing/checkout", body),

  getCheckoutSession: (id: string) =>
    apiClient.get<CheckoutSession>(`/billing/checkout/${id}`),

  completeCheckout: (id: string, success: boolean) =>
    apiClient.post<CheckoutCompletionResponse>(`/billing/checkout/${id}/complete`, { success }),

  cancelSubscription: () =>
    apiClient.post<CancelSubscriptionResponse>("/billing/subscription/cancel"),
};
