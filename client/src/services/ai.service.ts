import { apiClient } from "./api";
import type {
  AiStatus,
  AiModelsResponse,
  ResumeNarrative,
  JobRoleGuide,
  GenerateScenarioBody,
  GeneratedScenario,
} from "@/types/ai";

export const aiService = {
  /** GET /v1/ai/status */
  getStatus: () =>
    apiClient.get<AiStatus>("/ai/status"),

  /** GET /v1/ai/models */
  getModels: () =>
    apiClient.get<AiModelsResponse>("/ai/models"),

  /** PUT /v1/ai/model-preference */
  setModelPreference: (model: string | null) =>
    apiClient.put<{ model: string | null }>("/ai/model-preference", { model }),

  /**
   * POST /v1/ai/resume-narrative/:assessmentId
   * Pro+ plan required per AI tier policy.
   */
  getResumeNarrative: (assessmentId: string) =>
    apiClient.post<ResumeNarrative>(`/ai/resume-narrative/${assessmentId}`),

  /**
   * POST /v1/ai/job-role-guide
   * Globally cached — safe to call on every page load.
   */
  getJobRoleGuide: (role: string) =>
    apiClient.post<JobRoleGuide>("/ai/job-role-guide", { role }),

  /** POST /v1/admin/ai/generate-scenario — admin/staff */
  generateScenario: (body: GenerateScenarioBody) =>
    apiClient.post<GeneratedScenario>("/admin/ai/generate-scenario", body),
};
