/**
 * Mobile Ads Module
 *
 * Export all mobile ad components and hooks.
 *
 * Usage:
 * ```tsx
 * import { AdsProvider, AdBanner, useInterstitialAd, useRewardedAd } from "@app/ads/mobile";
 * ```
 */

export { AdsProvider, useAdsContext } from "./AdsProvider";
export { AdBanner, AdBannerSize, type AdBannerSizeType } from "./AdBanner";
export { useInterstitialAd } from "./useInterstitialAd";
export { useRewardedAd } from "./useRewardedAd";
export { useAdInspector, AD_INSPECTOR_GUIDE } from "./useAdInspector";
export {
  isMobileAdsEnabled,
  getMobileAdConfig,
  getMobileAdUnitId,
  getTestDeviceIds,
  TEST_AD_UNITS,
  SELLERS_JSON_GUIDE,
  getAppAdsTxtContent,
} from "../config";
