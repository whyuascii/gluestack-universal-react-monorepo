/**
 * Admin Tenants Contract
 *
 * Endpoints for viewing and managing customer tenants.
 * Requires read_only+ role.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const AdminTenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  memberCount: z.number(),
  subscriptionPlan: z.string().nullable(),
  subscriptionStatus: z.enum(["active", "trialing", "past_due", "canceled", "expired", "none"]),
  dau7: z.number(),
  dau30: z.number(),
  flags: z.array(z.string()),
  notesCount: z.number(),
});

export type AdminTenantResponse = z.infer<typeof AdminTenantSchema>;

export const AdminTenantMemberSchema = z.object({
  userId: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.string(),
  joinedAt: z.coerce.date(),
});

export const AdminTenantNoteSchema = z.object({
  id: z.string(),
  note: z.string(),
  adminEmail: z.string(),
  createdAt: z.coerce.date(),
});

export const AdminTenantActivitySchema = z.object({
  date: z.coerce.date(),
  activeUsers: z.number(),
  actions: z.number(),
});

export const AdminTenantDetailSchema = AdminTenantSchema.extend({
  members: z.array(AdminTenantMemberSchema),
  recentActivity: z.array(AdminTenantActivitySchema),
  notes: z.array(AdminTenantNoteSchema),
});

export type AdminTenantDetail = z.infer<typeof AdminTenantDetailSchema>;

const PaginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================================================
// Tenants Contract
// =============================================================================

export const tenantsContract = {
  // List tenants (read_only+)
  list: oc
    .route({ method: "GET", path: "/admin/tenants" })
    .input(
      PaginationInput.extend({
        search: z.string().optional(),
        subscriptionStatus: z
          .enum(["active", "trialing", "past_due", "canceled", "expired", "none"])
          .optional(),
        hasFlag: z.string().optional(),
      })
    )
    .output(
      z.object({
        tenants: z.array(AdminTenantSchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Get tenant detail (read_only+)
  get: oc
    .route({ method: "GET", path: "/admin/tenants/{tenantId}" })
    .input(z.object({ tenantId: z.string() }))
    .output(AdminTenantDetailSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Add note to tenant (support_rw+)
  addNote: oc
    .route({ method: "POST", path: "/admin/tenants/{tenantId}/notes" })
    .input(
      z.object({
        tenantId: z.string(),
        note: z.string().min(1).max(10000),
      })
    )
    .output(z.object({ id: z.string(), createdAt: z.coerce.date() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Delete note from tenant (support_rw+)
  deleteNote: oc
    .route({ method: "DELETE", path: "/admin/tenants/{tenantId}/notes/{noteId}" })
    .input(
      z.object({
        tenantId: z.string(),
        noteId: z.string(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get tenant activity (read_only+)
  getActivity: oc
    .route({ method: "GET", path: "/admin/tenants/{tenantId}/activity" })
    .input(
      z.object({
        tenantId: z.string(),
        days: z.number().int().min(1).max(90).default(30),
      })
    )
    .output(z.array(AdminTenantActivitySchema))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get tenant subscriptions (read_only+)
  getSubscriptions: oc
    .route({ method: "GET", path: "/admin/tenants/{tenantId}/subscriptions" })
    .input(z.object({ tenantId: z.string() }))
    .output(
      z.object({
        current: z
          .object({
            plan: z.string(),
            status: z.string(),
            provider: z.string(),
            startDate: z.coerce.date(),
            currentPeriodEnd: z.coerce.date().nullable(),
          })
          .nullable(),
        history: z.array(
          z.object({
            plan: z.string(),
            status: z.string(),
            startDate: z.coerce.date(),
            endDate: z.coerce.date().nullable(),
          })
        ),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),
};

export type TenantsContract = typeof tenantsContract;
