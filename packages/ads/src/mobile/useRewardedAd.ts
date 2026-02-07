/**
 * useRewardedAd Hook (Mobile)
 *
 * Hook for loading and showing rewarded ads.
 * Rewarded ads give users in-app rewards for watching.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { getMobileAdConfig } from "../config";

interface RewardedAdReward {
  type: string;
  amount: number;
}

interface UseRewardedAdOptions {
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
  /** Called when user earns reward */
  onRewarded?: (reward: RewardedAdReward) => void;
}

interface UseRewardedAdReturn {
  /** Whether an ad is loaded and ready to show */
  isLoaded: boolean;
  /** Whether an ad is currently loading */
  isLoading: boolean;
  /** Whether ads are enabled */
  isEnabled: boolean;
  /** The reward that will be given (if loaded) */
  reward: RewardedAdReward | null;
  /** Load a rewarded ad */
  load: () => Promise<void>;
  /** Show the loaded rewarded ad */
  show: () => Promise<void>;
}

/**
 * Hook for rewarded ads
 *
 * Usage:
 * ```tsx
 * import { useRewardedAd } from "@app/ads/mobile";
 *
 * function StoreScreen() {
 *   const { isLoaded, show } = useRewardedAd({
 *     onRewarded: (reward) => {
 *       // Give user the reward (e.g., coins, extra life)
 *       addCoins(reward.amount);
 *     },
 *   });
 *
 *   return (
 *     <Button
 *       onPress={show}
 *       disabled={!isLoaded}
 *       title="Watch Ad for 50 Coins"
 *     />
 *   );
 * }
 * ```
 */
export function useRewardedAd(options: UseRewardedAdOptions = {}): UseRewardedAdReturn {
  const {
    autoLoad = true,
    onAdLoaded,
    onAdFailedToLoad,
    onAdOpened,
    onAdClosed,
    onRewarded,
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reward, setReward] = useState<RewardedAdReward | null>(null);
  const rewardedRef = useRef<any>(null);
  const config = getMobileAdConfig();

  const adUnitId =
    Platform.OS === "ios" ? config.rewardedAdUnitId.ios : config.rewardedAdUnitId.android;

  const isEnabled = config.enabled && Boolean(adUnitId);

  const load = useCallback(async () => {
    if (!isEnabled || isLoading || isLoaded) return;

    setIsLoading(true);

    try {
      const { RewardedAd, RewardedAdEventType, AdEventType } =
        await import("react-native-google-mobile-ads");

      const rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      rewardedRef.current = rewarded;

      const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setIsLoaded(true);
        setIsLoading(false);
        onAdLoaded?.();
      });

      const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
        setIsLoading(false);
        onAdFailedToLoad?.(new Error(error?.message || "Ad failed to load"));
      });

      const unsubscribeOpened = rewarded.addAdEventListener(AdEventType.OPENED, () => {
        onAdOpened?.();
      });

      const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        setReward(null);
        onAdClosed?.();
        // Clean up listeners
        unsubscribeLoaded();
        unsubscribeError();
        unsubscribeOpened();
        unsubscribeClosed();
        unsubscribeEarned();
      });

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (rewardData: RewardedAdReward) => {
          setReward(rewardData);
          onRewarded?.(rewardData);
        }
      );

      rewarded.load();
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
    onRewarded,
  ]);

  const show = useCallback(async () => {
    if (!isLoaded || !rewardedRef.current) return;

    try {
      await rewardedRef.current.show();
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
    reward,
    load,
    show,
  };
}
