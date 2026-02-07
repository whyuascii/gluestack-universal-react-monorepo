/**
 * Core Notification API
 * Main entry point for sending notifications
 *
 * Uses provider-agnostic push system - works with Novu or any
 * provider that implements PushProvider interface.
 */

import type { Notification, NotificationType } from "@app/database";
import {
  createInboxEntry,
  generateBatchKey,
  getBatchedNotifications,
  getPreferences,
  isUserActive,
  logDelivery,
} from "./db";
import { getPushProvider } from "./providers/push";
import type { SendPushParams } from "./providers/push/types";

export interface NotifyParams {
  tenantId: string;
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body: string;
  deepLink?: string;
  data?: Record<string, unknown>;
  actorUserId?: string;
}

/**
 * Active thresholds per notification type (in seconds)
 */
const ACTIVE_THRESHOLDS: Record<NotificationType, number> = {
  // Communication (less urgent, prefer in-app)
  direct_message: 300, // 5 minutes
  milestone: 300,
  kudos_sent: 300,

  // Tasks (moderate urgency)
  todo_assigned: 120, // 2 minutes
  todo_nudge: 60, // 1 minute - more urgent
  todo_completed: 180, // 3 minutes

  // Events (moderate urgency)
  event_created: 120,
  event_reminder: 60, // More urgent - upcoming event
  event_changed: 120,

  // Alerts & Limits (moderate urgency)
  achievement: 180,
  limit_alert: 60, // More urgent
  survey_created: 120,

  // System & Membership (important but not urgent)
  member_joined: 120,
  member_invited: 120,
  settings_changed: 120,
};

/**
 * Get active threshold for a notification type
 */
function getThresholdForType(type: NotificationType): number {
  return ACTIVE_THRESHOLDS[type] || 120; // Default: 2 minutes
}

/**
 * Main notification function
 *
 * Flow:
 * 1. Create inbox entry (always)
 * 2. Check user preferences
 * 3. Check if user is active
 * 4. Deliver via in-app toast OR push notification
 * 5. Log delivery
 */
export async function notify(params: NotifyParams): Promise<Notification> {
  // 1. Create inbox entry with batch key
  const batchKey = generateBatchKey(params.actorUserId, params.type);
  const notification = await createInboxEntry({ ...params, batchKey });

  // 2. Check preferences
  const prefs = await getPreferences(params.recipientUserId, params.tenantId);

  if (!prefs.inAppEnabled && !prefs.pushEnabled) {
    await logDelivery(notification.id, "in_app", "skipped", undefined, "User opted out");
    return notification;
  }

  // 3. Get threshold for this notification type
  const threshold = getThresholdForType(params.type);

  // 4. Check if user is active
  const active = await isUserActive(params.recipientUserId, threshold);

  // 5. Deliver based on activity and preferences
  if (active && prefs.inAppEnabled) {
    // User is active - client will show in-app toast
    await logDelivery(notification.id, "in_app", "sent");
  } else if (!active && prefs.pushEnabled) {
    // User is inactive - send push notification via provider
    const provider = getPushProvider();

    // Check if should batch
    const batchedNotifications = await getBatchedNotifications(batchKey);

    if (batchedNotifications.length > 1) {
      try {
        // Convert notifications to provider format
        const pushParams: SendPushParams[] = batchedNotifications.map((n) => ({
          userId: params.recipientUserId,
          title: n.title,
          body: n.body,
          type: n.type,
          deepLink: n.deepLink || undefined,
          data: (n.data as Record<string, unknown>) || undefined,
        }));

        const result = await provider.sendBatchedPush(params.recipientUserId, pushParams);
        await logDelivery(notification.id, "push", "sent", result.messageId || undefined);
      } catch (error) {
        console.error("[Notify] Failed to send batched push");
        await logDelivery(notification.id, "push", "failed", undefined, String(error));
      }
    } else {
      try {
        const result = await provider.sendPush({
          userId: params.recipientUserId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          deepLink: notification.deepLink || undefined,
          data: (notification.data as Record<string, unknown>) || undefined,
        });
        await logDelivery(notification.id, "push", "sent", result.messageId || undefined);
      } catch (error) {
        console.error("[Notify] Failed to send push");
        await logDelivery(notification.id, "push", "failed", undefined, String(error));
      }
    }
  } else {
    await logDelivery(notification.id, "in_app", "skipped", undefined, "No delivery method");
  }

  return notification;
}

/**
 * Convenience function to send a notification to multiple users
 */
export async function notifyMany(
  params: Omit<NotifyParams, "recipientUserId">,
  recipientUserIds: string[]
): Promise<Notification[]> {
  return Promise.all(
    recipientUserIds.map((recipientUserId) => notify({ ...params, recipientUserId }))
  );
}
