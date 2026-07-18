import type { PaginationParams, PaginatedResponse } from "./users";

export type { PaginationParams, PaginatedResponse };

export type PaymentStatus = "success" | "pending" | "failed" | "cancelled";

export interface Payment {
  id: string;
  userId: string;
  amount: string;
  paymentSuccess: PaymentStatus | null;
  paymentMeta: unknown | null;
  payment_reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentBody {
  userId: string;
  amount: string;
  paymentSuccess?: PaymentStatus;
  paymentMeta?: unknown;
  payment_reference: string;
}

export interface UpdatePaymentBody {
  amount?: string;
  paymentSuccess?: PaymentStatus;
  paymentMeta?: unknown;
}

export interface ListPaymentsParams extends PaginationParams {
  userId?: string;
  status?: PaymentStatus;
}
