/**
 * RevenueCat Configuration
 *
 * Centralized configuration for RevenueCat SDK
 * All values are loaded from environment variables
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
 * RevenueCat configuration singleton
 * Lazily evaluated to prevent module-load-time errors when env vars aren't available
 */
let revenueCatConfig: ReturnType<typeof createRevenueCatConfig> | null = null;

function createRevenueCatConfig() {
  return {
    /**
     * RevenueCat API Key
     * Set via NEXT_PUBLIC_REVENUECAT_API_KEY (web) or EXPO_PUBLIC_REVENUECAT_API_KEY (mobile)
     * Use test_* keys for testing, live keys for production
     */
    apiKey: getEnvVar("REVENUECAT_API_KEY"),

    /**
     * Entitlement identifiers
     * These must match what's configured in RevenueCat dashboard
     * Set via NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM (web) or EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM (mobile)
     */
    entitlements: {
      premium: getEnvVar("REVENUECAT_ENTITLEMENT_PREMIUM", "Sample App"),
    },

    /**
     * Product identifiers
     * These must match what's configured in App Store Connect / Play Console
     * Set via NEXT_PUBLIC_REVENUECAT_PRODUCT_MONTHLY/YEARLY (web) or EXPO_PUBLIC_REVENUECAT_PRODUCT_MONTHLY/YEARLY (mobile)
     */
    products: {
      monthly: getEnvVar("REVENUECAT_PRODUCT_MONTHLY", "monthly"),
      yearly: getEnvVar("REVENUECAT_PRODUCT_YEARLY", "yearly"),
    },

    /**
     * Offering identifier
     * Default offering to display in paywalls
     * Set via NEXT_PUBLIC_REVENUECAT_DEFAULT_OFFERING (web) or EXPO_PUBLIC_REVENUECAT_DEFAULT_OFFERING (mobile)
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
