import { apiClient } from "./api";
import type {
  Opportunity,
  CreateOpportunityBody,
  OpportunityDetail,
  AssembleTeamBody,
  AssembleTeamResponse,
} from "@/types/matchmaking";

export const matchmakingService = {
  /** POST /v1/matchmaking/opportunities */
  createOpportunity: (body: CreateOpportunityBody) =>
    apiClient.post<Opportunity>("/matchmaking/opportunities", body),

  /** GET /v1/matchmaking/opportunities */
  listOpportunities: () =>
    apiClient.get<{ data: Opportunity[] }>("/matchmaking/opportunities"),

  /**
   * GET /v1/matchmaking/:id
   * Returns the opportunity + scores the current user against it.
   */
  getOpportunity: (id: string) =>
    apiClient.get<OpportunityDetail>(`/matchmaking/${id}`),

  /** POST /v1/matchmaking/:id/team */
  assembleTeam: (id: string, body: AssembleTeamBody) =>
    apiClient.post<AssembleTeamResponse>(`/matchmaking/${id}/team`, body),
};
