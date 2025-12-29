import { useCallback } from "react";
import Purchases, {
  type PurchasesOfferings,
  type PurchasesPackage,
  type CustomerInfo as RCCustomerInfo,
} from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import {
  useSubscriptionStore,
  type CustomerInfo,
  type EntitlementsRecord,
} from "../stores/subscriptionStore";

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
 * Hook for low-level RevenueCat SDK access (React Native)
 *
 * Provides direct access to purchase, restore, and offerings functionality
 */
export function useRevenueCat() {
  const setCustomerInfo = useSubscriptionStore((state) => state.setCustomerInfo);
  const setError = useSubscriptionStore((state) => state.setError);

  /**
   * Get available offerings (products/packages)
   */
  const getOfferings = useCallback(async (): Promise<PurchasesOfferings> => {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error("[RevenueCat] Failed to get offerings:", error);
      setError(error as Error);
      throw error;
    }
  }, [setError]);

  /**
   * Purchase a package
   */
  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<CustomerInfo> => {
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const converted = convertCustomerInfo(customerInfo);
        setCustomerInfo(converted);
        return converted;
      } catch (error) {
        console.error("[RevenueCat] Purchase failed:", error);
        setError(error as Error);
        throw error;
      }
    },
    [setCustomerInfo, setError]
  );

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const converted = convertCustomerInfo(customerInfo);
      setCustomerInfo(converted);
      return converted;
    } catch (error) {
      console.error("[RevenueCat] Restore failed:", error);
      setError(error as Error);
      throw error;
    }
  }, [setCustomerInfo, setError]);

  /**
   * Present the Customer Center (native only)
   * Allows users to manage their subscription
   */
  const presentCustomerCenter = useCallback(async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      console.error("[RevenueCat] Failed to present Customer Center:", error);
      setError(error as Error);
    }
  }, [setError]);

  /**
   * Check if Customer Center is available
   * (Always true on native, but included for API consistency)
   */
  const isCustomerCenterAvailable = true;

  return {
    getOfferings,
    purchasePackage,
    restorePurchases,
    presentCustomerCenter,
    isCustomerCenterAvailable,
  };
}
