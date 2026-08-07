import { apiClient } from "./api";
import type {
  Plan,
  CreatePlanBody,
  UpdatePlanBody,
  ListPlansParams,
  PaginatedResponse,
} from "@/types/plans";

export const plansService = {
  /** GET /v1/plans — admin/staff */
  list: (params?: ListPlansParams) =>
    apiClient.get<PaginatedResponse<Plan>>("/plans", { params }),

  /** GET /v1/plans/:id — admin/staff */
  get: (id: string) =>
    apiClient.get<Plan>(`/plans/${id}`),

  /** POST /v1/plans — authenticated */
  create: (body: CreatePlanBody) =>
    apiClient.post<Plan>("/plans", body),

  /** PATCH /v1/plans/:id — authenticated */
  update: (id: string, body: UpdatePlanBody) =>
    apiClient.patch<Plan>(`/plans/${id}`, body),

  /** DELETE /v1/plans/:id — admin/staff */
  remove: (id: string) =>
    apiClient.delete<{ message: string }>(`/plans/${id}`),

  /** POST /v1/plans/:id/sync-stripe — admin/staff */
  syncStripe: (id: string) =>
    apiClient.post<Plan>(`/plans/${id}/sync-stripe`),

  /** GET /v1/plans/public — public endpoint for landing page pricing */
  getPublic: () =>
    apiClient.get<Plan[]>("/plans/public"),
};