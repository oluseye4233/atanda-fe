import { apiClient } from "./api";
import type { PaginatedResponse, PaginationParams } from "@/types/users";
import type { Assessment, AnalyzeResponse, ResumeCount } from "@/types/resume";

export const resumeService = {
  /**
   * POST /v1/resume/upload — multipart/form-data (≤20 MB)
   * Uploads a résumé file, analyzes it, and recalculates ARK identity.
   *
   * Content-Type must be explicitly cleared (not set to a fixed
   * "multipart/form-data" string, which lacks the required boundary
   * parameter). `apiClient` defaults to "application/json" for every
   * request, which — if left in place here — makes axios JSON-stringify the
   * FormData instead of sending it as multipart. Overriding it to
   * `undefined` for this one request lets axios pass the FormData through
   * untouched, so the browser's XHR sets the correct
   * "multipart/form-data; boundary=..." header itself.
   */
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<AnalyzeResponse>("/resume/upload", fd, {
      headers: { "Content-Type": undefined },
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

  /** GET /v1/resume-counts — admin/staff */
  listCounts: (params?: PaginationParams & { id?: string; userId?: string; search?: string }) =>
    apiClient.get<PaginatedResponse<ResumeCount>>("/resume-counts", { params }),
};
