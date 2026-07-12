import { apiClient } from "./api";
import type {
  AuthUser,
  CreateUserBody,
  UpdateUserBody,
  ListUsersParams,
  PaginatedResponse,
} from "@/types/users";

export const usersService = {
  /** GET /v1/users — admin/staff */
  list: (params?: ListUsersParams) =>
    apiClient.get<PaginatedResponse<AuthUser>>("/users", { params }),

  /** GET /v1/users/:id — admin/staff */
  get: (id: string) =>
    apiClient.get<AuthUser>(`/users/${id}`),

  /** POST /v1/users — admin */
  create: (body: CreateUserBody) =>
    apiClient.post<AuthUser>("/users", body),

  /** PATCH /v1/users/:id — admin */
  update: (id: string, body: UpdateUserBody) =>
    apiClient.patch<AuthUser>(`/users/${id}`, body),

  /** DELETE /v1/users/:id — admin */
  remove: (id: string) =>
    apiClient.delete<{ message: string }>(`/users/${id}`),

  /** PATCH /v1/users/:id/deactivate — admin/staff */
  deactivate: (id: string) =>
    apiClient.patch<{ message: string }>(`/users/${id}/deactivate`),
};
