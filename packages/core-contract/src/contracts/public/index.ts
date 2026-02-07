/**
 * Public Contracts
 *
 * Endpoints that require no authentication.
 * - health: System health checks
 * - waitlist: Pre-launch signup
 * - analytics: Event tracking (optional auth)
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Health
// =============================================================================

export const healthContract = {
  check: oc.route({ method: "GET", path: "/public/health" }).output(
    z.object({
      status: z.enum(["ok", "degraded", "error"]),
      timestamp: z.string(),
      version: z.string().optional(),
    })
  ),
};

// =============================================================================
// Waitlist
// =============================================================================

export const waitlistContract = {
  signup: oc
    .route({ method: "POST", path: "/public/waitlist" })
    .input(
      z.object({
        email: z.string().email("validation:email.invalid"),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    )
    .errors({
      CONFLICT: {},
      BAD_REQUEST: {},
    }),
};

// =============================================================================
// Analytics (Public - track only, optional auth)
// =============================================================================

export const TrackEventSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.string(), z.unknown()).optional(),
  anonymousId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
});

export type TrackEventInput = z.infer<typeof TrackEventSchema>;

export const TrackEventResponseSchema = z.object({
  tracked: z.boolean(),
});

export type TrackEventResponse = z.infer<typeof TrackEventResponseSchema>;

export const analyticsContract = {
  /**
   * Track an analytics event (public, optional auth)
   * Server validates against allowlist and scrubs PII
   */
  track: oc
    .route({ method: "POST", path: "/public/analytics/track" })
    .input(TrackEventSchema)
    .output(TrackEventResponseSchema)
    .errors({
      BAD_REQUEST: {},
      FORBIDDEN: {},
    }),
};

// =============================================================================
// Admin Invite (Public - for accepting invites before login)
// =============================================================================

export const AdminInviteVerifySchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  adminRole: z.enum(["read_only", "support_rw", "super_admin"]),
  name: z.string().nullable(),
});

export type AdminInviteVerifyResponse = z.infer<typeof AdminInviteVerifySchema>;

export const adminInviteContract = {
  /**
   * Verify an admin invite token (returns user info if valid)
   */
  verify: oc
    .route({ method: "GET", path: "/public/admin-invite/verify" })
    .input(z.object({ token: z.string().min(1) }))
    .output(AdminInviteVerifySchema)
    .errors({
      BAD_REQUEST: {},
      NOT_FOUND: {},
    }),

  /**
   * Accept an admin invite (set password and activate account)
   */
  accept: oc
    .route({ method: "POST", path: "/public/admin-invite/accept" })
    .input(
      z.object({
        token: z.string().min(1),
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        userId: z.string(),
        email: z.string(),
      })
    )
    .errors({
      BAD_REQUEST: {},
      NOT_FOUND: {},
    }),
};

// =============================================================================
// Combined Public Contract
// =============================================================================

export const publicContract = {
  health: healthContract,
  waitlist: waitlistContract,
  analytics: analyticsContract,
  adminInvite: adminInviteContract,
};

export type PublicContract = typeof publicContract;
