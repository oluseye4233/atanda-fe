import { apiClient } from "./api";
import type {
  AddVerificationDocumentBody,
  VerificationDocument,
  VerificationRow,
} from "@/types/verification-evidence";

export const verificationEvidenceService = {
  getStatus: () =>
    apiClient.get<VerificationRow[]>("/verification/status"),

  listDocuments: (cardId: string) =>
    apiClient.get<VerificationDocument[]>(`/verification/documents/${cardId}`),

  addDocument: (cardId: string, body: AddVerificationDocumentBody) =>
    apiClient.post<VerificationDocument>(`/verification/documents/${cardId}`, body),

  deleteDocument: (id: string) =>
    apiClient.delete<void>(`/verification/documents/${id}`),
};
