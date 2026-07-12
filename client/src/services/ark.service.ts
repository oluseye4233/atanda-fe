import { apiClient } from "./api";
import type {
  ArkIdentity,
  LhcsSignal,
  ArkHistoryResponse,
  FlywheelCta,
  RecalcResult,
} from "@/types/ark";

export const arkService = {
  /** GET /v1/ark/identity */
  getIdentity: () =>
    apiClient.get<ArkIdentity>("/ark/identity"),

  /** GET /v1/ark/lhcs */
  getLhcs: () =>
    apiClient.get<LhcsSignal>("/ark/lhcs"),

  /** GET /v1/ark/history?days=30 */
  getHistory: (days = 30) =>
    apiClient.get<ArkHistoryResponse>(`/ark/history`, { params: { days } }),

  /** GET /v1/ark/flywheel-cta */
  getFlywheelCta: () =>
    apiClient.get<FlywheelCta>("/ark/flywheel-cta"),

  /**
   * POST /v1/ark/recalc
   * Manually recomputes ARK identity. Never awards positive delta.
   */
  recalc: () =>
    apiClient.post<RecalcResult>("/ark/recalc"),

  /**
   * GET /v1/ark-score/stream — Server-Sent Events
   * Open with EventSource, not axios. Returns the URL to use.
   */
  streamUrl: () => `${apiClient.defaults.baseURL}/ark-score/stream`,
};
