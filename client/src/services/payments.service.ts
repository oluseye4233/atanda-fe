import { apiClient } from "./api";
import type {
  Payment,
  CreatePaymentBody,
  UpdatePaymentBody,
  ListPaymentsParams,
  PaginatedResponse,
} from "@/types/payments";

export const paymentsService = {
  /** GET /v1/payments/me — authenticated */
  listMine: (params?: Pick<ListPaymentsParams, "page" | "pageSize" | "status">) =>
    apiClient.get<PaginatedResponse<Payment>>("/payments/me", { params }),

  /** GET /v1/payments — admin/staff */
  list: (params?: ListPaymentsParams) =>
    apiClient.get<PaginatedResponse<Payment>>("/payments", { params }),

  /** GET /v1/payments/:id — admin/staff */
  get: (id: string) =>
    apiClient.get<Payment>(`/payments/${id}`),

  /** POST /v1/payments — authenticated */
  create: (body: CreatePaymentBody) =>
    apiClient.post<Payment>("/payments", body),

  /** PATCH /v1/payments/:id — authenticated */
  update: (id: string, body: UpdatePaymentBody) =>
    apiClient.patch<Payment>(`/payments/${id}`, body),

  /** DELETE /v1/payments/:id — admin/staff */
  remove: (id: string) =>
    apiClient.delete<{ message: string }>(`/payments/${id}`),
};
