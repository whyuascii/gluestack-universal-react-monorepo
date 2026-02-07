/**
 * useInterstitialAd Hook (Mobile)
 *
 * Hook for loading and showing interstitial ads.
 * Interstitials are full-screen ads shown at natural breaks.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { getMobileAdConfig } from "../config";

interface UseInterstitialAdOptions {
  /** Auto-load when hook mounts */
  autoLoad?: boolean;
  /** Called when ad loads successfully */
  onAdLoaded?: () => void;
  /** Called when ad fails to load */
  onAdFailedToLoad?: (error: Error) => void;
  /** Called when ad is shown */
  onAdOpened?: () => void;
  /** Called when ad is dismissed */
  onAdClosed?: () => void;
}

interface UseInterstitialAdReturn {
  /** Whether an ad is loaded and ready to show */
  isLoaded: boolean;
  /** Whether an ad is currently loading */
  isLoading: boolean;
  /** Whether ads are enabled */
  isEnabled: boolean;
  /** Load an interstitial ad */
  load: () => Promise<void>;
  /** Show the loaded interstitial ad */
  show: () => Promise<void>;
}

/**
 * Hook for interstitial ads
 *
 * Usage:
 * ```tsx
 * import { useInterstitialAd } from "@app/ads/mobile";
 *
 * function GameScreen() {
 *   const { isLoaded, load, show } = useInterstitialAd({
 *     onAdClosed: () => {
 *       // Continue game or navigation
 *     },
 *   });
 *
 *   const handleLevelComplete = () => {
 *     if (isLoaded) {
 *       show();
 *     } else {
 *       // Navigate without ad
 *     }
 *   };
 *
 *   return <Button onPress={handleLevelComplete} title="Next Level" />;
 * }
 * ```
 */
export function useInterstitialAd(options: UseInterstitialAdOptions = {}): UseInterstitialAdReturn {
  const { autoLoad = true, onAdLoaded, onAdFailedToLoad, onAdOpened, onAdClosed } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const interstitialRef = useRef<any>(null);
  const config = getMobileAdConfig();

  const adUnitId =
    Platform.OS === "ios" ? config.interstitialAdUnitId.ios : config.interstitialAdUnitId.android;

  const isEnabled = config.enabled && Boolean(adUnitId);

  const load = useCallback(async () => {
    if (!isEnabled || isLoading || isLoaded) return;

    setIsLoading(true);

    try {
      const { InterstitialAd, AdEventType } = await import("react-native-google-mobile-ads");

      const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      interstitialRef.current = interstitial;

      const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        setIsLoaded(true);
        setIsLoading(false);
        onAdLoaded?.();
      });

      const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error: any) => {
        setIsLoading(false);
        onAdFailedToLoad?.(new Error(error?.message || "Ad failed to load"));
      });

      const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
        onAdOpened?.();
      });

      const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        onAdClosed?.();
        // Clean up listeners
        unsubscribeLoaded();
        unsubscribeError();
        unsubscribeOpened();
        unsubscribeClosed();
      });

      interstitial.load();
    } catch {
      setIsLoading(false);
    }
  }, [
    adUnitId,
    isEnabled,
    isLoading,
    isLoaded,
    onAdLoaded,
    onAdFailedToLoad,
    onAdOpened,
    onAdClosed,
  ]);

  const show = useCallback(async () => {
    if (!isLoaded || !interstitialRef.current) return;

    try {
      await interstitialRef.current.show();
    } catch {
      // Show failed
    }
  }, [isLoaded]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && isEnabled) {
      load();
    }
  }, [autoLoad, isEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoaded,
    isLoading,
    isEnabled,
    load,
    show,
  };
}
