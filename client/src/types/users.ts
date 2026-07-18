import type { UserRole, UserType, AuthUser } from "./auth";

export type { AuthUser };

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  data: T[];
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface CreateUserBody {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  type?: UserType;
  isActive?: boolean;
  isVerified?: boolean;
  planId?: string;
}

export type UpdateUserBody = Partial<CreateUserBody>;

export interface ListUsersParams extends PaginationParams {
  search?: string;
  role?: UserRole;
  type?: UserType;
}
