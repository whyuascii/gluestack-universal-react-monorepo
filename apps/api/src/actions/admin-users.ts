/**
 * Admin Users Actions
 *
 * Business logic for viewing and managing customer users.
 */
import {
  db,
  user,
  tenantMembers,
  tenants,
  adminUserNotes,
  adminFlags,
  subscriptions,
  userActivityDaily,
  eq,
  and,
  or,
  ilike,
  count,
  desc,
  gte,
  sql,
} from "@app/database";
import type { AdminCustomerUser, AdminUserDetail } from "@app/core-contract";
import { ORPCError } from "@orpc/server";
import { createAdminAuditLog } from "./admin-audit";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// =============================================================================
// SEARCH USERS
// =============================================================================

interface SearchUsersInput {
  page: number;
  limit: number;
  query: string;
  type: "email" | "id" | "name";
}

export async function searchUsers(
  input: SearchUsersInput
): Promise<{ users: AdminCustomerUser[]; total: number }> {
  const { page, limit, query, type } = input;
  const offset = (page - 1) * limit;

  // Build search condition based on type
  let whereClause;
  if (type === "email") {
    whereClause = ilike(user.email, `%${query}%`);
  } else if (type === "id") {
    whereClause = eq(user.id, query);
  } else {
    whereClause = ilike(user.name, `%${query}%`);
  }

  // Get total count
  const [totalResult] = await db.select({ count: count() }).from(user).where(whereClause);
  const total = totalResult?.count ?? 0;

  // Get users
  const userResults = await db.query.user.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: desc(user.createdAt),
  });

  // Enrich with additional data
  const enrichedUsers: AdminCustomerUser[] = await Promise.all(
    userResults.map(async (u) => {
      // Get tenant memberships
      const memberships = await db
        .select({
          tenantId: tenantMembers.tenantId,
          tenantName: tenants.name,
          role: tenantMembers.role,
        })
        .from(tenantMembers)
        .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
        .where(eq(tenantMembers.userId, u.id));

      // Get flags
      const flagsResult = await db
        .select({ flagType: adminFlags.flagType })
        .from(adminFlags)
        .where(and(eq(adminFlags.targetType, "user"), eq(adminFlags.targetId, u.id)));

      // Get notes count
      const [notesResult] = await db
        .select({ count: count() })
        .from(adminUserNotes)
        .where(eq(adminUserNotes.userId, u.id));

      // Get subscription status (from first tenant membership)
      let subscriptionStatus: AdminCustomerUser["subscriptionStatus"] = "none";
      if (memberships.length > 0) {
        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.tenantId, memberships[0].tenantId),
          orderBy: desc(subscriptions.createdAt),
        });
        if (sub) {
          subscriptionStatus = sub.status as AdminCustomerUser["subscriptionStatus"];
        }
      }

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
        emailVerified: u.emailVerified,
        lifecycleStage: "active", // TODO: Calculate from activity
        tenantMemberships: memberships.map((m) => ({
          tenantId: m.tenantId,
          tenantName: m.tenantName,
          role: m.role,
        })),
        subscriptionStatus,
        flags: flagsResult.map((f) => f.flagType),
        notesCount: notesResult?.count ?? 0,
      };
    })
  );

  return { users: enrichedUsers, total };
}

// =============================================================================
// GET USER DETAIL
// =============================================================================

export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
  const u = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!u) {
    throw new ORPCError("NOT_FOUND", {
      message: "User not found",
    });
  }

  // Get tenant memberships
  const memberships = await db
    .select({
      tenantId: tenantMembers.tenantId,
      tenantName: tenants.name,
      role: tenantMembers.role,
    })
    .from(tenantMembers)
    .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
    .where(eq(tenantMembers.userId, u.id));

  // Get flags
  const flagsResult = await db
    .select({ flagType: adminFlags.flagType })
    .from(adminFlags)
    .where(and(eq(adminFlags.targetType, "user"), eq(adminFlags.targetId, u.id)));

  // Get notes
  const notesResult = await db
    .select({
      id: adminUserNotes.id,
      note: adminUserNotes.note,
      adminEmail: sql<string>`(SELECT email FROM admin_users WHERE id = ${adminUserNotes.adminUserId})`,
      createdAt: adminUserNotes.createdAt,
    })
    .from(adminUserNotes)
    .where(eq(adminUserNotes.userId, u.id))
    .orderBy(desc(adminUserNotes.createdAt));

  // Get subscription status
  let subscriptionStatus: AdminCustomerUser["subscriptionStatus"] = "none";
  if (memberships.length > 0) {
    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, memberships[0].tenantId),
      orderBy: desc(subscriptions.createdAt),
    });
    if (sub) {
      subscriptionStatus = sub.status as AdminCustomerUser["subscriptionStatus"];
    }
  }

  // Get activity summary
  const sevenDaysAgo = formatDate(daysAgo(7));
  const thirtyDaysAgo = formatDate(daysAgo(30));

  const [sessions7d] = await db
    .select({ count: count() })
    .from(userActivityDaily)
    .where(and(eq(userActivityDaily.userId, u.id), gte(userActivityDaily.date, sevenDaysAgo)));

  const [sessions30d] = await db
    .select({ count: count() })
    .from(userActivityDaily)
    .where(and(eq(userActivityDaily.userId, u.id), gte(userActivityDaily.date, thirtyDaysAgo)));

  const [coreActions7d] = await db
    .select({ total: sql<number>`COALESCE(SUM(${userActivityDaily.eventCount}), 0)` })
    .from(userActivityDaily)
    .where(and(eq(userActivityDaily.userId, u.id), gte(userActivityDaily.date, sevenDaysAgo)));

  // Get last activity
  const lastActivity = await db.query.userActivityDaily.findFirst({
    where: eq(userActivityDaily.userId, u.id),
    orderBy: desc(userActivityDaily.date),
  });

  return {
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    lastActiveAt: u.lastActiveAt,
    emailVerified: u.emailVerified,
    lifecycleStage: "active",
    tenantMemberships: memberships.map((m) => ({
      tenantId: m.tenantId,
      tenantName: m.tenantName,
      role: m.role,
    })),
    subscriptionStatus,
    flags: flagsResult.map((f) => f.flagType),
    notesCount: notesResult.length,
    activitySummary: {
      sessionsLast7Days: sessions7d?.count ?? 0,
      sessionsLast30Days: sessions30d?.count ?? 0,
      coreActionsLast7Days: coreActions7d?.total ?? 0,
      lastAction: lastActivity ? "app_usage" : null,
      lastActionAt: lastActivity ? new Date(lastActivity.date) : null,
    },
    notes: notesResult.map((n) => ({
      id: n.id,
      note: n.note,
      adminEmail: n.adminEmail ?? "Unknown",
      createdAt: n.createdAt,
    })),
  };
}

// =============================================================================
// GET USER ACTIVITY TIMELINE
// =============================================================================

interface GetActivityTimelineInput {
  userId: string;
  page: number;
  limit: number;
  from?: Date;
  to?: Date;
}

export async function getUserActivityTimeline(
  input: GetActivityTimelineInput
): Promise<{ events: any[]; total: number }> {
  const { userId, page, limit, from, to } = input;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [eq(userActivityDaily.userId, userId)];
  if (from) {
    conditions.push(gte(userActivityDaily.date, formatDate(from)));
  }
  if (to) {
    conditions.push(sql`${userActivityDaily.date} <= ${formatDate(to)}`);
  }

  const whereClause = and(...conditions);

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(userActivityDaily)
    .where(whereClause);
  const total = totalResult?.count ?? 0;

  // Get activity records
  const activities = await db.query.userActivityDaily.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: desc(userActivityDaily.date),
  });

  // Convert to event format
  const events = activities.map((a) => ({
    id: `${a.userId}-${a.date}`,
    event: "daily_activity",
    properties: {
      sessions: a.sessionCount,
      activeMinutes: a.activeMinutes,
      coreActions: a.eventCount,
    },
    timestamp: new Date(a.date),
  }));

  return { events, total };
}

// =============================================================================
// GET USER SUBSCRIPTIONS
// =============================================================================

export async function getUserSubscriptions(userId: string): Promise<{
  currentSubscription: any;
  history: any[];
}> {
  // Get user's tenant memberships
  const memberships = await db.query.tenantMembers.findMany({
    where: eq(tenantMembers.userId, userId),
  });

  if (memberships.length === 0) {
    return { currentSubscription: null, history: [] };
  }

  // Get subscriptions from first tenant (could be enhanced to show all)
  const tenantId = memberships[0].tenantId;

  const subs = await db.query.subscriptions.findMany({
    where: eq(subscriptions.tenantId, tenantId),
    orderBy: desc(subscriptions.createdAt),
  });

  const currentSub = subs.find((s) => s.status === "active" || s.status === "trialing");

  return {
    currentSubscription: currentSub
      ? {
          plan: currentSub.planName || currentSub.planId || "default",
          status: currentSub.status,
          startDate: currentSub.currentPeriodStart,
          currentPeriodEnd: currentSub.currentPeriodEnd,
          provider: currentSub.provider || "none",
        }
      : null,
    history: subs.map((s) => ({
      plan: s.planName || s.planId || "default",
      status: s.status,
      startDate: s.currentPeriodStart,
      endDate: s.currentPeriodEnd,
    })),
  };
}

// =============================================================================
// ADD USER NOTE
// =============================================================================

export async function addUserNote(
  userId: string,
  note: string,
  adminUserId: string
): Promise<{ id: string; createdAt: Date }> {
  // Verify user exists
  const u = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!u) {
    throw new ORPCError("NOT_FOUND", {
      message: "User not found",
    });
  }

  // Create note
  const [newNote] = await db
    .insert(adminUserNotes)
    .values({
      adminUserId,
      userId,
      note,
    })
    .returning({ id: adminUserNotes.id, createdAt: adminUserNotes.createdAt });

  // Audit log
  await createAdminAuditLog({
    adminUserId,
    action: "user.note_added",
    targetType: "user",
    targetId: userId,
    metadata: { noteId: newNote.id },
  });

  return { id: newNote.id, createdAt: newNote.createdAt };
}

// =============================================================================
// DELETE USER NOTE
// =============================================================================

export async function deleteUserNote(
  userId: string,
  noteId: string,
  adminUserId: string
): Promise<{ success: boolean }> {
  // Verify note exists
  const note = await db.query.adminUserNotes.findFirst({
    where: and(eq(adminUserNotes.id, noteId), eq(adminUserNotes.userId, userId)),
  });

  if (!note) {
    throw new ORPCError("NOT_FOUND", {
      message: "Note not found",
    });
  }

  // Delete note
  await db.delete(adminUserNotes).where(eq(adminUserNotes.id, noteId));

  // Audit log
  await createAdminAuditLog({
    adminUserId,
    action: "user.note_deleted",
    targetType: "user",
    targetId: userId,
    metadata: { noteId },
  });

  return { success: true };
}

// =============================================================================
// RESEND VERIFICATION EMAIL
// =============================================================================

export async function resendVerificationEmail(
  userId: string,
  reason: string,
  adminUserId: string
): Promise<{ success: boolean }> {
  // Verify user exists
  const u = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!u) {
    throw new ORPCError("NOT_FOUND", {
      message: "User not found",
    });
  }

  if (u.emailVerified) {
    throw new ORPCError("BAD_REQUEST", {
      message: "User email is already verified",
    });
  }

  // TODO: Actually send verification email via mailer
  // For now, just log the action

  // Audit log
  await createAdminAuditLog({
    adminUserId,
    action: "user.verification_email_resent",
    targetType: "user",
    targetId: userId,
    reason,
  });

  return { success: true };
}
