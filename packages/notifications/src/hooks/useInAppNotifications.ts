import { useCallback } from "react";
import { inAppNotificationService } from "../services/inApp";
import { useNotificationStore } from "../stores/notificationStore";
import type { InAppNotification } from "../types";

/**
 * Hook to manage in-app notifications
 * Provides methods to show, dismiss, and manage in-app notifications
 */
export const useInAppNotifications = () => {
  const { inAppNotifications, unreadCount } = useNotificationStore();
  const { removeNotification, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  /**
   * Show an in-app notification
   */
  const show = useCallback((notification: Omit<InAppNotification, "id" | "createdAt">) => {
    inAppNotificationService.show(notification);
  }, []);

  /**
   * Show a success notification
   */
  const success = useCallback((title: string, message: string, autoHide = true) => {
    inAppNotificationService.success(title, message, autoHide);
  }, []);

  /**
   * Show an error notification
   */
  const error = useCallback((title: string, message: string, autoHide = false) => {
    inAppNotificationService.error(title, message, autoHide);
  }, []);

  /**
   * Show a warning notification
   */
  const warning = useCallback((title: string, message: string, autoHide = true) => {
    inAppNotificationService.warning(title, message, autoHide);
  }, []);

  /**
   * Show an info notification
   */
  const info = useCallback((title: string, message: string, autoHide = true) => {
    inAppNotificationService.info(title, message, autoHide);
  }, []);

  /**
   * Dismiss a notification
   */
  const dismiss = useCallback(
    (notificationId: string) => {
      removeNotification(notificationId);
    },
    [removeNotification]
  );

  /**
   * Mark notification as read
   */
  const read = useCallback(
    (notificationId: string) => {
      markAsRead(notificationId);
    },
    [markAsRead]
  );

  /**
   * Mark all notifications as read
   */
  const readAll = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  /**
   * Clear all notifications
   */
  const clear = useCallback(() => {
    clearAll();
  }, [clearAll]);

  return {
    notifications: inAppNotifications,
    unreadCount,
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    read,
    readAll,
    clear,
  };
};
