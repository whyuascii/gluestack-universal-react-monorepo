/**
 * Admin Authentication Middleware
 *
 * ============================================================================
 * SIMPLIFIED ADMIN AUTH - Uses existing user table + Better Auth sessions
 * ============================================================================
 *
 * Admin access is controlled by the `admin_role` column on the user table:
 * - null: Not an admin (no access)
 * - 'read_only': Can view admin portal data
 * - 'support_rw': Can view and modify data
 * - 'super_admin': Full access
 *
 * Uses Better Auth sessions - no separate admin tables needed.
 */

import { db, user, eq } from "@app/database";
import { ORPCError, os } from "@orpc/server";
import { createAuthConfig } from "@app/auth/server";

// Create auth instance for session validation
const auth = createAuthConfig();

// =============================================================================
// TYPES
// =============================================================================

export type AdminRole = "read_only" | "support_rw" | "super_admin";

export interface AdminAuthContext {
  adminUser: {
    id: string;
    email: string;
    name: string;
    adminRole: AdminRole;
  };
}

// =============================================================================
// ROLE HIERARCHY
// =============================================================================

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  read_only: 1,
  support_rw: 2,
  super_admin: 3,
};

export function isAdminRoleAtLeast(userRole: AdminRole, minimumRole: AdminRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Admin auth middleware - validates Better Auth session + admin role
 */
export const adminAuthMiddleware = os.middleware(async ({ context, next }) => {
  const ctx = context as { request?: Request; headers?: Record<string, string> };

  // Get session from Better Auth
  let session;
  try {
    // Try to get headers from context
    const headers = ctx.headers || {};
    session = await auth.api.getSession({ headers: new Headers(headers) });
  } catch {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  // Get user with admin role
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!dbUser) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "User not found",
    });
  }

  // Check admin role
  if (!dbUser.adminRole) {
    throw new ORPCError("FORBIDDEN", {
      message: "Admin access required",
    });
  }

  return next({
    context: {
      adminUser: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        adminRole: dbUser.adminRole as AdminRole,
      },
    } satisfies AdminAuthContext,
  });
});

/**
 * Create middleware that requires a minimum admin role
 */
export function requireAdminRole(minimumRole: AdminRole) {
  return os.middleware(async ({ context, next }) => {
    const ctx = context as unknown as AdminAuthContext;

    if (!ctx.adminUser) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Admin authentication required",
      });
    }

    if (!isAdminRoleAtLeast(ctx.adminUser.adminRole, minimumRole)) {
      throw new ORPCError("FORBIDDEN", {
        message: `This action requires ${minimumRole} role or higher`,
        data: {
          required: minimumRole,
          userRole: ctx.adminUser.adminRole,
        },
      });
    }

    return next({ context: context as object });
  });
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const requireReadOnly = requireAdminRole("read_only");
export const requireSupportRW = requireAdminRole("support_rw");
export const requireSuperAdmin = requireAdminRole("super_admin");
