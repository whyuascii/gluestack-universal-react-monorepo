/**
 * Admin Users Contract
 *
 * Endpoints for viewing and managing customer users.
 * Requires read_only+ role.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const AdminCustomerUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  createdAt: z.coerce.date(),
  lastActiveAt: z.coerce.date().nullable(),
  emailVerified: z.boolean(),
  lifecycleStage: z.string(),
  tenantMemberships: z.array(
    z.object({
      tenantId: z.string(),
      tenantName: z.string(),
      role: z.string(),
    })
  ),
  subscriptionStatus: z.enum(["active", "trialing", "past_due", "canceled", "expired", "none"]),
  flags: z.array(z.string()),
  notesCount: z.number(),
});

export type AdminCustomerUser = z.infer<typeof AdminCustomerUserSchema>;

export const AdminUserNoteSchema = z.object({
  id: z.string(),
  note: z.string(),
  adminEmail: z.string(),
  createdAt: z.coerce.date(),
});

export const AdminUserActivitySummarySchema = z.object({
  sessionsLast7Days: z.number(),
  sessionsLast30Days: z.number(),
  coreActionsLast7Days: z.number(),
  lastAction: z.string().nullable(),
  lastActionAt: z.coerce.date().nullable(),
});

export const AdminUserActivityEventSchema = z.object({
  id: z.string(),
  event: z.string(),
  properties: z.record(z.string(), z.unknown()),
  timestamp: z.coerce.date(),
});

export const AdminUserDetailSchema = AdminCustomerUserSchema.extend({
  activitySummary: AdminUserActivitySummarySchema,
  notes: z.array(AdminUserNoteSchema),
});

export type AdminUserDetail = z.infer<typeof AdminUserDetailSchema>;

const PaginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const DateRangeInput = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// =============================================================================
// Users Contract
// =============================================================================

export const usersContract = {
  // Search users (read_only+)
  search: oc
    .route({ method: "GET", path: "/admin/users/search" })
    .input(
      PaginationInput.extend({
        query: z.string().min(1),
        type: z.enum(["email", "id", "name"]).default("email"),
      })
    )
    .output(
      z.object({
        users: z.array(AdminCustomerUserSchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Get user detail (read_only+)
  get: oc
    .route({ method: "GET", path: "/admin/users/{userId}" })
    .input(z.object({ userId: z.string() }))
    .output(AdminUserDetailSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get user activity timeline (read_only+)
  getActivityTimeline: oc
    .route({ method: "GET", path: "/admin/users/{userId}/activity" })
    .input(z.object({ userId: z.string() }).merge(PaginationInput).merge(DateRangeInput))
    .output(
      z.object({
        events: z.array(AdminUserActivityEventSchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get user subscriptions (read_only+)
  getSubscriptions: oc
    .route({ method: "GET", path: "/admin/users/{userId}/subscriptions" })
    .input(z.object({ userId: z.string() }))
    .output(
      z.object({
        currentSubscription: z
          .object({
            plan: z.string(),
            status: z.string(),
            startDate: z.coerce.date(),
            currentPeriodEnd: z.coerce.date().nullable(),
            provider: z.enum(["revenuecat", "polar", "none"]),
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

  // Add note to user (support_rw+)
  addNote: oc
    .route({ method: "POST", path: "/admin/users/{userId}/notes" })
    .input(
      z.object({
        userId: z.string(),
        note: z.string().min(1).max(10000),
      })
    )
    .output(z.object({ id: z.string(), createdAt: z.coerce.date() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Delete note from user (support_rw+)
  deleteNote: oc
    .route({ method: "DELETE", path: "/admin/users/{userId}/notes/{noteId}" })
    .input(
      z.object({
        userId: z.string(),
        noteId: z.string(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Resend verification email (support_rw+)
  resendVerificationEmail: oc
    .route({ method: "POST", path: "/admin/users/{userId}/resend-verification" })
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().min(10),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),
};

export type UsersContract = typeof usersContract;
