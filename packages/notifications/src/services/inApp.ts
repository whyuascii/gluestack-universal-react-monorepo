import { useNotificationStore } from "../stores/notificationStore";
import type { InAppNotification } from "../types";

/**
 * In-app notification service
 * Manages notifications shown within the app (toasts, notification center, etc.)
 */
export class InAppNotificationService {
  /**
   * Show an in-app notification
   */
  show(notification: Omit<InAppNotification, "id" | "createdAt">): void {
    const fullNotification: InAppNotification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      read: false,
    };

    useNotificationStore.getState().addNotification(fullNotification);

    // Auto-hide if configured
    if (fullNotification.autoHide) {
      const delay = fullNotification.autoHideDelay || 5000;
      setTimeout(() => {
        this.dismiss(fullNotification.id);
      }, delay);
    }
  }

  /**
   * Show a success notification
   */
  success(title: string, message: string, autoHide = true): void {
    this.show({
      type: "system",
      title,
      message,
      priority: "normal",
      dismissible: true,
      autoHide,
      autoHideDelay: 5000,
    });
  }

  /**
   * Show an error notification
   */
  error(title: string, message: string, autoHide = false): void {
    this.show({
      type: "system",
      title,
      message,
      priority: "high",
      dismissible: true,
      autoHide,
    });
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message: string, autoHide = true): void {
    this.show({
      type: "system",
      title,
      message,
      priority: "normal",
      dismissible: true,
      autoHide,
      autoHideDelay: 7000,
    });
  }

  /**
   * Show an info notification
   */
  info(title: string, message: string, autoHide = true): void {
    this.show({
      type: "system",
      title,
      message,
      priority: "low",
      dismissible: true,
      autoHide,
      autoHideDelay: 5000,
    });
  }

  /**
   * Dismiss a notification
   */
  dismiss(notificationId: string): void {
    useNotificationStore.getState().removeNotification(notificationId);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    useNotificationStore.getState().markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    useNotificationStore.getState().markAllAsRead();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    useNotificationStore.getState().clearAll();
  }

  /**
   * Generate a unique notification ID
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const inAppNotificationService = new InAppNotificationService();
