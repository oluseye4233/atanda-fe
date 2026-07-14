import { apiClient } from "./api";
import type { CreateEndorsementBody, GuinProfile } from "@/types/guin";

export const guinService = {
  getByUserId: (userId: string) =>
    apiClient.get<GuinProfile>(`/guin/user/${userId}`),

  getByUsername: (username: string) =>
    apiClient.get<GuinProfile>(`/guin/${encodeURIComponent(username)}`),

  createEndorsement: (body: CreateEndorsementBody) =>
    apiClient.post<void>("/guin/endorsements", body),
};
