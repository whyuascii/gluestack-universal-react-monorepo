/**
 * Notification Preferences
 * Check and manage user notification preferences
 */

import { db } from "@app/database";
import {
  notificationPreferences,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type UpdateNotificationPreferences,
} from "@app/database";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Get notification preferences for a user (tenant-specific or global)
 */
export async function getPreferences(
  userId: string,
  tenantId?: string
): Promise<NotificationPreferences> {
  // Try tenant-specific preferences first
  if (tenantId) {
    const tenantPrefs = await db.query.notificationPreferences.findFirst({
      where: and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.tenantId, tenantId)
      ),
    });

    if (tenantPrefs) {
      return tenantPrefs;
    }
  }

  // Fall back to global preferences
  const globalPrefs = await db.query.notificationPreferences.findFirst({
    where: and(
      eq(notificationPreferences.userId, userId),
      isNull(notificationPreferences.tenantId)
    ),
  });

  // If no preferences exist, return defaults (conservative)
  if (!globalPrefs) {
    return {
      id: `temp-${userId}`,
      userId,
      tenantId: tenantId || null,
      inAppEnabled: true,
      pushEnabled: false,
      emailEnabled: true,
      marketingEmailEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return globalPrefs;
}

/**
 * Create or update notification preferences
 */
export async function upsertPreferences(
  userId: string,
  tenantId: string | null,
  prefs: Partial<UpdateNotificationPreferences>
): Promise<NotificationPreferences> {
  // Check if preferences exist
  const existing = await db.query.notificationPreferences.findFirst({
    where: and(
      eq(notificationPreferences.userId, userId),
      tenantId
        ? eq(notificationPreferences.tenantId, tenantId)
        : isNull(notificationPreferences.tenantId)
    ),
  });

  if (existing) {
    // Update existing
    const [updated] = await db
      .update(notificationPreferences)
      .set({
        ...prefs,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.id, existing.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update preferences");
    }

    return updated;
  }

  // Create new
  const [created] = await db
    .insert(notificationPreferences)
    .values({
      userId,
      tenantId,
      inAppEnabled: prefs.inAppEnabled ?? true,
      pushEnabled: prefs.pushEnabled ?? false,
      emailEnabled: prefs.emailEnabled ?? true,
      marketingEmailEnabled: prefs.marketingEmailEnabled ?? false,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create preferences");
  }

  return created;
}

/**
 * Initialize default preferences for a new user
 */
export async function initializeUserPreferences(userId: string): Promise<NotificationPreferences> {
  return upsertPreferences(userId, null, {
    inAppEnabled: true,
    pushEnabled: false,
    emailEnabled: true,
    marketingEmailEnabled: false,
  });
}
