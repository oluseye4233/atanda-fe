export interface VerificationRow {
  cardId: string;
  score: number;
  tier: string | null;
  status: string;
  attempts: number;
}

export type VerificationDocumentKind = "DOCUMENT" | "CERTIFICATION";

export interface VerificationDocument {
  id: string;
  cardId: string;
  kind: VerificationDocumentKind;
  fileName: string;
  mimeType: string;
  label: string | null;
  dataUrl: string;
}

export interface AddVerificationDocumentBody {
  kind: VerificationDocumentKind;
  fileName: string;
  dataUrl: string;
}
