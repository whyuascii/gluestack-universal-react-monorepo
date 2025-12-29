/**
 * OneSignal configuration for web and mobile platforms
 *
 * Environment variables:
 * - NEXT_PUBLIC_ONESIGNAL_APP_ID: Web app ID
 * - EXPO_PUBLIC_ONESIGNAL_APP_ID: Mobile app ID
 */

export interface OneSignalConfig {
  appId: string;
  safari_web_id?: string;
  notifyButton?: {
    enable: boolean;
  };
  allowLocalhostAsSecureOrigin?: boolean;
}

/**
 * Get OneSignal configuration for web platform
 */
export const getWebConfig = (): OneSignalConfig => {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

  if (!appId) {
    console.warn("NEXT_PUBLIC_ONESIGNAL_APP_ID is not set. Push notifications will not work.");
    return {
      appId: "",
    };
  }

  return {
    appId,
    allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
    notifyButton: {
      enable: false, // We'll use our custom UI
    },
  };
};

/**
 * Get OneSignal configuration for mobile platform
 */
export const getMobileConfig = (): { appId: string } => {
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

  if (!appId) {
    console.warn("EXPO_PUBLIC_ONESIGNAL_APP_ID is not set. Push notifications will not work.");
    return {
      appId: "",
    };
  }

  return {
    appId,
  };
};

/**
 * OneSignal notification categories (for iOS)
 */
export const NOTIFICATION_CATEGORIES = {
  TRANSACTIONAL: "transactional",
  MARKETING: "marketing",
  IN_APP: "in-app",
  SYSTEM: "system",
} as const;

/**
 * OneSignal tags for user segmentation
 */
export const USER_TAGS = {
  LANGUAGE: "language",
  SUBSCRIPTION_TIER: "subscription_tier",
  MARKETING_OPT_IN: "marketing_opt_in",
  LAST_ACTIVE: "last_active",
} as const;
