import Purchases, { type CustomerInfo as RCCustomerInfo } from "react-native-purchases";
import {
  useSubscriptionStore,
  type CustomerInfo,
  type EntitlementsRecord,
} from "../stores/subscriptionStore";
import { parsePurchaseError, PurchaseError, PurchaseErrorCode } from "../types/errors";
import { isRevenueCatAvailable } from "./expo";

/**
 * Subscription Sync Utilities (Native)
 *
 * Utilities for syncing subscription state with RevenueCat
 * These work outside of React components
 */

/**
 * Convert RevenueCat CustomerInfo to our platform-agnostic format
 */
function convertCustomerInfo(rcInfo: RCCustomerInfo): CustomerInfo {
  const entitlements: {
    active: EntitlementsRecord;
    all: EntitlementsRecord;
  } = {
    active: {},
    all: {},
  };

  Object.entries(rcInfo.entitlements.active).forEach(([key, value]) => {
    entitlements.active[key] = {
      identifier: value.identifier,
      isActive: value.isActive,
      productIdentifier: value.productIdentifier,
      purchaseDate: new Date(value.latestPurchaseDate),
      expirationDate: value.expirationDate ? new Date(value.expirationDate) : null,
    };
  });

  Object.entries(rcInfo.entitlements.all).forEach(([key, value]) => {
    entitlements.all[key] = {
      identifier: value.identifier,
      isActive: value.isActive,
      productIdentifier: value.productIdentifier,
      purchaseDate: new Date(value.latestPurchaseDate),
      expirationDate: value.expirationDate ? new Date(value.expirationDate) : null,
    };
  });

  return {
    activeSubscriptions: rcInfo.activeSubscriptions,
    allPurchasedProductIdentifiers: rcInfo.allPurchasedProductIdentifiers,
    entitlements,
    originalAppUserId: rcInfo.originalAppUserId,
    originalApplicationVersion: rcInfo.originalApplicationVersion,
    requestDate: new Date(rcInfo.requestDate),
  };
}

/**
 * Force refresh customer info from RevenueCat
 *
 * Use this when:
 * - User returns to the app after being away
 * - Purchase webhook updates server-side entitlements
 * - User reports subscription not showing
 */
export async function refreshSubscription(): Promise<CustomerInfo | null> {
  if (!isRevenueCatAvailable()) {
    throw new PurchaseError(
      PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED,
      "RevenueCat is not available in this environment"
    );
  }

  try {
    const store = useSubscriptionStore.getState();
    store.setLoading(true);

    const customerInfo = await Purchases.getCustomerInfo();
    const converted = convertCustomerInfo(customerInfo);

    store.setCustomerInfo(converted);
    return converted;
  } catch (error) {
    const purchaseError = parsePurchaseError(error);
    useSubscriptionStore.getState().setError(purchaseError);
    throw purchaseError;
  }
}

/**
 * Sync purchases with RevenueCat
 *
 * Call this when:
 * - App resumes from background (for offline purchases)
 * - After a purchase flow that might have been interrupted
 * - To ensure local receipts are synced with RevenueCat
 */
export async function syncPurchases(): Promise<CustomerInfo | null> {
  if (!isRevenueCatAvailable()) {
    return null;
  }

  try {
    // syncPurchases syncs receipts with RevenueCat, then we fetch updated customer info
    await Purchases.syncPurchases();
    const customerInfo = await Purchases.getCustomerInfo();
    const converted = convertCustomerInfo(customerInfo);

    useSubscriptionStore.getState().setCustomerInfo(converted);
    return converted;
  } catch (error) {
    console.warn("[Subscriptions] Failed to sync purchases:", error);
    return null;
  }
}

/**
 * Restore purchases for the current user
 *
 * Use this for:
 * - "Restore Purchases" button in settings
 * - User claims they purchased but subscription not showing
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  if (!isRevenueCatAvailable()) {
    throw new PurchaseError(
      PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED,
      "RevenueCat is not available in this environment"
    );
  }

  try {
    const store = useSubscriptionStore.getState();
    store.setLoading(true);

    const customerInfo = await Purchases.restorePurchases();
    const converted = convertCustomerInfo(customerInfo);

    store.setCustomerInfo(converted);
    return converted;
  } catch (error) {
    const purchaseError = parsePurchaseError(error);
    useSubscriptionStore.getState().setError(purchaseError);
    throw purchaseError;
  }
}

/**
 * Log in user to RevenueCat
 *
 * Call this after user authentication to:
 * - Associate purchases with the user account
 * - Enable cross-device subscription sync
 */
export async function loginUser(userId: string): Promise<CustomerInfo> {
  if (!isRevenueCatAvailable()) {
    throw new PurchaseError(
      PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED,
      "RevenueCat is not available in this environment"
    );
  }

  try {
    const { customerInfo } = await Purchases.logIn(userId);
    const converted = convertCustomerInfo(customerInfo);

    useSubscriptionStore.getState().setCustomerInfo(converted);
    return converted;
  } catch (error) {
    const purchaseError = parsePurchaseError(error);
    useSubscriptionStore.getState().setError(purchaseError);
    throw purchaseError;
  }
}

/**
 * Log out user from RevenueCat
 *
 * Call this on user logout to:
 * - Clear cached customer info
 * - Reset to anonymous user
 */
export async function logoutUser(): Promise<CustomerInfo> {
  if (!isRevenueCatAvailable()) {
    throw new PurchaseError(
      PurchaseErrorCode.EXPO_GO_NOT_SUPPORTED,
      "RevenueCat is not available in this environment"
    );
  }

  try {
    const customerInfo = await Purchases.logOut();
    const converted = convertCustomerInfo(customerInfo);

    useSubscriptionStore.getState().setCustomerInfo(converted);
    return converted;
  } catch (error) {
    const purchaseError = parsePurchaseError(error);
    useSubscriptionStore.getState().setError(purchaseError);
    throw purchaseError;
  }
}

/**
 * Check if user has active entitlement (without React hooks)
 *
 * Useful for:
 * - Navigation guards
 * - API request interceptors
 * - Non-component logic
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
 *
 * Call this when:
 * - User logs out
 * - App needs clean subscription state
 */
export function resetSubscriptionState(): void {
  useSubscriptionStore.getState().reset();
}

/**
 * Set subscription attributes for the user
 *
 * Supports both flat object (for SubscriptionSync) and typed object formats.
 *
 * Flat format (from SubscriptionSync):
 * - $email → setEmail()
 * - $displayName → setDisplayName()
 * - $phoneNumber → setPhoneNumber()
 * - $posthogUserId → setAttributes() (for RevenueCat + PostHog integration)
 * - Other keys → setAttributes()
 *
 * Typed format (legacy):
 * - email, displayName, phoneNumber, customAttributes
 *
 * @see https://www.revenuecat.com/docs/integrations/posthog
 */
export async function setUserAttributes(
  attributes:
    | Record<string, string>
    | {
        email?: string;
        displayName?: string;
        phoneNumber?: string;
        customAttributes?: Record<string, string>;
      }
): Promise<void> {
  if (!isRevenueCatAvailable()) {
    return;
  }

  try {
    // Handle flat object format (from SubscriptionSync)
    if ("$email" in attributes || "$displayName" in attributes || "$posthogUserId" in attributes) {
      const flatAttrs = attributes as Record<string, string>;

      if (flatAttrs.$email) {
        await Purchases.setEmail(flatAttrs.$email);
      }
      if (flatAttrs.$displayName) {
        await Purchases.setDisplayName(flatAttrs.$displayName);
      }
      if (flatAttrs.$phoneNumber) {
        await Purchases.setPhoneNumber(flatAttrs.$phoneNumber);
      }

      // Set all other attributes (including $posthogUserId for PostHog integration)
      const customAttrs: Record<string, string> = {};
      for (const [key, value] of Object.entries(flatAttrs)) {
        // Skip the ones we already handled with dedicated methods
        if (!["$email", "$displayName", "$phoneNumber"].includes(key)) {
          customAttrs[key] = value;
        }
      }

      if (Object.keys(customAttrs).length > 0) {
        await Purchases.setAttributes(customAttrs);
      }
      return;
    }

    // Handle typed object format (legacy)
    const typedAttrs = attributes as {
      email?: string;
      displayName?: string;
      phoneNumber?: string;
      customAttributes?: Record<string, string>;
    };

    if (typedAttrs.email) {
      await Purchases.setEmail(typedAttrs.email);
    }
    if (typedAttrs.displayName) {
      await Purchases.setDisplayName(typedAttrs.displayName);
    }
    if (typedAttrs.phoneNumber) {
      await Purchases.setPhoneNumber(typedAttrs.phoneNumber);
    }
    if (typedAttrs.customAttributes) {
      await Purchases.setAttributes(typedAttrs.customAttributes);
    }
  } catch (error) {
    console.warn("[Subscriptions] Failed to set user attributes:", error);
  }
}

/**
 * Get anonymous user ID from RevenueCat
 *
 * Useful for identifying users before login
 */
export async function getAnonymousUserId(): Promise<string | null> {
  if (!isRevenueCatAvailable()) {
    return null;
  }

  try {
    const appUserId = await Purchases.getAppUserID();
    return appUserId;
  } catch (error) {
    console.warn("[Subscriptions] Failed to get app user ID:", error);
    return null;
  }
}
