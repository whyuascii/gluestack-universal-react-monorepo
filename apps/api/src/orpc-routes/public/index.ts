/**
 * Public Routes
 *
 * Endpoints that require no authentication.
 */
import { db, user, eq } from "@app/database";
import { scrubEvent, eventRequiresAuth } from "@app/analytics/server";
import { trackServerEvent } from "@app/analytics/server";
import { ORPCError } from "@orpc/server";
import { HealthActions } from "../../actions/health";
import { WaitlistActions } from "../../actions/waitlist";
import * as adminIdentity from "../../actions/admin-identity";
import { optionalAuthMiddleware } from "../../middleware";
import { os } from "../_implementer";

// =============================================================================
// Health Routes
// =============================================================================

const healthCheck = os.public.health.check.handler(async () => {
  return HealthActions.check();
});

// =============================================================================
// Waitlist Routes
// =============================================================================

const waitlistSignup = os.public.waitlist.signup.handler(async ({ input }) => {
  return WaitlistActions.signup(input);
});

// =============================================================================
// Analytics Track Route (public, optional auth)
// =============================================================================

const analyticsTrack = os.public.analytics.track
  .use(optionalAuthMiddleware)
  .handler(async ({ input, context }) => {
    const { event, properties = {}, anonymousId, timestamp } = input;

    // Get user's consent level and active tenant (default to anonymous for unauthenticated)
    let consent: "disabled" | "anonymous" | "enabled" = "anonymous";
    let activeTenantId: string | null = null;

    if (context.user) {
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, context.user.id),
        columns: { analyticsConsent: true, activeTenantId: true },
      });
      consent = userRecord?.analyticsConsent ?? "anonymous";
      activeTenantId = userRecord?.activeTenantId ?? null;
    }

    // Respect consent
    if (consent === "disabled") {
      return { tracked: false };
    }

    // Validate and scrub event
    const result = scrubEvent(event, properties as Record<string, unknown>);
    if (!result.success) {
      throw new ORPCError("BAD_REQUEST", {
        message: result.error,
      });
    }

    // Check if event requires auth
    if (eventRequiresAuth(result.event) && !context.user) {
      return { tracked: false }; // Silently skip auth-required events for anonymous users
    }

    // Determine identity
    const distinctId =
      consent === "enabled" && context.user ? context.user.id : anonymousId || `anon_${Date.now()}`;

    // Track to PostHog
    trackServerEvent(result.event, distinctId, {
      ...result.properties,
      // Include tenant if available
      ...(activeTenantId && { tenantId: activeTenantId }),
    });

    return { tracked: true };
  });

// =============================================================================
// Admin Invite Routes (Public - for accepting invites)
// =============================================================================

const adminInviteVerify = os.public.adminInvite.verify.handler(async ({ input }) => {
  const result = await adminIdentity.verifyAdminInviteToken(input.token);

  // Get user name
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, result.userId),
    columns: { name: true },
  });

  return {
    userId: result.userId,
    email: result.email,
    adminRole: result.adminRole,
    name: dbUser?.name || null,
  };
});

const adminInviteAccept = os.public.adminInvite.accept.handler(async ({ input }) => {
  const result = await adminIdentity.acceptAdminInvite(input.token, input.password);

  return {
    success: true,
    userId: result.userId,
    email: result.email,
  };
});

// =============================================================================
// Export Combined Public Routes
// =============================================================================

export const publicRoutes = {
  health: {
    check: healthCheck,
  },
  waitlist: {
    signup: waitlistSignup,
  },
  analytics: {
    track: analyticsTrack,
  },
  adminInvite: {
    verify: adminInviteVerify,
    accept: adminInviteAccept,
  },
};
