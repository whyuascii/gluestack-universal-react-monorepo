import type { CustomerInfo, EntitlementInfo } from "../stores/subscriptionStore";

// Declare window and navigator.product for cross-platform detection
declare const window: Window | undefined;
declare global {
  interface Navigator {
    product?: string;
  }
}

/**
 * Analytics Integration Helpers for Subscriptions
 *
 * These helpers format subscription data for analytics tracking.
 * They're designed to work with any analytics provider (PostHog, Amplitude, etc.)
 *
 * Usage with PostHog:
 * ```typescript
 * import { analytics } from "@app/analytics/mobile";
 * import { formatSubscriptionEvent } from "@app/subscriptions";
 *
 * const event = formatSubscriptionEvent("purchased", customerInfo);
 * analytics.track("subscription_purchased", event);
 * ```
 */

/**
 * Subscription event types for analytics
 */
export type SubscriptionEventType =
  | "viewed_paywall"
  | "started_purchase"
  | "purchased"
  | "restored"
  | "cancelled"
  | "failed"
  | "expired"
  | "renewed";

/**
 * Base properties included in all subscription events
 */
export interface SubscriptionEventBase {
  event_type: SubscriptionEventType;
  timestamp: string;
  platform: string;
}

/**
 * Paywall view event properties
 */
export interface PaywallViewedEvent extends SubscriptionEventBase {
  event_type: "viewed_paywall";
  source?: string;
  offering_id?: string;
}

/**
 * Purchase started event properties
 */
export interface PurchaseStartedEvent extends SubscriptionEventBase {
  event_type: "started_purchase";
  product_id: string;
  price?: number;
  currency?: string;
  offering_id?: string;
}

/**
 * Purchase completed event properties
 */
export interface PurchaseCompletedEvent extends SubscriptionEventBase {
  event_type: "purchased";
  product_id: string;
  entitlement_id: string;
  price?: number;
  currency?: string;
  is_trial?: boolean;
  original_app_user_id: string;
}

/**
 * Restore event properties
 */
export interface RestoreEvent extends SubscriptionEventBase {
  event_type: "restored";
  entitlements_restored: number;
  products_restored: number;
}

/**
 * Purchase failed event properties
 */
export interface PurchaseFailedEvent extends SubscriptionEventBase {
  event_type: "failed";
  error_code: string;
  error_message: string;
  product_id?: string;
}

/**
 * All subscription event types
 */
export type SubscriptionEvent =
  | PaywallViewedEvent
  | PurchaseStartedEvent
  | PurchaseCompletedEvent
  | RestoreEvent
  | PurchaseFailedEvent
  | SubscriptionEventBase;

/**
 * Get current platform string
 * Uses navigator.product to detect React Native without importing the module
 */
function getPlatform(): string {
  // Check for React Native environment without importing the module
  // React Native sets navigator.product = "ReactNative"
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    // We're in React Native - check for iOS vs Android
    // Use userAgent which contains platform info in RN
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    if (ua.includes("iPhone") || ua.includes("iPad")) {
      return "ios";
    }
    if (ua.includes("Android")) {
      return "android";
    }
    return "native";
  }

  // Web environment
  if (typeof window !== "undefined") {
    return "web";
  }

  return "unknown";
}

/**
 * Format paywall viewed event
 */
export function formatPaywallViewedEvent(options?: {
  source?: string;
  offeringId?: string;
}): PaywallViewedEvent {
  return {
    event_type: "viewed_paywall",
    timestamp: new Date().toISOString(),
    platform: getPlatform(),
    source: options?.source,
    offering_id: options?.offeringId,
  };
}

/**
 * Format purchase started event
 */
export function formatPurchaseStartedEvent(options: {
  productId: string;
  price?: number;
  currency?: string;
  offeringId?: string;
}): PurchaseStartedEvent {
  return {
    event_type: "started_purchase",
    timestamp: new Date().toISOString(),
    platform: getPlatform(),
    product_id: options.productId,
    price: options.price,
    currency: options.currency,
    offering_id: options.offeringId,
  };
}

/**
 * Format purchase completed event from CustomerInfo
 */
export function formatPurchaseCompletedEvent(
  customerInfo: CustomerInfo,
  productId: string,
  entitlementId: string,
  options?: {
    price?: number;
    currency?: string;
    isTrial?: boolean;
  }
): PurchaseCompletedEvent {
  return {
    event_type: "purchased",
    timestamp: new Date().toISOString(),
    platform: getPlatform(),
    product_id: productId,
    entitlement_id: entitlementId,
    price: options?.price,
    currency: options?.currency,
    is_trial: options?.isTrial,
    original_app_user_id: customerInfo.originalAppUserId,
  };
}

/**
 * Format restore event from CustomerInfo
 */
export function formatRestoreEvent(customerInfo: CustomerInfo): RestoreEvent {
  return {
    event_type: "restored",
    timestamp: new Date().toISOString(),
    platform: getPlatform(),
    entitlements_restored: Object.keys(customerInfo.entitlements.active).length,
    products_restored: customerInfo.activeSubscriptions.length,
  };
}

/**
 * Format purchase failed event
 */
export function formatPurchaseFailedEvent(
  errorCode: string,
  errorMessage: string,
  productId?: string
): PurchaseFailedEvent {
  return {
    event_type: "failed",
    timestamp: new Date().toISOString(),
    platform: getPlatform(),
    error_code: errorCode,
    error_message: errorMessage,
    product_id: productId,
  };
}

/**
 * Extract user properties from CustomerInfo for analytics identify
 *
 * Usage with PostHog:
 * ```typescript
 * const userProps = extractUserPropertiesFromSubscription(customerInfo);
 * posthog.identify(userId, userProps);
 * ```
 */
export function extractUserPropertiesFromSubscription(
  customerInfo: CustomerInfo | null
): Record<string, string | number | boolean | null> {
  if (!customerInfo) {
    return {
      has_premium: false,
      subscription_status: "free",
      active_subscriptions: 0,
    };
  }

  const activeEntitlements = Object.keys(customerInfo.entitlements.active);
  const hasPremium = activeEntitlements.length > 0;

  // Find the latest entitlement for expiration info
  let latestExpiration: Date | null = null;
  let latestProductId: string | null = null;

  const activeEntitlementValues = Object.values(
    customerInfo.entitlements.active
  ) as EntitlementInfo[];
  for (const entitlement of activeEntitlementValues) {
    if (entitlement.expirationDate) {
      if (!latestExpiration || entitlement.expirationDate > latestExpiration) {
        latestExpiration = entitlement.expirationDate;
        latestProductId = entitlement.productIdentifier;
      }
    }
  }

  // Get first purchase date from all entitlements
  const allEntitlementValues = Object.values(customerInfo.entitlements.all) as EntitlementInfo[];
  const firstPurchaseDate = allEntitlementValues[0]?.purchaseDate;

  return {
    has_premium: hasPremium,
    subscription_status: hasPremium ? "premium" : "free",
    active_subscriptions: customerInfo.activeSubscriptions.length,
    active_entitlements: activeEntitlements.join(",") || null,
    subscription_product: latestProductId,
    subscription_expiration: latestExpiration?.toISOString() || null,
    original_app_user_id: customerInfo.originalAppUserId,
    first_purchase_date: firstPurchaseDate?.toISOString() || null,
  };
}

/**
 * Calculate subscription metrics for dashboard/analytics
 */
export function calculateSubscriptionMetrics(customerInfo: CustomerInfo | null): {
  isSubscribed: boolean;
  daysSinceFirstPurchase: number | null;
  daysUntilExpiration: number | null;
  totalEntitlements: number;
  activeEntitlements: number;
} {
  if (!customerInfo) {
    return {
      isSubscribed: false,
      daysSinceFirstPurchase: null,
      daysUntilExpiration: null,
      totalEntitlements: 0,
      activeEntitlements: 0,
    };
  }

  const activeEntitlements = Object.keys(customerInfo.entitlements.active).length;
  const totalEntitlements = Object.keys(customerInfo.entitlements.all).length;

  // Calculate days since first purchase
  let firstPurchaseDate: Date | null = null;
  const allEntitlements = Object.values(customerInfo.entitlements.all) as EntitlementInfo[];
  for (const entitlement of allEntitlements) {
    const purchaseDate = entitlement.purchaseDate;
    if (!firstPurchaseDate || purchaseDate < firstPurchaseDate) {
      firstPurchaseDate = purchaseDate;
    }
  }

  const daysSinceFirstPurchase = firstPurchaseDate
    ? Math.floor((Date.now() - firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate days until expiration (for earliest expiring active entitlement)
  let earliestExpiration: Date | null = null;
  const activeEntitlementsList = Object.values(
    customerInfo.entitlements.active
  ) as EntitlementInfo[];
  for (const entitlement of activeEntitlementsList) {
    if (entitlement.expirationDate) {
      if (!earliestExpiration || entitlement.expirationDate < earliestExpiration) {
        earliestExpiration = entitlement.expirationDate;
      }
    }
  }

  const daysUntilExpiration = earliestExpiration
    ? Math.floor((earliestExpiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    isSubscribed: activeEntitlements > 0,
    daysSinceFirstPurchase,
    daysUntilExpiration,
    totalEntitlements,
    activeEntitlements,
  };
}
