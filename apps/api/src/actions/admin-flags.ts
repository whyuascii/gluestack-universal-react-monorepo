/**
 * Admin Flags Actions
 *
 * Stub implementations for support flags.
 * TODO: Implement with proper schema matching.
 */
import {
  db,
  adminFlags,
  adminUsers,
  user,
  tenants,
  eq,
  and,
  count,
  desc,
  gt,
  or,
  isNull,
} from "@app/database";
import type { AdminFlagResponse } from "@app/core-contract";
import { ORPCError } from "@orpc/server";
import { createAdminAuditLog } from "./admin-audit";

type FlagTargetType = "user" | "tenant";
type FlagType = "at_risk" | "vip" | "do_not_contact" | "under_review" | "beta_tester" | "custom";

// =============================================================================
// LIST FLAGS
// =============================================================================

export async function listFlags(input: {
  page: number;
  limit: number;
  targetType?: FlagTargetType;
  flagType?: FlagType;
}): Promise<{ flags: AdminFlagResponse[]; total: number }> {
  // Stub implementation
  return { flags: [], total: 0 };
}

// =============================================================================
// SET FLAG
// =============================================================================

export async function setFlag(
  input: {
    targetType: FlagTargetType;
    targetId: string;
    flagType: FlagType;
    customLabel?: string;
    reason: string;
    expiresAt?: Date;
  },
  adminUserId: string
): Promise<{ id: string }> {
  const [newFlag] = await db
    .insert(adminFlags)
    .values({
      targetType: input.targetType,
      targetId: input.targetId,
      flagType: input.flagType,
      customLabel: input.customLabel ?? null,
      reason: input.reason,
      createdBy: adminUserId,
      expiresAt: input.expiresAt ?? null,
    })
    .returning({ id: adminFlags.id });

  await createAdminAuditLog({
    adminUserId,
    action: "flag.set",
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: { flagId: newFlag.id, flagType: input.flagType },
  });

  return { id: newFlag.id };
}

// =============================================================================
// REMOVE FLAG
// =============================================================================

export async function removeFlag(
  flagId: string,
  reason: string,
  adminUserId: string
): Promise<{ success: boolean }> {
  const flag = await db.query.adminFlags.findFirst({
    where: eq(adminFlags.id, flagId),
  });

  if (!flag) {
    throw new ORPCError("NOT_FOUND", { message: "Flag not found" });
  }

  await db.delete(adminFlags).where(eq(adminFlags.id, flagId));

  await createAdminAuditLog({
    adminUserId,
    action: "flag.removed",
    targetType: flag.targetType,
    targetId: flag.targetId,
    reason,
  });

  return { success: true };
}

// =============================================================================
// GET FLAGS FOR TARGET
// =============================================================================

export async function getFlagsForTarget(
  targetType: FlagTargetType,
  targetId: string
): Promise<AdminFlagResponse[]> {
  // Stub implementation
  return [];
}
