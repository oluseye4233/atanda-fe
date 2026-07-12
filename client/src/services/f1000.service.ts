import { apiClient } from "./api";
import type { F1000Stats, F1000ClaimBody, F1000ClaimResponse } from "@/types/f1000";

export const f1000Service = {
  /** GET /v1/f1000/stats — live founding-member counter */
  getStats: () =>
    apiClient.get<F1000Stats>("/f1000/stats"),

  /**
   * POST /v1/f1000/claim
   * Rate-limited to 10/min. Re-claiming your own code is idempotent.
   */
  claim: (body: F1000ClaimBody) =>
    apiClient.post<F1000ClaimResponse>("/f1000/claim", body),
};
