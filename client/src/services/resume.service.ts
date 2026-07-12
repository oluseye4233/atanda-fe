import { apiClient } from "./api";
import type { Assessment, AnalyzeResponse, ResumeCount } from "@/types/resume";

export const resumeService = {
  /**
   * POST /v1/resume/upload — multipart/form-data (≤20 MB)
   * Uploads a résumé file, analyzes it, and recalculates ARK identity.
   */
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<AnalyzeResponse>("/resume/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * POST /v1/assessments
   * Analyzes pasted résumé text (no file upload).
   */
  analyzeText: (resumeText: string) =>
    apiClient.post<AnalyzeResponse>("/assessments", { resumeText }),

  /** GET /v1/assessments/user/:id/latest — self or admin/staff */
  getLatest: (userId: string) =>
    apiClient.get<Assessment>(`/assessments/user/${userId}/latest`),

  /** GET /v1/assessments/user/:id — self or admin/staff */
  getAll: (userId: string) =>
    apiClient.get<{ data: Assessment[] }>(`/assessments/user/${userId}`),

  /** GET /v1/resume-counts/me — authenticated */
  getMyCount: () =>
    apiClient.get<ResumeCount>("/resume-counts/me"),
};
