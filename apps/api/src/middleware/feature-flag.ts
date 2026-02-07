import {
  type SubscriptionTier,
  SUBSCRIPTION_TIERS,
  TIER_FEATURES,
  hasFeature,
  isValidTier,
  requireEntitlement as checkEntitlement,
  requireFeature as checkFeature,
} from "@app/config";
import { ORPCError, os } from "@orpc/server";
import type { TenantEntitlements } from "@app/core-contract";
import { getTenantEntitlements } from "@app/subscriptions/server";
import type { AuthContext } from "./auth";
import type { TenantContext } from "./tenant";

/**
 * Feature Flag Context - extends context with subscription info
 */
export interface FeatureFlagContext extends AuthContext {
  subscription: {
    tier: SubscriptionTier;
    features: string[];
  };
  entitlements: TenantEntitlements;
}

/**
 * Get subscription tier for a tenant using the entitlements resolver
 */
async function getTenantSubscriptionTier(tenantId: string): Promise<SubscriptionTier> {
  const entitlements = await getTenantEntitlements(tenantId);
  return entitlements.tier;
}

/**
 * Create middleware that requires a specific feature
 *
 * @example
 * // Gate route behind "push_notifications" feature
 * const sendPush = os.notifications.sendPush
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(requireFeature("push_notifications"))
 *   .handler(...)
 */
export function requireFeature(feature: string) {
  return os.middleware(async ({ context, next }) => {
    const ctx = context as TenantContext;

    if (!ctx.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    // Get tenant ID from context
    const tenantId = ctx.tenant?.id || ctx.user.activeTenantId;

    if (!tenantId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Tenant context required for feature check",
      });
    }

    // Get subscription tier
    const tier = await getTenantSubscriptionTier(tenantId);

    if (!hasFeature(tier, feature)) {
      throw new ORPCError("FORBIDDEN", {
        message: `This feature requires a ${getRequiredTierForFeature(feature)} subscription`,
        data: {
          code: "FEATURE_NOT_AVAILABLE",
          feature,
          currentTier: tier,
          requiredTier: getRequiredTierForFeature(feature),
        },
      });
    }

    return next({
      context: {
        ...ctx,
        subscription: {
          tier,
          features: getActiveFeaturesForTier(tier),
        },
      },
    });
  });
}

/**
 * Create middleware that requires a minimum subscription tier
 *
 * @example
 * // Require at least Pro subscription
 * const advancedAnalytics = os.analytics.advanced
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(requireTier("pro"))
 *   .handler(...)
 */
export function requireTier(minimumTier: SubscriptionTier) {
  return os.middleware(async ({ context, next }) => {
    const ctx = context as TenantContext;

    if (!ctx.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    const tenantId = ctx.tenant?.id || ctx.user.activeTenantId;

    if (!tenantId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Tenant context required",
      });
    }

    const tier = await getTenantSubscriptionTier(tenantId);

    if (!isTierAtLeast(tier, minimumTier)) {
      throw new ORPCError("FORBIDDEN", {
        message: `This feature requires a ${minimumTier} subscription or higher`,
        data: {
          code: "TIER_REQUIRED",
          currentTier: tier,
          requiredTier: minimumTier,
        },
      });
    }

    return next({
      context: {
        ...ctx,
        subscription: {
          tier,
          features: getActiveFeaturesForTier(tier),
        },
      },
    });
  });
}

/**
 * Middleware that adds subscription context and entitlements without gating.
 * Useful when you want to check features in handler logic.
 *
 * @example
 * const dashboard = os.dashboard.get
 *   .use(authMiddleware)
 *   .use(tenantMiddleware)
 *   .use(subscriptionMiddleware)
 *   .handler(async ({ context }) => {
 *     if (context.entitlements.tier === "pro") {
 *       // Include premium features
 *     }
 *     if (!context.entitlements.features.adsEnabled) {
 *       // Hide ads for pro users
 *     }
 *   })
 */
export const subscriptionMiddleware = os.middleware(async ({ context, next }) => {
  const ctx = context as TenantContext;

  const tenantId = ctx.tenant?.id || ctx.user?.activeTenantId;

  // Get full entitlements from resolver
  const entitlements = tenantId
    ? await getTenantEntitlements(tenantId)
    : {
        tenantId: "",
        tier: SUBSCRIPTION_TIERS.FREE as SubscriptionTier,
        hasAccess: true,
        features: {
          adsEnabled: true,
          exportLimit: 10,
          bulkExport: false,
          prioritySupport: false,
          maxMembers: 5,
        },
      };

  return next({
    context: {
      ...ctx,
      subscription: {
        tier: entitlements.tier,
        features: getActiveFeaturesForTier(entitlements.tier),
      },
      entitlements,
    } satisfies FeatureFlagContext,
  });
});

// =============================================================================
// Helper Functions
// =============================================================================

const TIER_HIERARCHY: SubscriptionTier[] = ["free", "pro", "enterprise"];

function isTierAtLeast(tier: SubscriptionTier, minimumTier: SubscriptionTier): boolean {
  const tierIndex = TIER_HIERARCHY.indexOf(tier);
  const minIndex = TIER_HIERARCHY.indexOf(minimumTier);
  return tierIndex >= minIndex;
}

function getActiveFeaturesForTier(tier: SubscriptionTier): string[] {
  return TIER_FEATURES[tier] || [];
}

function getRequiredTierForFeature(feature: string): SubscriptionTier {
  // Find the lowest tier that has this feature
  for (const tier of TIER_HIERARCHY) {
    if (TIER_FEATURES[tier]?.includes(feature)) {
      return tier;
    }
  }

  return "enterprise"; // Default to highest tier if not found
}
