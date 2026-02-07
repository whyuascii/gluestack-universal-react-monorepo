/**
 * Ads Configuration
 *
 * Centralizes ad configuration across mobile and web.
 * Ads can be enabled/disabled per app via environment variables.
 */

export interface AdConfig {
  /** Whether ads are enabled for this app */
  enabled: boolean;

  /** Mobile AdMob configuration */
  mobile: {
    androidAppId: string;
    iosAppId: string;
    bannerAdUnitId: {
      android: string;
      ios: string;
    };
    interstitialAdUnitId: {
      android: string;
      ios: string;
    };
    rewardedAdUnitId: {
      android: string;
      ios: string;
    };
  };

  /** Web AdSense configuration */
  web: {
    clientId: string;
    bannerSlotId: string;
  };
}

/**
 * Test ad unit IDs for development
 * These show test ads and don't generate revenue
 * @see https://developers.google.com/admob/android/test-ads
 */
export const TEST_AD_UNITS = {
  android: {
    banner: "ca-app-pub-3940256099942544/9214589741",
    interstitial: "ca-app-pub-3940256099942544/1033173712",
    rewarded: "ca-app-pub-3940256099942544/5224354917",
  },
  ios: {
    banner: "ca-app-pub-3940256099942544/2435281174",
    interstitial: "ca-app-pub-3940256099942544/4411468910",
    rewarded: "ca-app-pub-3940256099942544/1712485313",
  },
} as const;

/**
 * Check if ads are enabled
 *
 * Checks environment variables:
 * - Mobile: EXPO_PUBLIC_ADS_ENABLED
 * - Web: NEXT_PUBLIC_ADS_ENABLED
 *
 * Also validates that required ad IDs are configured.
 */
export function isAdsEnabled(): boolean {
  // Check the enabled flag
  const mobileEnabled = process.env.EXPO_PUBLIC_ADS_ENABLED === "true";
  const webEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

  return mobileEnabled || webEnabled;
}

/**
 * Check if mobile ads are enabled
 */
export function isMobileAdsEnabled(): boolean {
  const enabled = process.env.EXPO_PUBLIC_ADS_ENABLED === "true";
  if (!enabled) return false;

  // Check if at least one platform has app ID configured
  const hasAndroid = Boolean(process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID);
  const hasIos = Boolean(process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID);

  return hasAndroid || hasIos;
}

/**
 * Check if web ads are enabled
 */
export function isWebAdsEnabled(): boolean {
  const enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  if (!enabled) return false;

  // Check if AdSense client ID is configured
  return Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);
}

/**
 * Get mobile ad configuration
 */
export function getMobileAdConfig() {
  const isDev = process.env.NODE_ENV !== "production";

  return {
    enabled: isMobileAdsEnabled(),
    androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || "",
    iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || "",
    bannerAdUnitId: {
      android: isDev
        ? TEST_AD_UNITS.android.banner
        : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || "",
      ios: isDev ? TEST_AD_UNITS.ios.banner : process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || "",
    },
    interstitialAdUnitId: {
      android: isDev
        ? TEST_AD_UNITS.android.interstitial
        : process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID || "",
      ios: isDev
        ? TEST_AD_UNITS.ios.interstitial
        : process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID || "",
    },
    rewardedAdUnitId: {
      android: isDev
        ? TEST_AD_UNITS.android.rewarded
        : process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID || "",
      ios: isDev ? TEST_AD_UNITS.ios.rewarded : process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID || "",
    },
  };
}

/**
 * Get web ad configuration
 */
export function getWebAdConfig() {
  return {
    enabled: isWebAdsEnabled(),
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
    bannerSlotId: process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT_ID || "",
  };
}

/**
 * Ad banner sizes
 */
export const AdBannerSize = {
  BANNER: { width: 320, height: 50 },
  LARGE_BANNER: { width: 320, height: 100 },
  MEDIUM_RECTANGLE: { width: 300, height: 250 },
  FULL_BANNER: { width: 468, height: 60 },
  LEADERBOARD: { width: 728, height: 90 },
  ADAPTIVE_BANNER: "adaptive",
} as const;

export type AdBannerSizeType = keyof typeof AdBannerSize;

/**
 * Get ad unit ID for a specific type and platform
 * Returns test IDs in development, production IDs in production
 */
export function getMobileAdUnitId(
  type: "banner" | "interstitial" | "rewarded",
  platform: "android" | "ios"
): string {
  const config = getMobileAdConfig();
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    return TEST_AD_UNITS[platform][type];
  }

  switch (type) {
    case "banner":
      return config.bannerAdUnitId[platform];
    case "interstitial":
      return config.interstitialAdUnitId[platform];
    case "rewarded":
      return config.rewardedAdUnitId[platform];
  }
}

/**
 * Test device configuration
 *
 * Test devices receive test ads instead of real ads.
 * This is required for testing without violating AdMob policies.
 *
 * To find your device ID:
 * 1. Run your app with ads enabled
 * 2. Check the console logs for a message like:
 *    "Use RequestConfiguration.Builder.setTestDeviceIds([\"YOUR_DEVICE_ID\"])"
 * 3. Add that ID to EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS
 */
export function getTestDeviceIds(): string[] {
  const testDeviceIds = process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS;
  if (!testDeviceIds) return [];

  return testDeviceIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Sellers.json Configuration
 *
 * IMPORTANT: sellers.json is configured in your AdMob account, not in code.
 *
 * To enable sellers.json transparency:
 * 1. Go to AdMob Console > Settings > Account information
 * 2. Under "Seller information visibility", select "Transparent"
 * 3. Fill in your business information
 *
 * This allows advertisers to verify your ad inventory, which can
 * increase ad revenue and improve fill rates.
 *
 * Learn more: https://support.google.com/admob/answer/9523881
 */
export const SELLERS_JSON_GUIDE = {
  steps: [
    "Go to AdMob Console (https://admob.google.com)",
    "Navigate to Settings > Account information",
    'Under "Seller information visibility", select "Transparent"',
    "Fill in your legal business name and domain",
    "Save changes",
  ],
  benefits: [
    "Increased ad revenue through better advertiser trust",
    "Higher fill rates from premium advertisers",
    "Compliance with industry transparency standards",
  ],
  documentation: "https://support.google.com/admob/answer/9523881",
} as const;

/**
 * App-ads.txt Configuration (for web)
 *
 * app-ads.txt is similar to ads.txt but for mobile apps.
 * It should be placed at your developer website root.
 *
 * Example: https://yourdomain.com/app-ads.txt
 *
 * Content format:
 * google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
 *
 * Where pub-XXXXXXXXXXXXXXXX is your AdMob/AdSense publisher ID.
 */
export function getAppAdsTxtContent(publisherId: string): string {
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`;
}
