/**
 * Admin Flags Contract
 *
 * Endpoints for managing support flags on users and tenants.
 * Requires support_rw+ role for writes.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const AdminFlagSchema = z.object({
  id: z.string(),
  targetType: z.enum(["user", "tenant"]),
  targetId: z.string(),
  targetName: z.string(),
  flagType: z.enum(["at_risk", "vip", "do_not_contact", "under_review", "beta_tester", "custom"]),
  customLabel: z.string().nullable(),
  reason: z.string(),
  createdBy: z.string(),
  createdByEmail: z.string(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
});

export type AdminFlagResponse = z.infer<typeof AdminFlagSchema>;

const PaginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================================================
// Flags Contract
// =============================================================================

export const flagsContract = {
  // List flags (read_only+)
  list: oc
    .route({ method: "GET", path: "/admin/flags" })
    .input(
      PaginationInput.extend({
        targetType: z.enum(["user", "tenant"]).optional(),
        flagType: z
          .enum(["at_risk", "vip", "do_not_contact", "under_review", "beta_tester", "custom"])
          .optional(),
      })
    )
    .output(
      z.object({
        flags: z.array(AdminFlagSchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Set flag (support_rw+)
  set: oc
    .route({ method: "POST", path: "/admin/flags" })
    .input(
      z.object({
        targetType: z.enum(["user", "tenant"]),
        targetId: z.string(),
        flagType: z.enum([
          "at_risk",
          "vip",
          "do_not_contact",
          "under_review",
          "beta_tester",
          "custom",
        ]),
        customLabel: z.string().max(100).optional(),
        reason: z.string().min(10).max(1000),
        expiresAt: z.coerce.date().optional(),
      })
    )
    .output(z.object({ id: z.string() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {}, CONFLICT: {} }),

  // Remove flag (support_rw+)
  remove: oc
    .route({ method: "DELETE", path: "/admin/flags/{flagId}" })
    .input(
      z.object({
        flagId: z.string(),
        reason: z.string().min(10),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get flags for a specific target
  getForTarget: oc
    .route({ method: "GET", path: "/admin/flags/target/{targetType}/{targetId}" })
    .input(
      z.object({
        targetType: z.enum(["user", "tenant"]),
        targetId: z.string(),
      })
    )
    .output(z.array(AdminFlagSchema))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),
};

export type FlagsContract = typeof flagsContract;
