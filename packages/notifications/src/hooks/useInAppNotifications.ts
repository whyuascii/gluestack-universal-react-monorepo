/**
 * useInAppNotifications Hook
 *
 * Simplified hook for just in-app notification badge count
 */

import { useNotifications } from "./useNotifications";

export function useInAppNotifications(userId?: string) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  return {
    notifications,
    unreadCount,
    hasUnread: unreadCount > 0,
    markAsRead,
    markAllAsRead,
  };
}
