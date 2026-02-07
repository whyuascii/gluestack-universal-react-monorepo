import { Platform } from "react-native";

/**
 * RevenueCat Configuration
 *
 * Centralized configuration for RevenueCat SDK
 * All values are loaded from environment variables
 *
 * RevenueCat requires SEPARATE API keys for each platform:
 * - iOS: Apple App Store (public Apple API key from RevenueCat dashboard)
 * - Android: Google Play Store (public Google API key from RevenueCat dashboard)
 * - Web: Stripe/Web payments (public web API key from RevenueCat dashboard)
 */

// Helper to get environment variable (works in both Node.js and React Native/Next.js)
function getEnvVar(key: string, fallback?: string): string {
  // Next.js (web) - uses NEXT_PUBLIC_ prefix
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[`NEXT_PUBLIC_${key}`] || process.env[key];
    if (value) return value;
  }

  // Expo (mobile) - uses EXPO_PUBLIC_ prefix
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[`EXPO_PUBLIC_${key}`];
    if (value) return value;
  }

  if (fallback !== undefined) return fallback;

  throw new Error(
    `Missing required environment variable: ${key}. ` +
      `For web, set NEXT_PUBLIC_${key}. For mobile, set EXPO_PUBLIC_${key}.`
  );
}

/**
 * Get the platform-specific RevenueCat API key
 *
 * RevenueCat requires different API keys for each platform because they
 * represent different "projects" in the RevenueCat dashboard connected
 * to different app stores.
 *
 * Environment variables:
 * - iOS: EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
 * - Android: EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
 * - Web: NEXT_PUBLIC_REVENUECAT_API_KEY
 */
export function getPlatformApiKey(): string {
  // Web platform
  if (Platform.OS === "web") {
    return getEnvVar("REVENUECAT_API_KEY");
  }

  // iOS platform
  if (Platform.OS === "ios") {
    return getEnvVar("REVENUECAT_API_KEY_IOS");
  }

  // Android platform
  if (Platform.OS === "android") {
    return getEnvVar("REVENUECAT_API_KEY_ANDROID");
  }

  // Fallback for unknown platforms (should not happen)
  throw new Error(`Unsupported platform for RevenueCat: ${Platform.OS}`);
}

/**
 * RevenueCat configuration singleton
 * Lazily evaluated to prevent module-load-time errors when env vars aren't available
 */
let revenueCatConfig: ReturnType<typeof createRevenueCatConfig> | null = null;

function createRevenueCatConfig() {
  return {
    /**
     * RevenueCat API Key (platform-specific)
     *
     * Each platform requires its own API key from RevenueCat:
     * - iOS: EXPO_PUBLIC_REVENUECAT_API_KEY_IOS (Apple App Store key)
     * - Android: EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID (Google Play key)
     * - Web: NEXT_PUBLIC_REVENUECAT_API_KEY (Web/Stripe key)
     */
    get apiKey() {
      return getPlatformApiKey();
    },

    /**
     * Entitlement identifiers
     * These must match what's configured in RevenueCat dashboard
     * Entitlements are shared across all platforms in RevenueCat
     */
    entitlements: {
      premium: getEnvVar("REVENUECAT_ENTITLEMENT_PREMIUM", "premium"),
    },

    /**
     * Product identifiers
     * These must match what's configured in App Store Connect / Play Console
     * Note: Product IDs may differ between iOS and Android stores
     */
    products: {
      monthly: getEnvVar("REVENUECAT_PRODUCT_MONTHLY", "monthly"),
      yearly: getEnvVar("REVENUECAT_PRODUCT_YEARLY", "yearly"),
    },

    /**
     * Offering identifier
     * Default offering to display in paywalls
     * Offerings are configured in RevenueCat dashboard and shared across platforms
     */
    defaultOffering: getEnvVar("REVENUECAT_DEFAULT_OFFERING", "default"),
  } as const;
}

/**
 * Get RevenueCat configuration
 * Config is lazily loaded on first access to prevent build-time errors
 */
export function getRevenueCatConfig() {
  if (!revenueCatConfig) {
    revenueCatConfig = createRevenueCatConfig();
  }
  return revenueCatConfig;
}

/**
 * @deprecated Use getRevenueCatConfig() instead
 * Kept for backward compatibility but will be evaluated at module load time
 */
export const REVENUECAT_CONFIG = {
  get apiKey() {
    return getRevenueCatConfig().apiKey;
  },
  get entitlements() {
    return getRevenueCatConfig().entitlements;
  },
  get products() {
    return getRevenueCatConfig().products;
  },
  get defaultOffering() {
    return getRevenueCatConfig().defaultOffering;
  },
};

/**
 * Type-safe entitlement keys
 */
export type EntitlementKey = keyof typeof REVENUECAT_CONFIG.entitlements;

/**
 * Type-safe product keys
 */
export type ProductKey = keyof typeof REVENUECAT_CONFIG.products;
