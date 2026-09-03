import { apiClient } from "@/lib/api-client";

export interface NotificationDto {
  id: string;
  recipientId: string;
  channel: string;
  subject: string;
  messageBody: string;
  status: string;
  createdAt: string;
  sentAt?: string;
}

export const notificationRepository = {
  async getNotifications(): Promise<NotificationDto[]> {
    try {
      if (!apiClient.getAccessToken()) return [];
      return await apiClient.get<NotificationDto[]>("/notifications");
    } catch {
      return [];
    }
  },

  async getUnreadNotifications(): Promise<NotificationDto[]> {
    try {
      if (!apiClient.getAccessToken()) return [];
      return await apiClient.get<NotificationDto[]>("/notifications/unread");
    } catch {
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      if (!apiClient.getAccessToken()) return;
      await apiClient.put<void>(`/notifications/${id}/read`, {});
    } catch {
      // Ignore
    }
  },
};
