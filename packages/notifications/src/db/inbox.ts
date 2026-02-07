/**
 * Inbox Operations
 * Database operations for the notifications table
 */

import { db } from "@app/database";
import {
  notifications,
  notificationDeliveries,
  type InsertNotification,
  type Notification,
  type NotificationType,
} from "@app/database";
import { eq, and, isNull, desc, sql } from "drizzle-orm";

export interface CreateInboxEntryParams {
  tenantId: string;
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body: string;
  deepLink?: string;
  data?: Record<string, unknown>;
  actorUserId?: string;
  batchKey?: string;
}

/**
 * Create a notification entry in the inbox
 */
export async function createInboxEntry(params: CreateInboxEntryParams): Promise<Notification> {
  const [notification] = await db
    .insert(notifications)
    .values({
      tenantId: params.tenantId,
      recipientUserId: params.recipientUserId,
      actorUserId: params.actorUserId,
      type: params.type,
      title: params.title,
      body: params.body,
      deepLink: params.deepLink,
      data: params.data,
      batchKey: params.batchKey,
    })
    .returning();

  if (!notification) {
    throw new Error("Failed to create notification");
  }

  return notification as Notification;
}

/**
 * Get inbox for a user in a tenant
 */
export async function getInbox(params: {
  userId: string;
  tenantId: string;
  limit?: number;
  offset?: number;
}): Promise<Notification[]> {
  const limit = params.limit || 20;
  const offset = params.offset || 0;

  const results = await db.query.notifications.findMany({
    where: and(
      eq(notifications.tenantId, params.tenantId),
      eq(notifications.recipientUserId, params.userId),
      isNull(notifications.archivedAt)
    ),
    orderBy: [desc(notifications.createdAt)],
    limit,
    offset,
  });

  return results as Notification[];
}

/**
 * Get unread count for a user in a tenant
 */
export async function getUnreadCount(params: {
  userId: string;
  tenantId: string;
}): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.tenantId, params.tenantId),
        eq(notifications.recipientUserId, params.userId),
        isNull(notifications.readAt),
        isNull(notifications.archivedAt)
      )
    );

  return Number(result[0]?.count || 0);
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

/**
 * Mark all notifications as read for a user in a tenant
 */
export async function markAllAsRead(params: { userId: string; tenantId: string }): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.tenantId, params.tenantId),
        eq(notifications.recipientUserId, params.userId),
        isNull(notifications.readAt)
      )
    );
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ archivedAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

/**
 * Get notifications by batch key (for batching)
 */
export async function getBatchedNotifications(batchKey: string): Promise<Notification[]> {
  const results = await db.query.notifications.findMany({
    where: eq(notifications.batchKey, batchKey),
    orderBy: [desc(notifications.createdAt)],
  });

  return results as Notification[];
}

/**
 * Generate batch key for grouping notifications
 * Format: actorId_type_roundedTimestamp
 */
export function generateBatchKey(actorUserId: string | undefined, type: NotificationType): string {
  if (!actorUserId) {
    return `system_${type}_${Math.floor(Date.now() / 60000)}`; // Round to minute
  }
  return `${actorUserId}_${type}_${Math.floor(Date.now() / 60000)}`;
}
