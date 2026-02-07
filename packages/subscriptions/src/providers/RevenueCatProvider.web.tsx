import { Purchases, type CustomerInfo as RCCustomerInfo } from "@revenuecat/purchases-js";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { REVENUECAT_CONFIG } from "../config/revenuecat";
import {
  useSubscriptionStore,
  type CustomerInfo,
  type EntitlementsRecord,
} from "../stores/subscriptionStore";
import { parsePurchaseError } from "../types/errors";

// Type for the Purchases instance (SDK doesn't export this properly)
interface PurchasesInstance {
  getCustomerInfo: () => Promise<RCCustomerInfo>;
  logIn: (params: { appUserId: string }) => Promise<{ customerInfo: RCCustomerInfo }>;
  logOut: () => Promise<{ customerInfo: RCCustomerInfo }>;
}

/**
 * Provider configuration options (web)
 */
interface RevenueCatProviderConfig {
  /**
   * Log level - web SDK doesn't support this but included for API consistency
   */
  logLevel?: number;

  /**
   * Polling interval for customer info updates (in milliseconds)
   * @default 60000 (1 minute)
   */
  pollingInterval?: number;
}

interface RevenueCatProviderProps {
  children: React.ReactNode;
  /**
   * User ID for identifying the user (e.g., Better Auth user ID)
   * If provided, user will be identified on mount
   */
  userId?: string;
  /**
   * SDK configuration options
   */
  config?: RevenueCatProviderConfig;
  /**
   * Callback when customer info is updated
   */
  onCustomerInfoUpdate?: (customerInfo: CustomerInfo) => void;
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
  /**
   * Fallback UI to show when RevenueCat is not available
   * If not provided, children will be rendered without subscription functionality
   */
  unavailableFallback?: React.ReactNode;
}

/**
 * Context for RevenueCat availability state
 */
interface RevenueCatContextValue {
  isAvailable: boolean;
  isInitialized: boolean;
  unavailableReason: string | null;
}

const RevenueCatContext = createContext<RevenueCatContextValue>({
  isAvailable: false,
  isInitialized: false,
  unavailableReason: null,
});

/**
 * Hook to check RevenueCat availability
 */
export function useRevenueCatAvailability(): RevenueCatContextValue {
  return useContext(RevenueCatContext);
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
 * 1. Check environment availability (API key configured)
 * 2. Initialize RevenueCat SDK on mount
 * 3. Sync with auth state (login/logout)
 * 4. Poll for customer info updates
 * 5. Populate subscription store
 *
 * Usage:
 * ```tsx
 * import { RevenueCatProvider } from "@app/subscriptions";
 *
 * function App() {
 *   const { user } = useAuth();
 *
 *   return (
 *     <RevenueCatProvider
 *       userId={user?.id}
 *       onCustomerInfoUpdate={(info) => console.log("Updated:", info)}
 *     >
 *       <YourApp />
 *     </RevenueCatProvider>
 *   );
 * }
 * ```
 */
export function RevenueCatProvider({
  children,
  userId,
  config,
  onCustomerInfoUpdate,
  onError,
  unavailableFallback,
}: RevenueCatProviderProps) {
  const setCustomerInfo = useSubscriptionStore((state) => state.setCustomerInfo);
  const setLoading = useSubscriptionStore((state) => state.setLoading);
  const setError = useSubscriptionStore((state) => state.setError);

  const isInitializedRef = useRef(false);
  const purchasesRef = useRef<PurchasesInstance | null>(null);
  const previousUserIdRef = useRef<string | undefined>(undefined);

  const [contextValue, setContextValue] = useState<RevenueCatContextValue>({
    isAvailable: false,
    isInitialized: false,
    unavailableReason: null,
  });

  // Check availability and initialize SDK
  useEffect(() => {
    // Check if API key is configured
    const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
    if (!apiKey) {
      const reason =
        "RevenueCat API key not configured. Set NEXT_PUBLIC_REVENUECAT_API_KEY in your environment.";
      if (process.env.NODE_ENV === "development") {
        console.warn(`[Subscriptions] ${reason}`);
      }
      setContextValue({
        isAvailable: false,
        isInitialized: false,
        unavailableReason: reason,
      });
      setLoading(false);
      return;
    }

    // Already initialized
    if (isInitializedRef.current) {
      return;
    }

    async function initializeRevenueCat() {
      try {
        // Configure SDK with API key (SDK types are incomplete, so we cast)
        const instance = (await (
          Purchases as unknown as { configure: (apiKey: string) => Promise<PurchasesInstance> }
        ).configure(REVENUECAT_CONFIG.apiKey)) as PurchasesInstance;
        purchasesRef.current = instance;
        isInitializedRef.current = true;

        if (process.env.NODE_ENV === "development") {
          console.log("[Subscriptions] RevenueCat initialized successfully (web)");
        }

        // Fetch initial customer info
        const customerInfo = await instance.getCustomerInfo();
        const converted = convertCustomerInfo(customerInfo);
        setCustomerInfo(converted);
        onCustomerInfoUpdate?.(converted);

        setContextValue({
          isAvailable: true,
          isInitialized: true,
          unavailableReason: null,
        });
      } catch (error) {
        const purchaseError = parsePurchaseError(error);
        console.error("[Subscriptions] Initialization failed:", purchaseError);
        setError(purchaseError);
        onError?.(purchaseError);

        setContextValue({
          isAvailable: false,
          isInitialized: false,
          unavailableReason: purchaseError.message,
        });
      }
    }

    initializeRevenueCat();
  }, [setCustomerInfo, setError, setLoading, onCustomerInfoUpdate, onError]);

  // Poll for customer info updates
  useEffect(() => {
    if (!contextValue.isInitialized) return;

    const pollingInterval = config?.pollingInterval ?? 60000; // Default 1 minute

    const interval = globalThis.setInterval(async () => {
      try {
        const purchases = purchasesRef.current;
        if (!purchases) return;

        const customerInfo = await purchases.getCustomerInfo();
        const converted = convertCustomerInfo(customerInfo);
        setCustomerInfo(converted);
        onCustomerInfoUpdate?.(converted);
      } catch (error) {
        // Don't log polling errors in production
        if (process.env.NODE_ENV === "development") {
          console.warn("[Subscriptions] Polling failed:", error);
        }
      }
    }, pollingInterval);

    return () => {
      globalThis.clearInterval(interval);
    };
  }, [contextValue.isInitialized, config?.pollingInterval, setCustomerInfo, onCustomerInfoUpdate]);

  // Sync with auth state (login/logout)
  useEffect(() => {
    if (!contextValue.isInitialized) return;

    // Skip if userId hasn't changed
    if (previousUserIdRef.current === userId) return;
    previousUserIdRef.current = userId;

    async function syncAuthState() {
      const purchases = purchasesRef.current;
      if (!purchases) return;

      try {
        setLoading(true);

        if (userId) {
          // User logged in - transfer subscription to user account
          if (process.env.NODE_ENV === "development") {
            console.log("[Subscriptions] Logging in user:", userId);
          }
          const { customerInfo } = await purchases.logIn({ appUserId: userId });
          const converted = convertCustomerInfo(customerInfo);
          setCustomerInfo(converted);
          onCustomerInfoUpdate?.(converted);
        } else {
          // User logged out - reset to anonymous
          if (process.env.NODE_ENV === "development") {
            console.log("[Subscriptions] Logging out user");
          }
          const { customerInfo } = await purchases.logOut();
          const converted = convertCustomerInfo(customerInfo);
          setCustomerInfo(converted);
          onCustomerInfoUpdate?.(converted);
        }
      } catch (error) {
        const purchaseError = parsePurchaseError(error);
        console.error("[Subscriptions] Auth sync failed:", purchaseError);
        setError(purchaseError);
        onError?.(purchaseError);
      }
    }

    syncAuthState();
  }, [
    userId,
    contextValue.isInitialized,
    setCustomerInfo,
    setLoading,
    setError,
    onCustomerInfoUpdate,
    onError,
  ]);

  // If not available and fallback provided, show fallback
  if (!contextValue.isAvailable && !contextValue.isInitialized && unavailableFallback) {
    return (
      <RevenueCatContext.Provider value={contextValue}>
        {unavailableFallback}
      </RevenueCatContext.Provider>
    );
  }

  return <RevenueCatContext.Provider value={contextValue}>{children}</RevenueCatContext.Provider>;
}

// Export stubs for API consistency with native
export enum LOG_LEVEL {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export enum STOREKIT_VERSION {
  STOREKIT_1 = "STOREKIT_1",
  STOREKIT_2 = "STOREKIT_2",
}
