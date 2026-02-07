import { eq, and, isNull, desc, lt, sql } from "drizzle-orm";
import { db } from "../../db";
import { notifications } from "../../schema/tables";
import type { InsertNotification, NotificationResponse } from "../../dto";

// Database row type (data is unknown from Drizzle)
type NotificationRow = {
  id: string;
  tenantId: string | null;
  recipientUserId: string;
  actorUserId: string | null;
  type: string;
  title: string;
  body: string;
  deepLink: string | null;
  data: unknown;
  batchKey: string | null;
  createdAt: Date;
  readAt: Date | null;
  archivedAt: Date | null;
};

/**
 * Transform database notification to response DTO
 */
function toNotificationResponse(n: NotificationRow): NotificationResponse {
  return {
    id: n.id,
    tenantId: n.tenantId,
    recipientUserId: n.recipientUserId,
    actorUserId: n.actorUserId,
    type: n.type,
    title: n.title,
    body: n.body,
    deepLink: n.deepLink,
    data: n.data as Record<string, unknown> | null,
    createdAt: n.createdAt,
    readAt: n.readAt,
    archivedAt: n.archivedAt,
  };
}

export const NotificationQueries = {
  /**
   * Find notification by ID
   */
  findById: async (id: string): Promise<NotificationResponse | null> => {
    const result = await db.query.notifications.findFirst({
      where: eq(notifications.id, id),
    });
    return result ? toNotificationResponse(result) : null;
  },

  /**
   * Get paginated inbox for user
   */
  getInbox: async (
    userId: string,
    options: { cursor?: string; limit?: number } = {}
  ): Promise<{
    notifications: NotificationResponse[];
    nextCursor: string | null;
    hasMore: boolean;
  }> => {
    const { cursor, limit = 20 } = options;

    const conditions = [
      eq(notifications.recipientUserId, userId),
      isNull(notifications.archivedAt),
    ];

    if (cursor) {
      conditions.push(lt(notifications.id, cursor));
    }

    const results = await db.query.notifications.findMany({
      where: and(...conditions),
      orderBy: [desc(notifications.createdAt)],
      limit: limit + 1,
    });

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

    return {
      notifications: items.map(toNotificationResponse),
      nextCursor,
      hasMore,
    };
  },

  /**
   * Get unread count for user
   */
  getUnreadCount: async (userId: string): Promise<number> => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientUserId, userId),
          isNull(notifications.readAt),
          isNull(notifications.archivedAt)
        )
      );
    return Number(result[0]?.count || 0);
  },

  /**
   * Create notification
   */
  create: async (data: InsertNotification): Promise<NotificationResponse> => {
    const [result] = await db.insert(notifications).values(data).returning();
    return toNotificationResponse(result);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string, userId: string): Promise<void> => {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.recipientUserId, userId)));
  },

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead: async (userId: string): Promise<void> => {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.recipientUserId, userId), isNull(notifications.readAt)));
  },

  /**
   * Archive notification
   */
  archive: async (id: string, userId: string): Promise<void> => {
    await db
      .update(notifications)
      .set({ archivedAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.recipientUserId, userId)));
  },
};
