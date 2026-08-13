import { apiClient } from "./api";
import type {
  F1000Membership,
  F1000Stats,
  F1000ClaimBody,
  F1000ClaimResponse,
} from "@/types/f1000";

export const f1000Service = {
  /** GET /v1/f1000/stats — live founding-member counter */
  getStats: () =>
    apiClient.get<F1000Stats>("/f1000/stats"),

  /** GET /v1/f1000/me — authenticated founding-member status */
  getMe: () =>
    apiClient.get<F1000Membership>("/f1000/me"),

  /**
   * POST /v1/f1000/claim
   * Rate-limited to 10/min. Re-claiming your own code is idempotent.
   * The server auto-allocates a code for the signed-in account, so no body
   * is required for the standard claim flow.
   */
  claim: (body?: F1000ClaimBody) =>
    apiClient.post<F1000ClaimResponse>("/f1000/claim", body ?? {}),
};
