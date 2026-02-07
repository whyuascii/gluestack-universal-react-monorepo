/**
 * In-App Notification Service
 *
 * Handles in-app notifications (displayed within the app UI)
 */

import type { InAppNotification } from "../types";

/**
 * In-App Notification Service Interface
 */
export interface InAppNotificationService {
  getNotifications(userId: string): Promise<InAppNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
}

/**
 * In-App Notification Service Implementation
 * Stub implementation - actual logic handled by database layer
 */
class InAppNotificationServiceImpl implements InAppNotificationService {
  async getNotifications(_userId: string): Promise<InAppNotification[]> {
    // TODO: Fetch from API or local storage
    return [];
  }

  async markAsRead(_notificationId: string): Promise<void> {
    // TODO: Update notification status
  }

  async markAllAsRead(_userId: string): Promise<void> {
    // TODO: Mark all as read
  }

  async deleteNotification(_notificationId: string): Promise<void> {
    // TODO: Delete notification
  }
}

/**
 * Export singleton instance
 */
export const inAppNotificationService: InAppNotificationService =
  new InAppNotificationServiceImpl();
