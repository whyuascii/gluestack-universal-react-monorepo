/**
 * Subscription Guards
 *
 * Functions for checking subscription entitlements at runtime.
 * Works with TenantEntitlements from @app/core-contract.
 */

import type {
  TenantEntitlements,
  SubscriptionTier,
  SubscriptionFeatures,
} from "@app/core-contract";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Grace period in days for past_due subscriptions */
export const GRACE_PERIOD_DAYS = 7;

/** Free tier entitlements (default when no subscription) */
export const FREE_TIER_ENTITLEMENTS: Omit<TenantEntitlements, "tenantId"> = {
  tier: "free",
  hasAccess: true,
  features: {
    adsEnabled: true,
    exportLimit: 10,
    bulkExport: false,
    prioritySupport: false,
    maxMembers: 5,
  },
};

/** Pro tier entitlements */
export const PRO_TIER_ENTITLEMENTS: Omit<TenantEntitlements, "tenantId" | "subscription"> = {
  tier: "pro",
  hasAccess: true,
  features: {
    adsEnabled: false,
    exportLimit: -1, // unlimited
    bulkExport: true,
    prioritySupport: true,
    maxMembers: -1, // unlimited
  },
};

/** Enterprise tier entitlements */
export const ENTERPRISE_TIER_ENTITLEMENTS: Omit<TenantEntitlements, "tenantId" | "subscription"> = {
  tier: "enterprise",
  hasAccess: true,
  features: {
    adsEnabled: false,
    exportLimit: -1, // unlimited
    bulkExport: true,
    prioritySupport: true,
    maxMembers: -1, // unlimited
  },
};

// =============================================================================
// GUARD FUNCTIONS
// =============================================================================

/**
 * Check if tenant has a specific subscription tier or higher.
 *
 * @param entitlements - The tenant's entitlements
 * @param requiredTier - The minimum tier required
 * @returns true if tenant meets tier requirement
 *
 * @example
 * if (!requireEntitlement(entitlements, "pro")) {
 *   throw new Error("Upgrade to Pro required");
 * }
 */
export function requireEntitlement(
  entitlements: TenantEntitlements,
  requiredTier: "pro" | "enterprise"
): boolean {
  const tierHierarchy: SubscriptionTier[] = ["free", "pro", "enterprise"];
  const currentIndex = tierHierarchy.indexOf(entitlements.tier);
  const requiredIndex = tierHierarchy.indexOf(requiredTier);

  return currentIndex >= requiredIndex;
}

/**
 * Check if tenant has access to a specific feature.
 *
 * @param entitlements - The tenant's entitlements
 * @param feature - The feature to check
 * @returns true if feature is available
 *
 * @example
 * if (!requireFeature(entitlements, "bulkExport")) {
 *   throw new Error("Bulk export requires Pro subscription");
 * }
 */
export function requireFeature(
  entitlements: TenantEntitlements,
  feature: keyof SubscriptionFeatures
): boolean {
  const value = entitlements.features[feature];

  // For numeric features, check if > 0 or == -1 (unlimited)
  if (typeof value === "number") {
    return value === -1 || value > 0;
  }

  // For boolean features
  if (typeof value === "boolean") {
    // Special case: adsEnabled being true means ads are shown (free tier)
    // So we invert: requireFeature(e, "adsEnabled") returns true if NO ads
    if (feature === "adsEnabled") {
      return value === false; // No ads = has feature
    }
    return value === true;
  }

  return false;
}

/**
 * Check if tenant has active subscription access (not expired/cancelled).
 */
export function hasActiveAccess(entitlements: TenantEntitlements): boolean {
  return entitlements.hasAccess;
}

/**
 * Check if tenant is on free tier.
 */
export function isFreeTier(entitlements: TenantEntitlements): boolean {
  return entitlements.tier === "free";
}

/**
 * Check if tenant has pro tier or higher.
 */
export function isProOrHigher(entitlements: TenantEntitlements): boolean {
  return entitlements.tier === "pro" || entitlements.tier === "enterprise";
}

/**
 * Get the export limit for a tenant (-1 means unlimited).
 */
export function getExportLimit(entitlements: TenantEntitlements): number {
  return entitlements.features.exportLimit;
}

/**
 * Get the member limit for a tenant (-1 means unlimited).
 */
export function getMemberLimit(entitlements: TenantEntitlements): number {
  return entitlements.features.maxMembers;
}

/**
 * Check if subscription is in grace period (past_due but still has access).
 */
export function isInGracePeriod(entitlements: TenantEntitlements): boolean {
  if (!entitlements.subscription) return false;
  return entitlements.subscription.status === "past_due" && entitlements.hasAccess;
}

/**
 * Check if subscription is cancelled but still active until period end.
 */
export function isCancelledButActive(entitlements: TenantEntitlements): boolean {
  if (!entitlements.subscription) return false;
  return (
    entitlements.subscription.status === "canceled" &&
    entitlements.subscription.cancelAtPeriodEnd &&
    entitlements.hasAccess
  );
}

/**
 * Get days until subscription ends (for cancelled/expiring subscriptions).
 * Returns null if no end date or subscription is active.
 */
export function getDaysUntilExpiry(entitlements: TenantEntitlements): number | null {
  if (!entitlements.subscription?.periodEnd) return null;
  if (!entitlements.subscription.cancelAtPeriodEnd) return null;

  const now = new Date();
  const end = new Date(entitlements.subscription.periodEnd);
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}
