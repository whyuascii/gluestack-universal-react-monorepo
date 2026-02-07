/**
 * Admin Audit Contract
 *
 * Endpoints for viewing audit logs.
 * Requires read_only+ role.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const AuditLogEntrySchema = z.object({
  id: z.string(),
  adminUserId: z.string(),
  adminUserEmail: z.string(),
  action: z.string(),
  targetType: z.enum(["user", "tenant", "subscription", "admin_user", "webhook_event", "system"]),
  targetId: z.string().nullable(),
  reason: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.coerce.date(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  impersonationSessionId: z.string().nullable(),
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

const PaginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const DateRangeInput = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// =============================================================================
// Audit Contract
// =============================================================================

export const auditContract = {
  // List audit logs (read_only+)
  list: oc
    .route({ method: "GET", path: "/admin/audit-logs" })
    .input(
      PaginationInput.merge(DateRangeInput).extend({
        adminUserId: z.string().optional(),
        action: z.string().optional(),
        targetType: z
          .enum(["user", "tenant", "subscription", "admin_user", "webhook_event", "system"])
          .optional(),
        targetId: z.string().optional(),
      })
    )
    .output(
      z.object({
        logs: z.array(AuditLogEntrySchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Get single audit log entry (read_only+)
  get: oc
    .route({ method: "GET", path: "/admin/audit-logs/{logId}" })
    .input(z.object({ logId: z.string() }))
    .output(AuditLogEntrySchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get audit logs for a specific target
  getForTarget: oc
    .route({ method: "GET", path: "/admin/audit-logs/target/{targetType}/{targetId}" })
    .input(
      PaginationInput.extend({
        targetType: z.enum([
          "user",
          "tenant",
          "subscription",
          "admin_user",
          "webhook_event",
          "system",
        ]),
        targetId: z.string(),
      })
    )
    .output(
      z.object({
        logs: z.array(AuditLogEntrySchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Get audit summary stats
  summary: oc
    .route({ method: "GET", path: "/admin/audit-logs/summary" })
    .input(DateRangeInput)
    .output(
      z.object({
        totalActions: z.number(),
        byAction: z.array(
          z.object({
            action: z.string(),
            count: z.number(),
          })
        ),
        byAdmin: z.array(
          z.object({
            adminUserId: z.string(),
            adminUserEmail: z.string(),
            count: z.number(),
          })
        ),
        impersonationCount: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),
};

export type AuditContract = typeof auditContract;
