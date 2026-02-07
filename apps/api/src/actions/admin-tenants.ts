/**
 * Admin Tenants Actions
 *
 * Business logic for viewing and managing customer tenants.
 */
import {
  db,
  tenants,
  tenantMembers,
  user,
  adminTenantNotes,
  adminFlags,
  subscriptions,
  eq,
  and,
  ilike,
  count,
  desc,
  sql,
} from "@app/database";
import type { AdminTenantResponse, AdminTenantDetail } from "@app/core-contract";
import { ORPCError } from "@orpc/server";
import { createAdminAuditLog } from "./admin-audit";

// =============================================================================
// LIST TENANTS
// =============================================================================

interface ListTenantsInput {
  page: number;
  limit: number;
  search?: string;
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled" | "expired" | "none";
  hasFlag?: string;
}

export async function listTenants(
  input: ListTenantsInput
): Promise<{ tenants: AdminTenantResponse[]; total: number }> {
  const { page, limit, search } = input;
  const offset = (page - 1) * limit;

  // Build search condition
  const whereClause = search ? ilike(tenants.name, `%${search}%`) : undefined;

  // Get total count
  const countQuery = db.select({ count: count() }).from(tenants);
  if (whereClause) {
    countQuery.where(whereClause);
  }
  const [totalResult] = await countQuery;
  const total = totalResult?.count ?? 0;

  // Get tenants
  const tenantResults = await db.query.tenants.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: desc(tenants.createdAt),
  });

  // Enrich with additional data
  const enrichedTenants: AdminTenantResponse[] = await Promise.all(
    tenantResults.map(async (tenant) => {
      // Get member count
      const [memberResult] = await db
        .select({ count: count() })
        .from(tenantMembers)
        .where(eq(tenantMembers.tenantId, tenant.id));

      // Get subscription status
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.tenantId, tenant.id),
        orderBy: desc(subscriptions.createdAt),
      });

      // Get flags
      const flagsResult = await db
        .select({ flagType: adminFlags.flagType })
        .from(adminFlags)
        .where(and(eq(adminFlags.targetType, "tenant"), eq(adminFlags.targetId, tenant.id)));

      // Get notes count
      const [notesResult] = await db
        .select({ count: count() })
        .from(adminTenantNotes)
        .where(eq(adminTenantNotes.tenantId, tenant.id));

      return {
        id: tenant.id,
        name: tenant.name,
        createdAt: tenant.createdAt,
        memberCount: memberResult?.count ?? 0,
        subscriptionPlan: subscription?.planName ?? subscription?.planId ?? null,
        subscriptionStatus:
          (subscription?.status as AdminTenantResponse["subscriptionStatus"]) ?? "none",
        dau7: 0, // TODO: Calculate from user_activity_daily
        dau30: 0, // TODO: Calculate from user_activity_daily
        flags: flagsResult.map((f) => f.flagType),
        notesCount: notesResult?.count ?? 0,
      };
    })
  );

  return { tenants: enrichedTenants, total };
}

// =============================================================================
// GET TENANT DETAIL
// =============================================================================

export async function getTenantDetail(tenantId: string): Promise<AdminTenantDetail> {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    throw new ORPCError("NOT_FOUND", { message: "Tenant not found" });
  }

  // Get members
  const membersResult = await db
    .select({
      userId: tenantMembers.userId,
      email: user.email,
      name: user.name,
      role: tenantMembers.role,
      joinedAt: tenantMembers.joinedAt,
    })
    .from(tenantMembers)
    .innerJoin(user, eq(tenantMembers.userId, user.id))
    .where(eq(tenantMembers.tenantId, tenantId))
    .orderBy(tenantMembers.joinedAt);

  // Get notes
  const notesResult = await db
    .select({
      id: adminTenantNotes.id,
      note: adminTenantNotes.note,
      adminEmail: sql<string>`(SELECT email FROM admin_users WHERE id = ${adminTenantNotes.adminUserId})`,
      createdAt: adminTenantNotes.createdAt,
    })
    .from(adminTenantNotes)
    .where(eq(adminTenantNotes.tenantId, tenantId))
    .orderBy(desc(adminTenantNotes.createdAt));

  // Get subscription
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenantId),
    orderBy: desc(subscriptions.createdAt),
  });

  // Get flags
  const flagsResult = await db
    .select({ flagType: adminFlags.flagType })
    .from(adminFlags)
    .where(and(eq(adminFlags.targetType, "tenant"), eq(adminFlags.targetId, tenantId)));

  return {
    id: tenant.id,
    name: tenant.name,
    createdAt: tenant.createdAt,
    memberCount: membersResult.length,
    subscriptionPlan: subscription?.planName ?? subscription?.planId ?? null,
    subscriptionStatus: (subscription?.status as AdminTenantDetail["subscriptionStatus"]) ?? "none",
    dau7: 0, // TODO: Calculate
    dau30: 0, // TODO: Calculate
    flags: flagsResult.map((f) => f.flagType),
    notesCount: notesResult.length,
    members: membersResult.map((m) => ({
      userId: m.userId,
      email: m.email,
      name: m.name,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    recentActivity: [], // TODO: Calculate from user_activity_daily
    notes: notesResult.map((n) => ({
      id: n.id,
      note: n.note,
      adminEmail: n.adminEmail ?? "Unknown",
      createdAt: n.createdAt,
    })),
  };
}

// =============================================================================
// GET TENANT ACTIVITY
// =============================================================================

export async function getTenantActivity(
  tenantId: string,
  days: number
): Promise<{ date: Date; activeUsers: number; actions: number }[]> {
  // Stub implementation - would query user_activity_daily
  return [];
}

// =============================================================================
// GET TENANT SUBSCRIPTIONS
// =============================================================================

export async function getTenantSubscriptions(tenantId: string): Promise<{
  current: {
    plan: string;
    status: string;
    provider: string;
    startDate: Date;
    currentPeriodEnd: Date | null;
  } | null;
  history: {
    plan: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
  }[];
}> {
  const subs = await db.query.subscriptions.findMany({
    where: eq(subscriptions.tenantId, tenantId),
    orderBy: desc(subscriptions.createdAt),
  });

  const currentSub = subs.find((s) => s.status === "active" || s.status === "trialing");

  return {
    current: currentSub
      ? {
          plan: currentSub.planName || currentSub.planId || "default",
          status: currentSub.status,
          provider: currentSub.provider || "none",
          startDate: currentSub.currentPeriodStart || currentSub.createdAt,
          currentPeriodEnd: currentSub.currentPeriodEnd,
        }
      : null,
    history: subs.map((s) => ({
      plan: s.planName || s.planId || "default",
      status: s.status,
      startDate: s.currentPeriodStart || s.createdAt,
      endDate: s.currentPeriodEnd,
    })),
  };
}

// =============================================================================
// ADD TENANT NOTE
// =============================================================================

export async function addTenantNote(
  tenantId: string,
  note: string,
  adminUserId: string
): Promise<{ id: string; createdAt: Date }> {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    throw new ORPCError("NOT_FOUND", { message: "Tenant not found" });
  }

  const [newNote] = await db
    .insert(adminTenantNotes)
    .values({
      adminUserId,
      tenantId,
      note,
    })
    .returning({ id: adminTenantNotes.id, createdAt: adminTenantNotes.createdAt });

  await createAdminAuditLog({
    adminUserId,
    action: "tenant.note_added",
    targetType: "tenant",
    targetId: tenantId,
    metadata: { noteId: newNote.id },
  });

  return { id: newNote.id, createdAt: newNote.createdAt };
}

// =============================================================================
// DELETE TENANT NOTE
// =============================================================================

export async function deleteTenantNote(
  tenantId: string,
  noteId: string,
  adminUserId: string
): Promise<{ success: boolean }> {
  const note = await db.query.adminTenantNotes.findFirst({
    where: and(eq(adminTenantNotes.id, noteId), eq(adminTenantNotes.tenantId, tenantId)),
  });

  if (!note) {
    throw new ORPCError("NOT_FOUND", { message: "Note not found" });
  }

  await db.delete(adminTenantNotes).where(eq(adminTenantNotes.id, noteId));

  await createAdminAuditLog({
    adminUserId,
    action: "tenant.note_deleted",
    targetType: "tenant",
    targetId: tenantId,
    metadata: { noteId },
  });

  return { success: true };
}
