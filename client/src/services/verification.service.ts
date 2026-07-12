import { apiClient } from "./api";
import type {
  VerificationQuest,
  VerificationPrompt,
  SubmitVerificationResponse,
} from "@/types/verification";

export const verificationService = {
  /** GET /v1/verification/quest/:cardId */
  getQuest: (cardId: string) =>
    apiClient.get<VerificationQuest>(`/verification/quest/${cardId}`),

  /**
   * POST /v1/verification/submit
   * Only cards on the user's own assessment can be submitted.
   */
  submit: (cardId: string, prompts: VerificationPrompt[]) =>
    apiClient.post<SubmitVerificationResponse>("/verification/submit", {
      cardId,
      prompts,
    }),
};
