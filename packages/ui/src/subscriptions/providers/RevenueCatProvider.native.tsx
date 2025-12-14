import React, { useEffect, useRef } from "react";
import Purchases, { LOG_LEVEL, type CustomerInfo as RCCustomerInfo } from "react-native-purchases";
import { useAuthStore } from "../../store/authStore";
import { REVENUECAT_CONFIG } from "../config/revenuecat";
import {
  useSubscriptionStore,
  type CustomerInfo,
  type EntitlementsRecord,
} from "../stores/subscriptionStore";

interface RevenueCatProviderProps {
  children: React.ReactNode;
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
      isActive: value.isActive,
      productIdentifier: value.productIdentifier,
      purchaseDate: new Date(value.latestPurchaseDate),
      expirationDate: value.expirationDate ? new Date(value.expirationDate) : null,
    };
  });

  // Convert all entitlements
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
 * RevenueCat Provider for React Native (Mobile)
 *
 * Responsibilities:
 * 1. Initialize RevenueCat SDK on mount
 * 2. Sync with auth state (login/logout)
 * 3. Listen to customer info updates
 * 4. Populate subscription store
 */
export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const user = useAuthStore((state) => state.user);
  const setCustomerInfo = useSubscriptionStore((state) => state.setCustomerInfo);
  const setLoading = useSubscriptionStore((state) => state.setLoading);
  const setError = useSubscriptionStore((state) => state.setError);
  const isInitialized = useRef(false);

  // Initialize SDK once on mount
  useEffect(() => {
    if (isInitialized.current) return;

    async function initializeRevenueCat() {
      try {
        // Configure SDK with API key
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        await Purchases.configure({
          apiKey: REVENUECAT_CONFIG.apiKey,
        });

        isInitialized.current = true;

        // Fetch initial customer info
        const customerInfo = await Purchases.getCustomerInfo();
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
    if (!isInitialized.current) return;

    Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(convertCustomerInfo(info));
    });

    // No cleanup needed - listener is managed by SDK
  }, [setCustomerInfo]);

  // Sync with auth state (login/logout)
  useEffect(() => {
    if (!isInitialized.current) return;

    async function syncAuthState() {
      try {
        setLoading(true);

        if (user?.id) {
          // User logged in - transfer subscription to user account
          const { customerInfo } = await Purchases.logIn(user.id);
          setCustomerInfo(convertCustomerInfo(customerInfo));
        } else {
          // User logged out - reset to anonymous
          const customerInfo = await Purchases.logOut();
          setCustomerInfo(convertCustomerInfo(customerInfo));
        }
      } catch (error) {
        console.error("[RevenueCat] Auth sync failed:", error);
        setError(error as Error);
      }
    }

    syncAuthState();
  }, [user?.id, setCustomerInfo, setLoading, setError]);

  return <>{children}</>;
}
