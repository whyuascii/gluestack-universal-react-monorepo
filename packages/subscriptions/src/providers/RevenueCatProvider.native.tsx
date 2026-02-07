import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type STOREKIT_VERSION,
  type CustomerInfo as RCCustomerInfo,
} from "react-native-purchases";
import { REVENUECAT_CONFIG, getPlatformApiKey } from "../config/revenuecat";
import {
  isRunningInExpoGo,
  isRevenueCatAvailable,
  getRevenueCatUnavailableReason,
} from "../helpers/expo";
import {
  useSubscriptionStore,
  type CustomerInfo,
  type EntitlementsRecord,
} from "../stores/subscriptionStore";
import { parsePurchaseError } from "../types/errors";

/**
 * Provider configuration options
 */
interface RevenueCatProviderConfig {
  /**
   * Log level for RevenueCat SDK
   * @default LOG_LEVEL.DEBUG in development, LOG_LEVEL.INFO in production
   */
  logLevel?: LOG_LEVEL;

  /**
   * Whether to use Amazon AppStore instead of Google Play
   * Only applicable on Android
   * @default false
   */
  useAmazon?: boolean;

  /**
   * Whether to automatically sync purchases on app foreground
   * @default true
   */
  syncOnForeground?: boolean;

  /**
   * Observer mode - set to true if handling purchases outside RevenueCat
   * @default false
   */
  observerMode?: boolean;

  /**
   * User defaults suite name (iOS only)
   * For sharing purchases with extensions
   */
  userDefaultsSuiteName?: string;

  /**
   * Store kit version to use (iOS only)
   * @default undefined (uses SDK default)
   */
  storeKitVersion?: STOREKIT_VERSION;
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
   * Fallback UI to show when RevenueCat is not available (e.g., in Expo Go)
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
 * 1. Check environment availability (Expo Go detection)
 * 2. Initialize RevenueCat SDK with configuration
 * 3. Sync with auth state (login/logout)
 * 4. Listen to customer info updates
 * 5. Handle app lifecycle (foreground sync)
 * 6. Populate subscription store
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
 *       config={{ logLevel: LOG_LEVEL.DEBUG }}
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
  const previousUserIdRef = useRef<string | undefined>(undefined);

  const [contextValue, setContextValue] = useState<RevenueCatContextValue>({
    isAvailable: false,
    isInitialized: false,
    unavailableReason: null,
  });

  // Check availability and initialize SDK
  useEffect(() => {
    // Check if running in Expo Go
    if (isRunningInExpoGo()) {
      const reason = getRevenueCatUnavailableReason();
      if (__DEV__) {
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

    // Check if API key is configured
    if (!isRevenueCatAvailable()) {
      const reason = getRevenueCatUnavailableReason();
      if (__DEV__) {
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
        // Set log level
        const logLevel = config?.logLevel ?? (__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
        Purchases.setLogLevel(logLevel);

        // Get platform-specific API key
        const apiKey = getPlatformApiKey();

        // Configure SDK
        const configureOptions: {
          apiKey: string;
          appUserID?: string;
          observerMode?: boolean;
          userDefaultsSuiteName?: string;
          useAmazon?: boolean;
          storeKitVersion?: STOREKIT_VERSION;
        } = {
          apiKey,
          observerMode: config?.observerMode,
        };

        // iOS-specific options
        if (Platform.OS === "ios") {
          if (config?.userDefaultsSuiteName) {
            configureOptions.userDefaultsSuiteName = config.userDefaultsSuiteName;
          }
          if (config?.storeKitVersion) {
            configureOptions.storeKitVersion = config.storeKitVersion;
          }
        }

        // Android-specific options
        if (Platform.OS === "android" && config?.useAmazon) {
          configureOptions.useAmazon = true;
        }

        await Purchases.configure(configureOptions);

        isInitializedRef.current = true;

        if (__DEV__) {
          console.log("[Subscriptions] RevenueCat initialized successfully", {
            platform: Platform.OS,
            apiKeyPrefix: apiKey.substring(0, 10) + "...",
          });
        }

        // Fetch initial customer info
        const customerInfo = await Purchases.getCustomerInfo();
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
  }, [config, setCustomerInfo, setError, setLoading, onCustomerInfoUpdate, onError]);

  // Listen to customer info updates
  useEffect(() => {
    if (!contextValue.isInitialized) return;

    // addCustomerInfoUpdateListener returns void in this SDK version
    // The listener is automatically managed by the SDK
    Purchases.addCustomerInfoUpdateListener((info) => {
      const converted = convertCustomerInfo(info);
      setCustomerInfo(converted);
      onCustomerInfoUpdate?.(converted);
    });

    // Note: RevenueCat SDK manages listener lifecycle internally
    // No explicit cleanup needed
  }, [contextValue.isInitialized, setCustomerInfo, onCustomerInfoUpdate]);

  // Sync with auth state (login/logout)
  useEffect(() => {
    if (!contextValue.isInitialized) return;

    // Skip if userId hasn't changed
    if (previousUserIdRef.current === userId) return;
    previousUserIdRef.current = userId;

    async function syncAuthState() {
      try {
        setLoading(true);

        if (userId) {
          // User logged in - transfer subscription to user account
          if (__DEV__) {
            console.log("[Subscriptions] Logging in user:", userId);
          }
          const { customerInfo } = await Purchases.logIn(userId);
          const converted = convertCustomerInfo(customerInfo);
          setCustomerInfo(converted);
          onCustomerInfoUpdate?.(converted);
        } else {
          // User logged out - reset to anonymous
          if (__DEV__) {
            console.log("[Subscriptions] Logging out user");
          }
          const customerInfo = await Purchases.logOut();
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

  // Handle app foreground sync
  useEffect(() => {
    if (!contextValue.isInitialized) return;
    if (config?.syncOnForeground === false) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        try {
          // Sync purchases when app comes to foreground
          await Purchases.syncPurchases();
          // Fetch updated customer info after sync
          const customerInfo = await Purchases.getCustomerInfo();
          const converted = convertCustomerInfo(customerInfo);
          setCustomerInfo(converted);
          onCustomerInfoUpdate?.(converted);
        } catch (error) {
          // Don't show error for sync failures, just log
          if (__DEV__) {
            console.warn("[Subscriptions] Foreground sync failed:", error);
          }
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [contextValue.isInitialized, config?.syncOnForeground, setCustomerInfo, onCustomerInfoUpdate]);

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

// Re-export configuration enums
export { LOG_LEVEL, STOREKIT_VERSION } from "react-native-purchases";
