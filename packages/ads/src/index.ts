/**
 * @app/ads
 *
 * Cross-platform advertising package for mobile (AdMob) and web (AdSense).
 *
 * Environment Variables:
 * - EXPO_PUBLIC_ADS_ENABLED: "true" to enable mobile ads
 * - NEXT_PUBLIC_ADS_ENABLED: "true" to enable web ads
 *
 * Mobile (AdMob):
 * - EXPO_PUBLIC_ADMOB_ANDROID_APP_ID
 * - EXPO_PUBLIC_ADMOB_IOS_APP_ID
 * - EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
 * - EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
 * - EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID
 * - EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
 * - EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID
 * - EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID
 *
 * Web (AdSense):
 * - NEXT_PUBLIC_ADSENSE_CLIENT_ID
 * - NEXT_PUBLIC_ADSENSE_BANNER_SLOT_ID
 *
 * Usage (Mobile):
 * ```tsx
 * import { AdsProvider, AdBanner } from "@app/ads/mobile";
 *
 * // In _layout.tsx
 * <AdsProvider>
 *   <Slot />
 * </AdsProvider>
 *
 * // In your screen
 * <AdBanner size="BANNER" />
 * ```
 *
 * Usage (Web):
 * ```tsx
 * import { AdSenseScript, AdBanner } from "@app/ads/web";
 *
 * // In layout.tsx <head>
 * <AdSenseScript />
 *
 * // In your page
 * <AdBanner format="auto" />
 * ```
 */

export * from "./config";
