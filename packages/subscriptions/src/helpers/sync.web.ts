import { useSubscriptionStore, type CustomerInfo } from "../stores/subscriptionStore";
import { PurchaseError, PurchaseErrorCode } from "../types/errors";

/**
 * Subscription Sync Utilities (Web)
 *
 * Web-specific utilities for syncing subscription state
 * Note: Web SDK has different capabilities than native
 */

/**
 * Force refresh customer info from RevenueCat
 *
 * Use this when:
 * - User returns to the app after being away
 * - Purchase webhook updates server-side entitlements
 * - User reports subscription not showing
 */
export async function refreshSubscription(): Promise<CustomerInfo | null> {
  // Web SDK requires fetching from the configured instance
  // This is typically handled by the provider's polling
  console.warn(
    "[Subscriptions] refreshSubscription on web requires the RevenueCat provider to be active. " +
      "Consider using the provider's built-in refresh mechanism."
  );

  return useSubscriptionStore.getState().customerInfo;
}

/**
 * Sync purchases with RevenueCat (no-op on web)
 *
 * Web purchases are always synced in real-time
 */
export async function syncPurchases(): Promise<CustomerInfo | null> {
  // Web SDK handles this automatically
  return useSubscriptionStore.getState().customerInfo;
}

/**
 * Restore purchases for the current user
 *
 * On web, this typically requires re-authentication
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  throw new PurchaseError(
    PurchaseErrorCode.UNKNOWN,
    "Restore purchases on web requires the RevenueCat provider. Use useRevenueCat().restorePurchases() instead."
  );
}

/**
 * Log in user to RevenueCat (requires provider)
 */
export async function loginUser(_userId: string): Promise<CustomerInfo> {
  throw new PurchaseError(
    PurchaseErrorCode.UNKNOWN,
    "Login on web requires the RevenueCat provider. Pass userId to RevenueCatProvider instead."
  );
}

/**
 * Log out user from RevenueCat (requires provider)
 */
export async function logoutUser(): Promise<CustomerInfo> {
  throw new PurchaseError(
    PurchaseErrorCode.UNKNOWN,
    "Logout on web requires the RevenueCat provider. Remove userId from RevenueCatProvider instead."
  );
}

/**
 * Check if user has active entitlement (without React hooks)
 */
export function hasActiveEntitlement(entitlementId: string): boolean {
  const store = useSubscriptionStore.getState();
  return store.hasEntitlement(entitlementId);
}

/**
 * Get current customer info snapshot
 */
export function getCustomerInfo(): CustomerInfo | null {
  return useSubscriptionStore.getState().customerInfo;
}

/**
 * Reset subscription state
 */
export function resetSubscriptionState(): void {
  useSubscriptionStore.getState().reset();
}

/**
 * Set user attributes (no-op on web currently)
 *
 * Web SDK doesn't support setting attributes directly.
 * On web, RevenueCat events are not automatically sent to PostHog.
 * Use Polar webhooks + server-side PostHog tracking instead.
 *
 * @see packages/subscriptions/src/server/webhooks.ts for server-side tracking
 */
export async function setUserAttributes(
  _attributes:
    | Record<string, string>
    | {
        email?: string;
        displayName?: string;
        phoneNumber?: string;
        customAttributes?: Record<string, string>;
      }
): Promise<void> {
  // Web payments go through Polar, which has its own PostHog integration
  // configured in the Polar dashboard, not via client-side attributes
  if (__DEV__) {
    console.log(
      "[Subscriptions] setUserAttributes skipped on web (use Polar + server-side tracking)"
    );
  }
}

/**
 * Get anonymous user ID (not available on web)
 */
export async function getAnonymousUserId(): Promise<string | null> {
  console.warn("[Subscriptions] getAnonymousUserId is not supported on web");
  return null;
}
