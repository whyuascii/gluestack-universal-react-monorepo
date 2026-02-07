/**
 * Push Notification Service
 *
 * Handles sending push notifications via the provider system (Novu + Expo Push).
 */

import type { PushNotification } from "../types";

/**
 * Push Notification Service Interface
 */
export interface PushNotificationService {
  send(
    userId: string,
    notification: Omit<PushNotification, "id" | "createdAt" | "read">
  ): Promise<void>;
  sendToMany(
    userIds: string[],
    notification: Omit<PushNotification, "id" | "createdAt" | "read">
  ): Promise<void>;
  sendToAll(notification: Omit<PushNotification, "id" | "createdAt" | "read">): Promise<void>;
}

/**
 * Push Notification Service Implementation
 * Uses the provider system (Novu) for delivery
 */
class PushService implements PushNotificationService {
  async send(
    _userId: string,
    _notification: Omit<PushNotification, "id" | "createdAt" | "read">
  ): Promise<void> {
    // Note: For server-side push, use getPushProvider() from @app/notifications/server
    // This client-side service is a stub - actual delivery happens via the provider
  }

  async sendToMany(
    _userIds: string[],
    _notification: Omit<PushNotification, "id" | "createdAt" | "read">
  ): Promise<void> {
    // Note: For server-side push, use getPushProvider() from @app/notifications/server
  }

  async sendToAll(
    _notification: Omit<PushNotification, "id" | "createdAt" | "read">
  ): Promise<void> {
    // Note: For server-side push, use getPushProvider() from @app/notifications/server
  }
}

/**
 * Export singleton instance
 */
export const pushNotificationService: PushNotificationService = new PushService();
