import { useNotificationStore } from "../stores/notificationStore";
import type { NotificationState } from "../types";

/**
 * Hook to access notification state
 * Returns all in-app notifications and their read status
 */
export const useNotifications = (): NotificationState => {
  const { inAppNotifications, unreadCount, isPermissionGranted, isPushEnabled } =
    useNotificationStore();

  return {
    inAppNotifications,
    unreadCount,
    isPermissionGranted,
    isPushEnabled,
  };
};
