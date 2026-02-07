/**
 * AdBanner Component (Mobile)
 *
 * Displays a banner ad using Google AdMob.
 * Automatically handles platform differences and respects the enabled flag.
 */

import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { getMobileAdConfig, type AdBannerSizeType, AdBannerSize } from "../config";

interface AdBannerProps {
  /** Banner size preset */
  size?: AdBannerSizeType;
  /** Custom container style */
  style?: object;
  /** Called when ad loads successfully */
  onAdLoaded?: () => void;
  /** Called when ad fails to load */
  onAdFailedToLoad?: (error: Error) => void;
  /** Called when ad is clicked */
  onAdOpened?: () => void;
  /** Called when ad is closed */
  onAdClosed?: () => void;
}

/**
 * Mobile Banner Ad Component
 *
 * Usage:
 * ```tsx
 * import { AdBanner } from "@app/ads/mobile";
 *
 * <AdBanner size="BANNER" />
 * ```
 */
export function AdBanner({
  size = "BANNER",
  style,
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed,
}: AdBannerProps) {
  const config = getMobileAdConfig();

  // Dynamic import to avoid bundling issues - hooks must be called before any early returns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [BannerAd, setBannerAd] = React.useState<React.ComponentType<any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [BannerAdSizeEnum, setBannerAdSizeEnum] = React.useState<any>(null);

  React.useEffect(() => {
    const loadAdComponent = async () => {
      try {
        const admob = await import("react-native-google-mobile-ads");
        setBannerAd(() => admob.BannerAd);
        setBannerAdSizeEnum(admob.BannerAdSize);
      } catch {
        // AdMob not available
      }
    };
    loadAdComponent();
  }, []);

  // Don't render if ads are disabled
  if (!config.enabled) {
    return null;
  }

  // Get ad unit ID based on platform
  const adUnitId =
    Platform.OS === "ios" ? config.bannerAdUnitId.ios : config.bannerAdUnitId.android;

  // Don't render if no ad unit ID configured
  if (!adUnitId) {
    return null;
  }

  if (!BannerAd || !BannerAdSizeEnum) {
    return null;
  }

  // Map our size enum to AdMob size
  const getAdMobSize = () => {
    switch (size) {
      case "BANNER":
        return BannerAdSizeEnum.BANNER;
      case "LARGE_BANNER":
        return BannerAdSizeEnum.LARGE_BANNER;
      case "MEDIUM_RECTANGLE":
        return BannerAdSizeEnum.MEDIUM_RECTANGLE;
      case "FULL_BANNER":
        return BannerAdSizeEnum.FULL_BANNER;
      case "LEADERBOARD":
        return BannerAdSizeEnum.LEADERBOARD;
      case "ADAPTIVE_BANNER":
        return BannerAdSizeEnum.ANCHORED_ADAPTIVE_BANNER;
      default:
        return BannerAdSizeEnum.BANNER;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={getAdMobSize()}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={onAdFailedToLoad}
        onAdOpened={onAdOpened}
        onAdClosed={onAdClosed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export { AdBannerSize, type AdBannerSizeType };
