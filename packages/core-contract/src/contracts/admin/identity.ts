/**
 * Admin Identity Contract
 *
 * Endpoints for managing admin users and roles.
 * Requires super_admin role.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  company: z.string(),
  status: z.enum(["active", "suspended", "pending"]),
  roles: z.array(z.enum(["read_only", "support_rw", "super_admin"])),
  createdAt: z.coerce.date(),
  lastLoginAt: z.coerce.date().nullable(),
  avatarUrl: z.string().nullable(),
});

export type AdminUserResponse = z.infer<typeof AdminUserSchema>;

export const AdminRoleSchema = z.object({
  key: z.enum(["read_only", "support_rw", "super_admin"]),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
});

export type AdminRoleResponse = z.infer<typeof AdminRoleSchema>;

// Simplified schema for current admin user (from user table)
export const AdminMeSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  adminRole: z.enum(["read_only", "support_rw", "super_admin"]),
});

export type AdminMeResponse = z.infer<typeof AdminMeSchema>;

const PaginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================================================
// Identity Contract
// =============================================================================

export const identityContract = {
  // List admin users (super_admin only)
  listAdminUsers: oc
    .route({ method: "GET", path: "/admin/identity/users" })
    .input(
      PaginationInput.extend({
        status: z.enum(["active", "suspended", "pending"]).optional(),
      })
    )
    .output(
      z.object({
        users: z.array(AdminUserSchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Get single admin user
  getAdminUser: oc
    .route({ method: "GET", path: "/admin/identity/users/{adminUserId}" })
    .input(z.object({ adminUserId: z.string() }))
    .output(AdminUserSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Create/invite admin user
  createAdminUser: oc
    .route({ method: "POST", path: "/admin/identity/users" })
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        roles: z.array(z.enum(["read_only", "support_rw", "super_admin"])).min(1),
      })
    )
    .output(AdminUserSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, CONFLICT: {} }),

  // Update admin user roles
  updateAdminUserRoles: oc
    .route({ method: "PATCH", path: "/admin/identity/users/{adminUserId}/roles" })
    .input(
      z.object({
        adminUserId: z.string(),
        roles: z.array(z.enum(["read_only", "support_rw", "super_admin"])).min(1),
        reason: z.string().min(10),
      })
    )
    .output(AdminUserSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Update admin user status
  updateAdminUserStatus: oc
    .route({ method: "PATCH", path: "/admin/identity/users/{adminUserId}/status" })
    .input(
      z.object({
        adminUserId: z.string(),
        status: z.enum(["active", "suspended"]),
        reason: z.string().min(10),
      })
    )
    .output(AdminUserSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // List roles
  listRoles: oc
    .route({ method: "GET", path: "/admin/identity/roles" })
    .output(z.array(AdminRoleSchema))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Get current admin user (me) - uses user table with adminRole
  me: oc
    .route({ method: "GET", path: "/admin/identity/me" })
    .output(AdminMeSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Resend admin invite email
  resendInvite: oc
    .route({ method: "POST", path: "/admin/identity/users/{adminUserId}/resend-invite" })
    .input(z.object({ adminUserId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {} }),
};

export type IdentityContract = typeof identityContract;
