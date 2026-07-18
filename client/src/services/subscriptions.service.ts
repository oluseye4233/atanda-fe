import { apiClient } from "./api";
import type {
  Subscription,
  CreateSubscriptionBody,
  CreateSubscriptionResponse,
  UpdateSubscriptionBody,
  ListSubscriptionsParams,
  PaginatedResponse,
} from "@/types/subscriptions";

export const subscriptionsService = {
  /** GET /v1/subscriptions/me — authenticated */
  getMine: () =>
    apiClient.get<Subscription>("/subscriptions/me"),

  /** GET /v1/subscriptions — admin/staff */
  list: (params?: ListSubscriptionsParams) =>
    apiClient.get<PaginatedResponse<Subscription>>("/subscriptions", { params }),

  /** GET /v1/subscriptions/:id — admin/staff */
  get: (id: string) =>
    apiClient.get<Subscription>(`/subscriptions/${id}`),

  /**
   * POST /v1/subscriptions — authenticated
   * Starts a Stripe Checkout. Send Idempotency-Key header for safe retries.
   */
  create: (body: CreateSubscriptionBody, idempotencyKey?: string) =>
    apiClient.post<CreateSubscriptionResponse>("/subscriptions", body, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    }),

  /** PATCH /v1/subscriptions/:id — authenticated */
  update: (id: string, body: UpdateSubscriptionBody) =>
    apiClient.patch<Subscription>(`/subscriptions/${id}`, body),

  /** DELETE /v1/subscriptions/:id — admin/staff */
  remove: (id: string) =>
    apiClient.delete<{ message: string }>(`/subscriptions/${id}`),
};
