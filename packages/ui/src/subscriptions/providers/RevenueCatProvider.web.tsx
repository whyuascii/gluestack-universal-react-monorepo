import { Purchases, type CustomerInfo as RCCustomerInfo } from "@revenuecat/purchases-js";
import React, { useEffect, useRef } from "react";
import { REVENUECAT_CONFIG } from "../config/revenuecat";
import {
  useSubscriptionStore,
  type CustomerInfo,
  type EntitlementsRecord,
} from "../stores/subscriptionStore";

// Type for the Purchases instance (SDK doesn't export this properly)
interface PurchasesInstance {
  getCustomerInfo: () => Promise<RCCustomerInfo>;
  logIn: (params: { appUserId: string }) => Promise<{ customerInfo: RCCustomerInfo }>;
  logOut: () => Promise<{ customerInfo: RCCustomerInfo }>;
}

interface RevenueCatProviderProps {
  children: React.ReactNode;
  userId?: string; // Better Auth user ID
}

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

  // Convert active entitlements
  Object.entries(rcInfo.entitlements.active).forEach(([key, value]) => {
    entitlements.active[key] = {
      identifier: value.identifier,
      isActive: true, // Active entitlements are always active
      productIdentifier: value.productIdentifier,
      purchaseDate: value.latestPurchaseDate,
      expirationDate: value.expirationDate,
    };
  });

  // Convert all entitlements
  Object.entries(rcInfo.entitlements.all).forEach(([key, value]) => {
    const isActive = key in rcInfo.entitlements.active;
    entitlements.all[key] = {
      identifier: value.identifier,
      isActive,
      productIdentifier: value.productIdentifier,
      purchaseDate: value.latestPurchaseDate,
      expirationDate: value.expirationDate,
    };
  });

  return {
    activeSubscriptions: Array.from(rcInfo.activeSubscriptions),
    allPurchasedProductIdentifiers: [],
    entitlements,
    originalAppUserId: rcInfo.originalAppUserId,
    originalApplicationVersion: null,
    requestDate: new Date(),
  };
}

/**
 * RevenueCat Provider for Web
 *
 * Responsibilities:
 * 1. Initialize RevenueCat SDK on mount
 * 2. Sync with auth state (login/logout)
 * 3. Listen to customer info updates
 * 4. Populate subscription store
 */
export function RevenueCatProvider({ children, userId }: RevenueCatProviderProps) {
  const setCustomerInfo = useSubscriptionStore((state) => state.setCustomerInfo);
  const setLoading = useSubscriptionStore((state) => state.setLoading);
  const setError = useSubscriptionStore((state) => state.setError);
  const isInitialized = useRef(false);
  const purchasesRef = useRef<PurchasesInstance | null>(null);

  // Initialize SDK once on mount
  useEffect(() => {
    if (isInitialized.current) return;

    async function initializeRevenueCat() {
      try {
        // Configure SDK with API key (SDK types are incomplete, so we cast)
        const instance = (await (
          Purchases as unknown as { configure: (apiKey: string) => Promise<PurchasesInstance> }
        ).configure(REVENUECAT_CONFIG.apiKey)) as PurchasesInstance;
        purchasesRef.current = instance;
        isInitialized.current = true;

        // Fetch initial customer info
        const customerInfo = await instance.getCustomerInfo();
        setCustomerInfo(convertCustomerInfo(customerInfo));
      } catch (error) {
        console.error("[RevenueCat] Initialization failed:", error);
        setError(error as Error);
      }
    }

    initializeRevenueCat();
  }, [setCustomerInfo, setError]);

  // Listen to customer info updates
  useEffect(() => {
    if (!purchasesRef.current) return;

    // Web SDK uses a different event system - poll for updates instead
    const interval = globalThis.setInterval(async () => {
      try {
        const purchases = purchasesRef.current;
        if (!purchases) return;

        const customerInfo = await purchases.getCustomerInfo();
        setCustomerInfo(convertCustomerInfo(customerInfo));
      } catch (error) {
        console.error("[RevenueCat] Failed to fetch customer info:", error);
      }
    }, 60000); // Poll every minute

    return () => {
      globalThis.clearInterval(interval);
    };
  }, [setCustomerInfo]);

  // Sync with auth state (login/logout)
  useEffect(() => {
    if (!purchasesRef.current) return;

    async function syncAuthState() {
      const purchases = purchasesRef.current;
      if (!purchases) return;

      try {
        setLoading(true);

        if (userId) {
          // User logged in - transfer subscription to user account
          const { customerInfo } = await purchases.logIn({ appUserId: userId });
          setCustomerInfo(convertCustomerInfo(customerInfo));
        } else {
          // User logged out - reset to anonymous
          const { customerInfo } = await purchases.logOut();
          setCustomerInfo(convertCustomerInfo(customerInfo));
        }
      } catch (error) {
        console.error("[RevenueCat] Auth sync failed:", error);
        setError(error as Error);
      }
    }

    syncAuthState();
  }, [userId, setCustomerInfo, setLoading, setError]);

  return <>{children}</>;
}
