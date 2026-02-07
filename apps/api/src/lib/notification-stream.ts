/**
 * Notification Stream
 *
 * In-memory pub/sub for real-time notification delivery via SSE.
 * Publishes events for:
 * - new: New notification created
 * - read: Notification marked as read
 * - archived: Notification archived
 * - refresh: General refresh signal (e.g., mark all as read)
 */

import type { Notification } from "@app/database";

export type NotificationEventType = "new" | "read" | "archived" | "refresh";

export interface NotificationEvent {
  type: NotificationEventType;
  notification?: Notification;
  notificationId?: string;
}

type NotificationCallback = (event: NotificationEvent) => void;

/**
 * Simple in-memory pub/sub for notification streaming
 */
class NotificationStream {
  // Map of userId -> Set of callbacks (multiple tabs/devices)
  private subscribers: Map<string, Set<NotificationCallback>> = new Map();

  /**
   * Subscribe to notifications for a user
   * Returns unsubscribe function
   */
  subscribe(userId: string, callback: NotificationCallback): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const userSubs = this.subscribers.get(userId);
      if (userSubs) {
        userSubs.delete(callback);
        if (userSubs.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  /**
   * Publish an event to a user's connected clients
   */
  private publishEvent(userId: string, event: NotificationEvent): void {
    const userSubs = this.subscribers.get(userId);
    if (!userSubs || userSubs.size === 0) {
      return;
    }

    userSubs.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("[NotificationStream] Error in subscriber callback");
      }
    });
  }

  /**
   * Publish a new notification to a user's connected clients
   */
  publish(userId: string, notification: Notification): void {
    this.publishEvent(userId, { type: "new", notification });
  }

  /**
   * Notify clients that a notification was marked as read
   */
  publishRead(userId: string, notificationId: string): void {
    this.publishEvent(userId, { type: "read", notificationId });
  }

  /**
   * Notify clients that a notification was archived
   */
  publishArchived(userId: string, notificationId: string): void {
    this.publishEvent(userId, { type: "archived", notificationId });
  }

  /**
   * Notify clients to refresh their notification list
   * Used for bulk operations like "mark all as read"
   */
  publishRefresh(userId: string): void {
    this.publishEvent(userId, { type: "refresh" });
  }

  /**
   * Check if a user has any active connections
   */
  isConnected(userId: string): boolean {
    const userSubs = this.subscribers.get(userId);
    return !!userSubs && userSubs.size > 0;
  }

  /**
   * Get number of connected users (for monitoring)
   */
  getConnectedUserCount(): number {
    return this.subscribers.size;
  }

  /**
   * Get total number of connections (for monitoring)
   */
  getTotalConnectionCount(): number {
    let count = 0;
    this.subscribers.forEach((subs) => {
      count += subs.size;
    });
    return count;
  }
}

// Singleton instance
export const notificationStream = new NotificationStream();
