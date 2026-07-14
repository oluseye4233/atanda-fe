import { apiClient } from "./api";
import type {
  MarkNotificationsReadBody,
  NotificationsResponse,
} from "@/types/notifications";

export const notificationsService = {
  list: () =>
    apiClient.get<NotificationsResponse>("/notifications"),

  markRead: (ids?: string[]) => {
    const body: MarkNotificationsReadBody = ids ? { ids } : {};
    return apiClient.post<void>("/notifications/read", body);
  },
};
