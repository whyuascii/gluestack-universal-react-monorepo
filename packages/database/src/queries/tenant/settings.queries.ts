import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "../../db";
import { notificationPreferences, tenantMembers, user } from "../../schema/tables";
import type {
  NotificationPreferences,
  InsertNotificationPreferences,
  UpdateNotificationPreferences,
} from "../../dto";

/**
 * Notification Preferences Queries
 */
export const NotificationPreferencesQueries = {
  /**
   * Find notification preferences by user ID (global preferences, no tenant)
   */
  findByUserId: async (userId: string): Promise<NotificationPreferences | null> => {
    const result = await db.query.notificationPreferences.findFirst({
      where: and(
        eq(notificationPreferences.userId, userId),
        isNull(notificationPreferences.tenantId)
      ),
    });
    return result ?? null;
  },

  /**
   * Find notification preferences by user and tenant
   */
  findByUserAndTenant: async (
    userId: string,
    tenantId: string
  ): Promise<NotificationPreferences | null> => {
    const result = await db.query.notificationPreferences.findFirst({
      where: and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.tenantId, tenantId)
      ),
    });
    return result ?? null;
  },

  /**
   * Create notification preferences
   */
  create: async (data: InsertNotificationPreferences): Promise<NotificationPreferences> => {
    const [result] = await db.insert(notificationPreferences).values(data).returning();
    return result;
  },

  /**
   * Update notification preferences
   */
  update: async (
    id: string,
    data: UpdateNotificationPreferences
  ): Promise<NotificationPreferences> => {
    const [result] = await db
      .update(notificationPreferences)
      .set(data)
      .where(eq(notificationPreferences.id, id))
      .returning();
    return result;
  },

  /**
   * Upsert notification preferences for a user (global, no tenant)
   */
  upsertForUser: async (
    userId: string,
    data: UpdateNotificationPreferences
  ): Promise<NotificationPreferences> => {
    const existing = await NotificationPreferencesQueries.findByUserId(userId);

    if (existing) {
      return NotificationPreferencesQueries.update(existing.id, data);
    }

    return NotificationPreferencesQueries.create({
      userId,
      inAppEnabled: data.inAppEnabled ?? true,
      pushEnabled: data.pushEnabled ?? false,
      emailEnabled: data.emailEnabled ?? true,
      marketingEmailEnabled: data.marketingEmailEnabled ?? false,
    });
  },
};

/**
 * Member response type with user info
 */
export type MemberWithUser = {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date;
  userName: string;
  userEmail: string;
  userImage: string | null;
};

/**
 * Settings Member Queries (for member management in settings)
 */
export const SettingsMemberQueries = {
  /**
   * Get all members of a tenant with user details
   */
  getMembersWithUserDetails: async (tenantId: string): Promise<MemberWithUser[]> => {
    const results = await db
      .select({
        id: tenantMembers.id,
        userId: tenantMembers.userId,
        role: tenantMembers.role,
        joinedAt: tenantMembers.joinedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(tenantMembers)
      .innerJoin(user, eq(tenantMembers.userId, user.id))
      .where(eq(tenantMembers.tenantId, tenantId));

    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      role: r.role,
      joinedAt: r.joinedAt,
      userName: r.userName,
      userEmail: r.userEmail,
      userImage: r.userImage,
    }));
  },

  /**
   * Count owners in a tenant
   */
  countOwners: async (tenantId: string): Promise<number> => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.role, "owner")));
    return Number(result[0]?.count || 0);
  },
};
