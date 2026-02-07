import { db, tenantMembers, tenants, eq, and } from "@app/database";
import type { TenantRole, MemberRole } from "@app/config";
import { ORPCError, os } from "@orpc/server";
import type { AuthContext } from "./auth";

/**
 * Tenant Context - extends AuthContext with tenant membership info
 *
 * Two-tier role system:
 * - tenantRole: Management level (owner/admin/member)
 * - memberRole: Functional level, only used when tenantRole="member"
 *
 * See packages/config/src/rbac/index.ts for full details.
 */
export interface TenantContext extends AuthContext {
  membership: {
    id: string;
    /** Management role: owner, admin, or member */
    tenantRole: TenantRole;
    /** Functional role for members: editor, viewer, contributor, moderator */
    memberRole: MemberRole | null;
    /** @deprecated Use tenantRole instead. Kept for backward compatibility. */
    role: TenantRole;
    tenantId: string;
    joinedAt: Date;
  };
  tenant: {
    id: string;
    name: string;
    type: string;
  };
}

/**
 * Tenant middleware - validates user belongs to their active tenant
 *
 * This middleware:
 * 1. Checks if user has an active tenant set
 * 2. Validates user is a member of that tenant
 * 3. Adds membership and tenant info to context
 *
 * Use AFTER authMiddleware, BEFORE rbacMiddleware
 *
 * @example
 * const protectedRoute = os.tasks.list
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(createRBACMiddleware("task", "read"))
 *   .handler(async ({ context }) => {
 *     // context.tenant and context.membership are available
 *   })
 */
export const tenantMiddleware = os.middleware(async ({ context, next }) => {
  // Type assertion for accessing auth properties
  const authCtx = context as unknown as AuthContext;

  // Ensure user is authenticated
  if (!authCtx.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  // Check if user has an active tenant
  const activeTenantId = authCtx.user.activeTenantId;

  if (!activeTenantId) {
    throw new ORPCError("BAD_REQUEST", {
      message: "No active group selected. Please select or create a group first.",
      data: { code: "NO_ACTIVE_TENANT" },
    });
  }

  // Validate user is a member of the active tenant
  const membership = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.tenantId, activeTenantId),
      eq(tenantMembers.userId, authCtx.user.id)
    ),
  });

  if (!membership) {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not a member of this group",
      data: { code: "NOT_A_MEMBER" },
    });
  }

  // Get tenant info
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, activeTenantId),
  });

  if (!tenant) {
    throw new ORPCError("NOT_FOUND", {
      message: "Group not found",
      data: { code: "TENANT_NOT_FOUND" },
    });
  }

  // Spread original context and add tenant/membership info
  // Include both tenantRole and memberRole for two-tier RBAC
  const tenantRole = membership.role as TenantRole;
  const memberRole = (membership.memberRole as MemberRole) || null;

  return next({
    context: {
      ...(context as object),
      membership: {
        id: membership.id,
        tenantRole,
        memberRole,
        role: tenantRole, // Legacy: kept for backward compatibility
        tenantId: membership.tenantId,
        joinedAt: membership.joinedAt,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
      },
    },
  });
});

/**
 * Validate access to a specific tenant by ID in action handlers
 * Use when the tenant ID comes from request input (not active tenant)
 *
 * @example
 * static async get(input: { tenantId: string }, context: AuthContext) {
 *   const { membership, tenant } = await validateTenantAccess(input.tenantId, context);
 *   // ... rest of handler
 * }
 */
export async function validateTenantAccess(
  tenantId: string,
  context: AuthContext
): Promise<{ membership: TenantContext["membership"]; tenant: TenantContext["tenant"] }> {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  // Validate user is a member of the requested tenant
  const membership = await db.query.tenantMembers.findFirst({
    where: and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, context.user.id)),
  });

  if (!membership) {
    throw new ORPCError("FORBIDDEN", {
      message: "You don't have access to this group",
    });
  }

  // Get tenant info
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    throw new ORPCError("NOT_FOUND", {
      message: "Group not found",
    });
  }

  const tenantRole = membership.role as TenantRole;
  const memberRole = (membership.memberRole as MemberRole) || null;

  return {
    membership: {
      id: membership.id,
      tenantRole,
      memberRole,
      role: tenantRole, // Legacy: kept for backward compatibility
      tenantId: membership.tenantId,
      joinedAt: membership.joinedAt,
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      type: tenant.type,
    },
  };
}
