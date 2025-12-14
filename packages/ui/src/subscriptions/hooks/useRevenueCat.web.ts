import {
  Purchases,
  type Offering,
  type CustomerInfo as RCCustomerInfo,
} from "@revenuecat/purchases-js";
import { useCallback, useRef, useEffect } from "react";
import {
  useSubscriptionStore,
  type CustomerInfo,
  type EntitlementsRecord,
} from "../stores/subscriptionStore";

// Type for package (SDK doesn't export this properly for web)
interface WebPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
  };
}

// Type for the Purchases instance
interface PurchasesInstance {
  getOfferings: () => Promise<{ current: Offering | null; all: Record<string, Offering> }>;
  purchase: (params: { rcPackage: WebPackage }) => Promise<{ customerInfo: RCCustomerInfo }>;
  restorePurchases: () => Promise<RCCustomerInfo>;
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

  Object.entries(rcInfo.entitlements.active).forEach(([key, value]) => {
    entitlements.active[key] = {
      identifier: value.identifier,
      isActive: true,
      productIdentifier: value.productIdentifier,
      purchaseDate: value.latestPurchaseDate,
      expirationDate: value.expirationDate,
    };
  });

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
 * Offerings response type for web
 */
interface Offerings {
  current: Offering | null;
  all: Record<string, Offering>;
}

/**
 * Hook for low-level RevenueCat SDK access (Web)
 *
 * Provides direct access to purchase, restore, and offerings functionality
 */
export function useRevenueCat() {
  const setCustomerInfo = useSubscriptionStore((state) => state.setCustomerInfo);
  const setError = useSubscriptionStore((state) => state.setError);
  const purchasesRef = useRef<PurchasesInstance | null>(null);

  // Get Purchases instance (initialized by provider)
  useEffect(() => {
    // Purchases.getSharedInstance() is not available in web SDK
    // We need to get it from the configure call in the provider
    // For now, we'll use the global Purchases object with proper typing
    purchasesRef.current = Purchases as unknown as PurchasesInstance;
  }, []);

  /**
   * Get available offerings (products/packages)
   */
  const getOfferings = useCallback(async (): Promise<Offerings> => {
    try {
      const purchases = purchasesRef.current;
      if (!purchases) {
        throw new Error("RevenueCat not initialized");
      }

      const offerings = await purchases.getOfferings();
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
    async (pkg: WebPackage): Promise<CustomerInfo> => {
      try {
        const purchases = purchasesRef.current;
        if (!purchases) {
          throw new Error("RevenueCat not initialized");
        }

        const { customerInfo } = await purchases.purchase({
          rcPackage: pkg,
        });
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
      const purchases = purchasesRef.current;
      if (!purchases) {
        throw new Error("RevenueCat not initialized");
      }

      const customerInfo = await purchases.restorePurchases();
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
   * Present Customer Center (not available on web)
   */
  const presentCustomerCenter = useCallback(() => {
    console.warn(
      "[RevenueCat] Customer Center is not available on web. Use a custom subscription management UI instead."
    );
  }, []);

  /**
   * Check if Customer Center is available
   * (Always false on web)
   */
  const isCustomerCenterAvailable = false;

  return {
    getOfferings,
    purchasePackage,
    restorePurchases,
    presentCustomerCenter,
    isCustomerCenterAvailable,
  };
}
