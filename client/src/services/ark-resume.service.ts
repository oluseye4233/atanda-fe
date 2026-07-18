import { apiClient } from "./api";

export type ConfirmationClaimType = "EMPLOYMENT" | "CERTIFICATION" | "SKILL";
export type ConfirmationStatus = "CONFIRMED" | "PENDING" | "REJECTED" | "UNVERIFIED";
export type ConfirmationInviteStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface ArkResumeStandardsMappings {
  onet?: string[];
  wef?: string[];
  sfia?: string[];
}

export interface ArkResumeConfirmation {
  type: ConfirmationClaimType;
  targetRef: string;
  status: ConfirmationStatus;
  confirmerOrg?: string | null;
  confirmerLogoUrl?: string | null;
}

export interface ArkResumeCard {
  cardId: string;
  emoji: string;
  name: string;
  category: string;
  tier: string | null;
  mappings?: ArkResumeStandardsMappings | null;
}

export interface ArkResumeWorkHistoryItem {
  company: string | null;
  role?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  highlights?: string[];
  mappedCards: ArkResumeCard[];
  confirmation?: ArkResumeConfirmation | null;
}

export interface ArkResume {
  user: {
    name: string;
    arkScore: number;
    arkIdString?: string | null;
    headshotDataUrl?: string | null;
  };
  identity: {
    currentRole: string | null;
    currentEmployer: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    location: string | null;
    linkLinkedin: string | null;
    linkGithub: string | null;
    linkPortfolio: string | null;
  };
  jst: { total: number; jobs: number; skills: number; talent: number };
  ats: {
    score: number;
    band: string;
    items?: Array<{ label: string; points: number; max: number }>;
  };
  verifiedDeck: ArkResumeCard[];
  workHistory: ArkResumeWorkHistoryItem[];
  education: string[];
  certifications: string[];
  confirmations?: ArkResumeConfirmation[];
}

export interface ConfirmationInvite {
  id: string;
  status: ConfirmationInviteStatus;
  targetRef: string;
  targetLabel?: string | null;
  recipientEmail: string;
}

export interface CreateConfirmationInviteRequest {
  type: ConfirmationClaimType;
  targetRef: string;
  targetLabel: string;
  recipientEmail: string;
  recipientName?: string;
  recipientOrg?: string;
  note?: string;
}

export interface ConfirmationInviteResponse {
  path: string;
  link?: string;
  emailSent?: boolean;
  emailError?: string | null;
}

export const arkResumeService = {
  getResume: () => apiClient.get<ArkResume>("/ark-resume"),

  setHeadshot: (dataUrl: string) =>
    apiClient.post<{ ok: boolean; headshotDataUrl: string | null }>("/ark-resume/headshot", { dataUrl }),

  deleteHeadshot: () => apiClient.delete<{ ok: boolean }>("/ark-resume/headshot"),

  listConfirmationInvites: () =>
    apiClient.get<ConfirmationInvite[]>("/ark-resume/confirmation-invites"),

  createConfirmationInvite: (body: CreateConfirmationInviteRequest) =>
    apiClient.post<ConfirmationInviteResponse>("/ark-resume/confirmation-invites", body),

  revokeConfirmationInvite: (id: string) =>
    apiClient.post<{ ok: boolean }>(`/ark-resume/confirmation-invites/${encodeURIComponent(id)}/revoke`),

  resendConfirmationInvite: (id: string) =>
    apiClient.post<ConfirmationInviteResponse>(`/ark-resume/confirmation-invites/${encodeURIComponent(id)}/resend`),
};
