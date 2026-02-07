/**
 * Notification Targets
 * Manage push notification subscription mapping and user activity tracking.
 *
 * Stack:
 * - Novu: novuSubscriberId (in-app notifications + push orchestration)
 * - Expo Push: expoPushToken (mobile push via Firebase/APNs)
 */

import { db } from "@app/database";
import {
  notificationTargets,
  type NotificationTarget,
  type UpdateNotificationTarget,
} from "@app/database";
import { eq } from "drizzle-orm";

/**
 * Get notification target for a user
 */
export async function getNotificationTarget(
  userId: string
): Promise<NotificationTarget | undefined> {
  return db.query.notificationTargets.findFirst({
    where: eq(notificationTargets.userId, userId),
  });
}

/**
 * Create or update notification target
 */
export async function upsertNotificationTarget(
  userId: string,
  data: Partial<UpdateNotificationTarget>
): Promise<NotificationTarget> {
  const existing = await getNotificationTarget(userId);

  if (existing) {
    // Update existing
    const [updated] = await db
      .update(notificationTargets)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(notificationTargets.id, existing.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update notification target");
    }

    return updated;
  }

  // Create new
  const [created] = await db
    .insert(notificationTargets)
    .values({
      userId,
      // Novu uses userId as subscriber ID
      novuSubscriberId: userId,
      expoPushToken: data.expoPushToken,
      lastActiveAt: data.lastActiveAt || new Date(),
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create notification target");
  }

  return created;
}

/**
 * Update last active timestamp for a user
 */
export async function updateLastActive(userId: string): Promise<void> {
  await upsertNotificationTarget(userId, {
    lastActiveAt: new Date(),
  });
}

/**
 * Check if user is currently active
 * @param userId User ID
 * @param thresholdSeconds How many seconds ago to consider "active" (default: 120)
 */
export async function isUserActive(
  userId: string,
  thresholdSeconds: number = 120
): Promise<boolean> {
  const target = await getNotificationTarget(userId);

  if (!target?.lastActiveAt) {
    return false;
  }

  const thresholdMs = thresholdSeconds * 1000;
  const timeSinceActive = Date.now() - target.lastActiveAt.getTime();

  return timeSinceActive < thresholdMs;
}
