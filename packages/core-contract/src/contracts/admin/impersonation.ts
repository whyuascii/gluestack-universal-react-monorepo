/**
 * Admin Impersonation Contract
 *
 * Endpoints for safe user impersonation.
 * Requires support_rw+ role and super_admin enablement.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const ImpersonationSessionSchema = z.object({
  id: z.string(),
  adminUserId: z.string(),
  adminUserEmail: z.string().optional(),
  targetUserId: z.string(),
  targetUserEmail: z.string(),
  targetTenantId: z.string().nullable(),
  targetTenantName: z.string().nullable(),
  scope: z.enum(["read_only", "read_write"]),
  reason: z.string(),
  startedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  endedAt: z.coerce.date().nullable(),
  endReason: z.enum(["manual", "expired", "revoked", "logout"]).nullable(),
});

export type ImpersonationSession = z.infer<typeof ImpersonationSessionSchema>;

// =============================================================================
// Impersonation Contract
// =============================================================================

export const impersonationContract = {
  // Start impersonation session (support_rw+ with super_admin gate)
  start: oc
    .route({ method: "POST", path: "/admin/impersonation/start" })
    .input(
      z.object({
        targetUserId: z.string(),
        targetTenantId: z.string().optional(),
        reason: z.string().min(10).max(500),
        scope: z.enum(["read_only", "read_write"]).default("read_only"),
        durationMinutes: z.number().int().min(5).max(60).default(15),
      })
    )
    .output(ImpersonationSessionSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {}, CONFLICT: {} }),

  // Stop impersonation session
  stop: oc
    .route({ method: "POST", path: "/admin/impersonation/stop" })
    .input(
      z.object({
        sessionId: z.string(),
        reason: z.string().min(10).optional(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get current impersonation status
  status: oc
    .route({ method: "GET", path: "/admin/impersonation/status" })
    .output(
      z.object({
        active: z.boolean(),
        session: ImpersonationSessionSchema.nullable(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // List all active impersonation sessions (super_admin only)
  listActive: oc
    .route({ method: "GET", path: "/admin/impersonation/active" })
    .output(
      z.object({
        sessions: z.array(ImpersonationSessionSchema),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Revoke an impersonation session (super_admin only)
  revoke: oc
    .route({ method: "POST", path: "/admin/impersonation/{sessionId}/revoke" })
    .input(
      z.object({
        sessionId: z.string(),
        reason: z.string().min(10),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get impersonation history for audit
  history: oc
    .route({ method: "GET", path: "/admin/impersonation/history" })
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        adminUserId: z.string().optional(),
        targetUserId: z.string().optional(),
      })
    )
    .output(
      z.object({
        sessions: z.array(ImpersonationSessionSchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),
};

export type ImpersonationContract = typeof impersonationContract;
