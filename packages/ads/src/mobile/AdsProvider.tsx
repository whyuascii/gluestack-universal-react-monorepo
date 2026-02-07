/**
 * AdsProvider (Mobile)
 *
 * Provider component that initializes Google Mobile Ads SDK.
 * Must wrap your app to enable ads.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getTestDeviceIds, isMobileAdsEnabled } from "../config";

interface AdsContextValue {
  /** Whether ads SDK is initialized */
  isInitialized: boolean;
  /** Whether ads are enabled for this app */
  isEnabled: boolean;
  /** Whether initialization failed */
  initError: Error | null;
}

const AdsContext = createContext<AdsContextValue>({
  isInitialized: false,
  isEnabled: false,
  initError: null,
});

interface AdsProviderProps {
  children: ReactNode;
  /** Called when SDK initializes */
  onInitialized?: () => void;
  /** Called if initialization fails */
  onInitError?: (error: Error) => void;
}

/**
 * Ads Provider Component
 *
 * Wraps your app to initialize the Google Mobile Ads SDK.
 * Does nothing if ads are disabled.
 *
 * Usage:
 * ```tsx
 * import { AdsProvider } from "@app/ads/mobile";
 *
 * export default function App() {
 *   return (
 *     <AdsProvider>
 *       <YourApp />
 *     </AdsProvider>
 *   );
 * }
 * ```
 */
export function AdsProvider({ children, onInitialized, onInitError }: AdsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const isEnabled = isMobileAdsEnabled();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const initializeAds = async () => {
      try {
        const mobileAds = await import("react-native-google-mobile-ads");

        // Initialize the SDK
        await mobileAds.default().initialize();

        // Get test device IDs from environment
        const testDeviceIds = getTestDeviceIds();

        // Set request configuration with test devices
        await mobileAds.default().setRequestConfiguration({
          // Register test devices for receiving test ads
          // This is REQUIRED for testing without violating AdMob policies
          testDeviceIdentifiers: testDeviceIds,
          // Request non-personalized ads by default (GDPR compliance)
          maxAdContentRating: mobileAds.MaxAdContentRating.PG,
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
        });

        setIsInitialized(true);
        onInitialized?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to initialize ads");
        setInitError(err);
        onInitError?.(err);
      }
    };

    initializeAds();
  }, [isEnabled, onInitialized, onInitError]);

  return (
    <AdsContext.Provider value={{ isInitialized, isEnabled, initError }}>
      {children}
    </AdsContext.Provider>
  );
}

/**
 * Hook to access ads context
 */
export function useAdsContext(): AdsContextValue {
  return useContext(AdsContext);
}
