/**
 * useNotifications Hook
 *
 * Access and manage in-app notifications
 */

import { useEffect, useState } from "react";
import { inAppNotificationService } from "../services/inApp";
import type { InAppNotification, NotificationState } from "../types";

export function useNotifications(userId?: string) {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    permission: "default",
  });

  useEffect(() => {
    if (!userId) return;

    // Fetch notifications on mount
    const fetchNotifications = async () => {
      const notifications = await inAppNotificationService.getNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.read).length;

      setState((prev) => ({
        ...prev,
        notifications,
        unreadCount,
      }));
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    await inAppNotificationService.markAsRead(notificationId);

    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    await inAppNotificationService.markAllAsRead(userId);

    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  };

  const deleteNotification = async (notificationId: string) => {
    await inAppNotificationService.deleteNotification(notificationId);

    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== notificationId),
      unreadCount: prev.notifications.find((n) => n.id === notificationId && !n.read)
        ? prev.unreadCount - 1
        : prev.unreadCount,
    }));
  };

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
