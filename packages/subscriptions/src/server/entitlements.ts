/**
 * Entitlements Resolver
 *
 * Resolves subscription status to tenant entitlements.
 * This is the source of truth for what features a tenant can access.
 */

import { GRACE_PERIOD_DAYS, FREE_TIER_ENTITLEMENTS, PRO_TIER_ENTITLEMENTS } from "@app/config";
import type { TenantEntitlements, SubscriptionFeatures } from "@app/core-contract";
import { db, subscriptions, eq, and, inArray, desc } from "@app/database";

// =============================================================================
// Types
// =============================================================================

export type { TenantEntitlements, SubscriptionFeatures };

export type SubscriptionTier = "free" | "pro" | "enterprise";

// =============================================================================
// Entitlements Resolver
// =============================================================================

/**
 * Get entitlements for a tenant based on their subscription status.
 *
 * @param tenantId - The tenant ID to check
 * @returns TenantEntitlements with tier, features, and access status
 *
 * @example
 * ```typescript
 * const entitlements = await getTenantEntitlements("tenant_123");
 * if (entitlements.tier === "pro") {
 *   // Show pro features
 * }
 * ```
 */
export async function getTenantEntitlements(tenantId: string): Promise<TenantEntitlements> {
  // Find the most recent active subscription
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.tenantId, tenantId),
      inArray(subscriptions.status, ["active", "trialing", "past_due", "canceled"])
    ),
    orderBy: desc(subscriptions.updatedAt),
  });

  // No subscription = free tier
  if (!subscription) {
    return {
      tenantId,
      ...FREE_TIER_ENTITLEMENTS,
    };
  }

  // Determine access based on status
  let hasAccess = false;
  const now = new Date();

  switch (subscription.status) {
    case "active":
    case "trialing":
      hasAccess = true;
      break;

    case "past_due":
      // Grace period: access continues for N days after period end
      if (subscription.currentPeriodEnd) {
        const graceEnd = new Date(subscription.currentPeriodEnd);
        graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS);
        hasAccess = now < graceEnd;
      }
      break;

    case "canceled":
      // Access until period end if cancelAtPeriodEnd
      if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
        hasAccess = now < subscription.currentPeriodEnd;
      }
      break;
  }

  // If no access, return free tier
  if (!hasAccess) {
    return {
      tenantId,
      ...FREE_TIER_ENTITLEMENTS,
    };
  }

  // Return pro tier with subscription info
  return {
    tenantId,
    ...PRO_TIER_ENTITLEMENTS,
    subscription: {
      status: subscription.status as
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "expired"
        | "paused",
      periodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      provider: subscription.provider as "polar" | "revenuecat",
    },
  };
}

/**
 * Get entitlements for a user (via their active tenant).
 *
 * @param userId - The user ID
 * @param activeTenantId - The user's active tenant ID
 * @returns TenantEntitlements or null if no active tenant
 */
export async function getUserEntitlements(
  userId: string,
  activeTenantId: string | null | undefined
): Promise<TenantEntitlements | null> {
  if (!activeTenantId) {
    return null;
  }

  return getTenantEntitlements(activeTenantId);
}

/**
 * Check if a tenant has a specific subscription tier.
 *
 * @param tenantId - The tenant ID
 * @param tier - The tier to check ("pro" | "enterprise")
 * @returns true if tenant has the tier or higher
 */
export async function hasTier(tenantId: string, tier: "pro" | "enterprise"): Promise<boolean> {
  const entitlements = await getTenantEntitlements(tenantId);

  if (tier === "pro") {
    return entitlements.tier === "pro" || entitlements.tier === "enterprise";
  }

  return entitlements.tier === tier;
}

/**
 * Check if a tenant has access to a specific feature.
 *
 * @param tenantId - The tenant ID
 * @param feature - The feature to check
 * @returns true if feature is available
 */
export async function hasFeatureAccess(
  tenantId: string,
  feature: keyof SubscriptionFeatures
): Promise<boolean> {
  const entitlements = await getTenantEntitlements(tenantId);
  const value = entitlements.features[feature];

  // For numeric features (limits), check if > 0 or == -1 (unlimited)
  if (typeof value === "number") {
    return value === -1 || value > 0;
  }

  // For boolean features, special case for adsEnabled (inverted)
  if (feature === "adsEnabled") {
    return !value; // No ads = has feature
  }

  return Boolean(value);
}
