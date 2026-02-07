/**
 * Notification Actions
 *
 * Business logic for notification inbox management.
 * Uses NotificationQueries for database operations.
 * Publishes SSE events for real-time sync across clients.
 */

import { NotificationQueries } from "@app/database";
import {
  upsertNotificationTarget,
  getPushProvider,
  getProviderType,
  generateSubscriberHash,
  getNovuAppId,
} from "@app/notifications/server";
import type { AuthContext } from "../middleware";
import { notificationStream } from "../lib/notification-stream";

interface GetInboxInput {
  cursor?: string;
  limit?: number;
}

interface MarkAsReadInput {
  notificationId: string;
}

interface ArchiveInput {
  notificationId: string;
}

interface RegisterPushTokenInput {
  token: string;
  platform: "ios" | "android";
  isExpoPushToken?: boolean;
}

interface RemovePushTokenInput {
  platform: "ios" | "android";
}

export class NotificationActions {
  /**
   * Get paginated inbox for the current user
   */
  static async getInbox(input: GetInboxInput, context: AuthContext) {
    return NotificationQueries.getInbox(context.user.id, {
      cursor: input.cursor,
      limit: input.limit,
    });
  }

  /**
   * Get unread notification count for the current user
   */
  static async getUnreadCount(context: AuthContext) {
    const count = await NotificationQueries.getUnreadCount(context.user.id);
    return { count };
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(input: MarkAsReadInput, context: AuthContext) {
    await NotificationQueries.markAsRead(input.notificationId, context.user.id);
    // Notify other connected clients
    notificationStream.publishRead(context.user.id, input.notificationId);
    return { success: true };
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(context: AuthContext) {
    await NotificationQueries.markAllAsRead(context.user.id);
    // Notify other connected clients to refresh
    notificationStream.publishRefresh(context.user.id);
    return { success: true };
  }

  /**
   * Archive a notification (hide from inbox)
   */
  static async archive(input: ArchiveInput, context: AuthContext) {
    await NotificationQueries.archive(input.notificationId, context.user.id);
    // Notify other connected clients
    notificationStream.publishArchived(context.user.id, input.notificationId);
    return { success: true };
  }

  /**
   * Send a test in-app notification to the current user
   * Uses Novu to send a test notification that appears in the Novu client SDK
   */
  static async sendTestNotification(
    context: AuthContext
  ): Promise<{ success: boolean; messageId?: string; error?: string; configured: boolean }> {
    const userId = context.user.id;

    // Check if Novu is configured
    const secretKey = process.env.NOVU_SECRET_KEY;

    if (!secretKey) {
      return {
        success: false,
        configured: false,
        error: "Novu is not configured. Set NOVU_SECRET_KEY environment variable.",
      };
    }

    try {
      const provider = getPushProvider();

      // Ensure user is identified as subscriber
      await provider.identifySubscriber({
        userId,
        email: context.user.email,
        firstName: context.user.name?.split(" ")[0],
        lastName: context.user.name?.split(" ").slice(1).join(" "),
      });

      // Send test in-app notification via provider
      // This will be delivered to the Novu client SDK (NovuProvider) via WebSocket
      const result = await provider.sendInApp({
        userId,
        title: "Test In-App Notification",
        body: "This is a test in-app notification. If you see this, Novu is working correctly!",
        type: "test",
        data: {
          type: "test",
          timestamp: new Date().toISOString(),
        },
      });

      if (!result.success) {
        return {
          success: false,
          configured: true,
          error: result.error || "Failed to send test notification",
        };
      }

      return {
        success: true,
        configured: true,
        messageId: result.messageId || undefined,
      };
    } catch (error) {
      console.error("[Notifications] Failed to send test notification");
      return {
        success: false,
        configured: true,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // =========================================================================
  // Push Provider Integration
  // =========================================================================

  /**
   * Register a push token for the current user
   * Stores the token in database and registers with Novu for push delivery
   */
  static async registerPushToken(input: RegisterPushTokenInput, context: AuthContext) {
    const userId = context.user.id;

    try {
      const provider = getPushProvider();

      // Identify subscriber with provider
      await provider.identifySubscriber({
        userId,
        email: context.user.email,
        firstName: context.user.name?.split(" ")[0],
        lastName: context.user.name?.split(" ").slice(1).join(" "),
      });

      // Register credentials with provider
      await provider.setCredentials(userId, {
        platform: input.platform,
        token: input.token,
        expoPushToken: input.isExpoPushToken ? input.token : undefined,
      });

      // Store token in our database
      await upsertNotificationTarget(userId, {
        expoPushToken: input.isExpoPushToken ? input.token : undefined,
        lastActiveAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("[Notifications] Failed to register push token");
      throw error;
    }
  }

  /**
   * Remove push token for the current user
   */
  static async removePushToken(input: RemovePushTokenInput, context: AuthContext) {
    const userId = context.user.id;

    try {
      const provider = getPushProvider();

      // Remove credentials from provider
      await provider.removeCredentials(userId, input.platform);

      // Clear token in our database
      await upsertNotificationTarget(userId, {
        expoPushToken: undefined,
      });

      return { success: true };
    } catch (error) {
      console.error("[Notifications] Failed to remove push token");
      throw error;
    }
  }

  /**
   * Get subscriber hash for client-side Novu authentication
   * The hash proves the subscriber ID was issued by our server
   */
  static async getSubscriberHash(context: AuthContext) {
    const userId = context.user.id;
    const hash = generateSubscriberHash(userId);

    return {
      subscriberId: userId,
      subscriberHash: hash,
    };
  }

  /**
   * Get push provider configuration for client initialization
   */
  static async getProviderConfig(_context: AuthContext) {
    const provider = getProviderType();

    return {
      provider,
      appId: provider === "novu" ? getNovuAppId() : "",
    };
  }
}
