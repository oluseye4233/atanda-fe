import { apiClient } from "./api";
import type {
  CcgeCard,
  CcgeScenario,
  CcgeSession,
  StartSessionResponse,
  FinishSessionBody,
  FinishSessionResponse,
} from "@/types/ccge";

export const ccgeService = {
  /** GET /v1/ccge/cards */
  getCards: () =>
    apiClient.get<{ data: CcgeCard[] }>("/ccge/cards"),

  /** GET /v1/ccge/scenarios?tier= */
  getScenarios: (tier?: string) =>
    apiClient.get<{ data: CcgeScenario[] }>("/ccge/scenarios", {
      params: tier ? { tier } : undefined,
    }),

  /** GET /v1/ccge/sessions/:id — owner only */
  getSession: (id: string) =>
    apiClient.get<CcgeSession>(`/ccge/sessions/${id}`),

  /** GET /v1/ccge/sessions/user/:id — self or admin/staff */
  getUserSessions: (userId: string) =>
    apiClient.get<{ data: CcgeSession[] }>(`/ccge/sessions/user/${userId}`),

  /** POST /v1/ccge/sessions */
  startSession: (scenarioId: string) =>
    apiClient.post<StartSessionResponse>("/ccge/sessions", { scenarioId }),

  /** POST /v1/ccge/sessions/:id/finish */
  finishSession: (id: string, body: FinishSessionBody) =>
    apiClient.post<FinishSessionResponse>(`/ccge/sessions/${id}/finish`, body),
};
