import { apiClient } from "./api";
import type {
  DeleteAccountBody,
  ProfileCredits,
  ProfileUpdate,
  SpcSalesSummary,
} from "@/types/profile";

export const profileService = {
  getCredits: (userId: string) =>
    apiClient.get<ProfileCredits>(`/users/${userId}/credits`),

  getSpcSales: (userId: string) =>
    apiClient.get<SpcSalesSummary>(`/sphinx/sales/user/${userId}`),

  update: (userId: string, body: ProfileUpdate) =>
    apiClient.patch<ProfileUpdate>(`/users/${userId}`, body),

  exportData: () =>
    apiClient.get<Blob>("/users/me/export", { responseType: "blob" }),

  deleteAccount: (body: DeleteAccountBody) =>
    apiClient.delete<void>("/users/me", { data: body }),
};
