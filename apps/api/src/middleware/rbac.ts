/**
 * RBAC Middleware
 *
 * ============================================================================
 * AUTHORIZATION MIDDLEWARE FOR API ROUTES
 * ============================================================================
 *
 * This middleware checks if a user has permission to perform an action.
 *
 * USAGE:
 *
 * 1. Use createRBACMiddleware for resource-based checks:
 *    ```typescript
 *    const createTask = os.tasks.create
 *      .use(authMiddleware)
 *      .use(tenantMiddleware)
 *      .use(createRBACMiddleware("task", "create"))
 *      .handler(...)
 *    ```
 *
 * 2. Use requireRole for minimum role checks:
 *    ```typescript
 *    const deleteUser = os.users.delete
 *      .use(authMiddleware)
 *      .use(tenantMiddleware)
 *      .use(requireRole("admin"))
 *      .handler(...)
 *    ```
 *
 * AUTHORIZATION FLOW:
 *    1. authMiddleware - Verify user is authenticated
 *    2. tenantMiddleware - Verify user belongs to tenant, get roles
 *    3. rbacMiddleware - Check permission for resource + action
 *
 * TO UPDATE RBAC RULES:
 *    Edit packages/config/src/rbac/index.ts
 */

import {
  type Action,
  type Resource,
  type TenantRole,
  type MemberRole,
  canAccess,
  isRoleAtLeast,
  isValidRole,
  isAdminOrOwner,
} from "@app/config";
import { ORPCError, os } from "@orpc/server";
import type { AuthContext } from "./auth";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Context after tenant middleware - includes role information
 *
 * Two-tier role system:
 * - tenantRole: Management level (owner/admin/member)
 * - memberRole: Functional level, only used when tenantRole="member"
 * - role: Legacy alias for tenantRole (kept for backward compatibility)
 */
export interface RBACContext extends AuthContext {
  membership: {
    id: string;
    tenantRole: TenantRole;
    memberRole: MemberRole | null;
    /** @deprecated Use tenantRole instead */
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

// =============================================================================
// MIDDLEWARE FACTORIES
// =============================================================================

/**
 * Create RBAC middleware that checks if user has required permission.
 *
 * This is the PRIMARY middleware for authorization.
 * Uses the canAccess() function which:
 * - Grants full access to owners and admins
 * - Checks member role permissions for regular members
 *
 * @param resource - The resource being accessed (e.g., "task", "project")
 * @param action - The action being performed (e.g., "create", "read")
 *
 * @example
 * // Require "create" permission on "task" resource
 * const createTask = os.tasks.create
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(createRBACMiddleware("task", "create"))
 *   .handler(async ({ input, context }) => {
 *     // User has permission - proceed
 *   });
 *
 * @example
 * // Require "manage" permission (full control)
 * const deleteTenant = os.tenants.delete
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(createRBACMiddleware("tenant", "manage"))
 *   .handler(...)
 */
export function createRBACMiddleware(resource: Resource, action: Action) {
  return os.middleware(async ({ context, next }) => {
    const ctx = context as unknown as RBACContext;

    // Ensure user is authenticated
    if (!ctx.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    // Ensure tenant context exists (from tenantMiddleware)
    if (!ctx.membership) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Tenant context required. Use tenantMiddleware before rbacMiddleware.",
      });
    }

    // Get roles from context
    // tenantRole is preferred, role is kept for backward compatibility
    const tenantRole = ctx.membership.tenantRole || ctx.membership.role;
    const memberRole = ctx.membership.memberRole || null;

    // Validate tenant role
    if (!isValidRole(tenantRole)) {
      throw new ORPCError("FORBIDDEN", {
        message: "Invalid role",
      });
    }

    // Check permission using the new canAccess function
    if (!canAccess(tenantRole, memberRole, resource, action)) {
      throw new ORPCError("FORBIDDEN", {
        message: `You don't have permission to ${action} ${resource}`,
        data: {
          required: { resource, action },
          userTenantRole: tenantRole,
          userMemberRole: memberRole,
        },
      });
    }

    // Pass through original context unchanged (permission verified)
    return next({
      context: context as object,
    });
  });
}

/**
 * Create middleware that requires a minimum tenant role level.
 *
 * Use this when you want to restrict access to admins or owners only,
 * regardless of what action they're performing.
 *
 * @param minimumRole - The minimum tenant role required (owner, admin, member)
 *
 * @example
 * // Require at least admin role
 * const manageMembers = os.settings.manageMembers
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(requireRole("admin"))
 *   .handler(...)
 */
export function requireRole(minimumRole: TenantRole) {
  return os.middleware(async ({ context, next }) => {
    const ctx = context as unknown as RBACContext;

    if (!ctx.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    if (!ctx.membership) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Tenant context required",
      });
    }

    // Get tenant role from context
    const tenantRole = ctx.membership.tenantRole || ctx.membership.role;

    if (!isValidRole(tenantRole)) {
      throw new ORPCError("FORBIDDEN", {
        message: "Invalid role",
      });
    }

    if (!isRoleAtLeast(tenantRole, minimumRole)) {
      throw new ORPCError("FORBIDDEN", {
        message: `This action requires ${minimumRole} role or higher`,
        data: {
          required: minimumRole,
          userTenantRole: tenantRole,
        },
      });
    }

    return next({
      context: context as object,
    });
  });
}

/**
 * Middleware that requires admin or owner role.
 *
 * Admins and owners have full access to all features.
 * Use this for routes that should be restricted to administrators.
 *
 * @example
 * const adminDashboard = os.admin.dashboard
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(requireAdminOrOwner)
 *   .handler(...)
 */
export const requireAdminOrOwner = os.middleware(async ({ context, next }) => {
  const ctx = context as unknown as RBACContext;

  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  if (!ctx.membership) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Tenant context required",
    });
  }

  const tenantRole = ctx.membership.tenantRole || ctx.membership.role;

  if (!isAdminOrOwner(tenantRole)) {
    throw new ORPCError("FORBIDDEN", {
      message: "This action requires admin or owner access",
      data: { userTenantRole: tenantRole },
    });
  }

  return next({
    context: context as object,
  });
});

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

/**
 * Middleware that requires owner role specifically.
 * Use for destructive operations like deleting tenant or transferring ownership.
 */
export const requireOwner = requireRole("owner");

/**
 * Middleware that requires at least admin role.
 * Use for management operations like inviting members or changing settings.
 */
export const requireAdmin = requireRole("admin");

// =============================================================================
// HELPER FUNCTIONS FOR USE IN HANDLERS
// =============================================================================

/**
 * Check if the current user can perform an action in a handler.
 *
 * Use this when you need to check permissions inside a handler
 * (e.g., for conditional logic, not blocking).
 *
 * @example
 * .handler(async ({ context }) => {
 *   const canDelete = checkPermissionInHandler(context, "task", "delete");
 *   if (canDelete) {
 *     // Show delete button
 *   }
 * })
 */
export function checkPermissionInHandler(
  context: RBACContext,
  resource: Resource,
  action: Action
): boolean {
  const tenantRole = context.membership.tenantRole || context.membership.role;
  const memberRole = context.membership.memberRole || null;
  return canAccess(tenantRole, memberRole, resource, action);
}

/**
 * Assert permission in handler - throws if not allowed.
 *
 * Use this when you need to check permissions for a specific resource
 * that's different from the route's main resource.
 *
 * @example
 * .handler(async ({ input, context }) => {
 *   // Route checks "project" permission, but we also need "task" permission
 *   assertPermissionInHandler(context, "task", "create");
 *   // Create task in project...
 * })
 */
export function assertPermissionInHandler(
  context: RBACContext,
  resource: Resource,
  action: Action
): void {
  if (!checkPermissionInHandler(context, resource, action)) {
    const tenantRole = context.membership.tenantRole || context.membership.role;
    const memberRole = context.membership.memberRole || null;
    throw new ORPCError("FORBIDDEN", {
      message: `You don't have permission to ${action} ${resource}`,
      data: {
        required: { resource, action },
        userTenantRole: tenantRole,
        userMemberRole: memberRole,
      },
    });
  }
}
