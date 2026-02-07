/**
 * Ad Inspector Hook
 *
 * Ad Inspector is a debugging tool that helps you test your ad integration.
 * It shows all ad units, their status, and allows you to test ads.
 *
 * Requirements:
 * 1. Register your test device (see getTestDeviceIds in config)
 * 2. Call openAdInspector() to open the inspector overlay
 *
 * @see https://developers.google.com/admob/android/ad-inspector
 */

import { useCallback, useState } from "react";
import { isMobileAdsEnabled } from "../config";
import { useAdsContext } from "./AdsProvider";

interface UseAdInspectorResult {
  /** Open the Ad Inspector overlay */
  openAdInspector: () => Promise<void>;
  /** Whether the inspector is currently opening */
  isOpening: boolean;
  /** Error if inspector failed to open */
  error: Error | null;
  /** Whether Ad Inspector is available (ads enabled and initialized) */
  isAvailable: boolean;
}

/**
 * Hook for using Google Ad Inspector
 *
 * Ad Inspector helps you:
 * - View all registered ad units
 * - Test ad loading and rendering
 * - Debug ad request issues
 * - Verify test device registration
 *
 * Usage:
 * ```tsx
 * import { useAdInspector } from "@app/ads/mobile";
 *
 * function DebugScreen() {
 *   const { openAdInspector, isAvailable, error } = useAdInspector();
 *
 *   return (
 *     <Button
 *       onPress={openAdInspector}
 *       disabled={!isAvailable}
 *     >
 *       Open Ad Inspector
 *     </Button>
 *   );
 * }
 * ```
 */
export function useAdInspector(): UseAdInspectorResult {
  const { isInitialized, isEnabled } = useAdsContext();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isAvailable = isEnabled && isInitialized && isMobileAdsEnabled();

  const openAdInspector = useCallback(async () => {
    if (!isAvailable) {
      setError(new Error("Ad Inspector is not available. Ensure ads are enabled and initialized."));
      return;
    }

    setIsOpening(true);
    setError(null);

    try {
      const mobileAds = await import("react-native-google-mobile-ads");

      // Open Ad Inspector
      // This shows an overlay with all ad units and their status
      await mobileAds.default().openAdInspector();
    } catch (err) {
      const inspectorError = err instanceof Error ? err : new Error("Failed to open Ad Inspector");
      setError(inspectorError);
    } finally {
      setIsOpening(false);
    }
  }, [isAvailable]);

  return {
    openAdInspector,
    isOpening,
    error,
    isAvailable,
  };
}

/**
 * Get Ad Inspector availability info
 *
 * Returns guidance on how to use Ad Inspector
 */
export const AD_INSPECTOR_GUIDE = {
  requirements: [
    "Ads must be enabled (EXPO_PUBLIC_ADS_ENABLED=true)",
    "AdMob app ID must be configured",
    "Test device must be registered (EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS)",
    "SDK must be initialized (use AdsProvider)",
  ],
  howToRegisterTestDevice: [
    "1. Run your app with ads enabled",
    '2. Check logs for: "Use RequestConfiguration.Builder.setTestDeviceIds"',
    "3. Copy the device ID from the log",
    "4. Add to EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS in your .env",
    "5. Restart the app",
  ],
  features: [
    "View all ad unit configurations",
    "Test ad loading in real-time",
    "Debug ad request failures",
    "Verify mediation setup",
    "Check ad unit status",
  ],
  documentation: "https://developers.google.com/admob/android/ad-inspector",
} as const;
