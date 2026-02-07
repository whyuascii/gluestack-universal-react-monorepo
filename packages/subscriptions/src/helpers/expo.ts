import { Platform } from "react-native";

/**
 * Expo Go Detection Helpers
 *
 * RevenueCat SDK requires native code and CANNOT run in Expo Go.
 * These helpers detect the runtime environment and provide appropriate fallbacks.
 *
 * Usage:
 * - Development builds: Full RevenueCat functionality
 * - Expo Go: Graceful fallback with warning, demo mode available
 */

/**
 * Check if the app is running in Expo Go
 *
 * Expo Go is detected by checking for the expo-constants module
 * and the appOwnership property being "expo"
 */
export function isRunningInExpoGo(): boolean {
  // Web platform never runs in Expo Go
  if (Platform.OS === "web") {
    return false;
  }

  try {
    // Try to access Expo Constants
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require("expo-constants").default;

    // appOwnership is "expo" when running in Expo Go
    // appOwnership is "standalone" or undefined in development/production builds
    return Constants.appOwnership === "expo";
  } catch {
    // If expo-constants is not available, we're not in Expo Go
    return false;
  }
}

/**
 * Check if the app is running in a development build (not Expo Go)
 *
 * Development builds have native code and can use RevenueCat
 */
export function isRunningInDevBuild(): boolean {
  if (Platform.OS === "web") {
    return process.env.NODE_ENV === "development";
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require("expo-constants").default;

    // Development build if appOwnership is not "expo"
    // and executionEnvironment is "storeClient" or "standalone"
    return Constants.appOwnership !== "expo" || Constants.executionEnvironment === "storeClient";
  } catch {
    // If expo-constants is not available, assume development build
    return true;
  }
}

/**
 * Check if RevenueCat is available in the current environment
 *
 * Returns false if:
 * - Running in Expo Go (no native code)
 * - API key is not configured
 */
export function isRevenueCatAvailable(): boolean {
  // Can't use RevenueCat in Expo Go
  if (isRunningInExpoGo()) {
    return false;
  }

  // Check if API key is configured
  const apiKey = getApiKeyForPlatform();
  return !!apiKey;
}

/**
 * Get the API key for the current platform
 * Returns undefined if not configured
 */
function getApiKeyForPlatform(): string | undefined {
  if (Platform.OS === "web") {
    return process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  }

  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
  }

  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;
  }

  return undefined;
}

/**
 * Get a user-friendly message about why RevenueCat is not available
 */
export function getRevenueCatUnavailableReason(): string | null {
  if (isRunningInExpoGo()) {
    return "RevenueCat is not available in Expo Go. Please use a development build to test subscriptions.";
  }

  const apiKey = getApiKeyForPlatform();
  if (!apiKey) {
    const prefix =
      Platform.OS === "web"
        ? "NEXT_PUBLIC_REVENUECAT_API_KEY"
        : "EXPO_PUBLIC_REVENUECAT_API_KEY_" + Platform.OS.toUpperCase();
    return `RevenueCat API key not configured. Set ${prefix} in your environment.`;
  }

  return null;
}

/**
 * Log a warning if RevenueCat is not available
 * Call this during app initialization
 */
export function warnIfRevenueCatUnavailable(): void {
  const reason = getRevenueCatUnavailableReason();

  if (reason) {
    if (__DEV__) {
      console.warn(`[Subscriptions] ${reason}`);
    }
  }
}

/**
 * Environment information for debugging
 */
export interface EnvironmentInfo {
  platform: string;
  isExpoGo: boolean;
  isDevBuild: boolean;
  isRevenueCatAvailable: boolean;
  unavailableReason: string | null;
}

/**
 * Get full environment information for debugging
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  return {
    platform: Platform.OS,
    isExpoGo: isRunningInExpoGo(),
    isDevBuild: isRunningInDevBuild(),
    isRevenueCatAvailable: isRevenueCatAvailable(),
    unavailableReason: getRevenueCatUnavailableReason(),
  };
}
