import * as dotenv from "dotenv";
dotenv.config();

export default ({ config }) => {
  // =============================================================================
  // Ads Configuration
  // =============================================================================
  const adsEnabled = process.env.EXPO_PUBLIC_ADS_ENABLED === "true";
  const androidAppId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID;
  const iosAppId = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID;
  const androidBannerId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID;
  const iosBannerId = process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID;
  const androidInterstitialId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID;
  const iosInterstitialId = process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID;
  const androidRewardedId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID;
  const iosRewardedId = process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID;

  // Check if AdMob can be configured (need at least one app ID)
  const hasAdMobConfig = Boolean(androidAppId || iosAppId);

  // =============================================================================
  // Base Plugins (always included)
  // =============================================================================
  const basePlugins = [
    "expo-router",
    [
      "expo-system-ui",
      {
        // Enable edge-to-edge for Android 15+
        androidEdgeToEdgeEnabled: true,
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
        },
        ios: {
          useFrameworks: "static",
        },
      },
    ],
  ];

  // =============================================================================
  // Conditional AdMob Plugin
  // =============================================================================
  // Only include AdMob plugin if ads are enabled AND at least one app ID is set
  // Using placeholder IDs if not configured to prevent build failures
  const admobPlugin =
    adsEnabled && hasAdMobConfig
      ? [
          [
            "react-native-google-mobile-ads",
            {
              androidAppId: androidAppId || "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy",
              iosAppId: iosAppId || "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy",
            },
          ],
        ]
      : [];

  // =============================================================================
  // iOS Configuration
  // =============================================================================
  // Only include ad-related iOS config if ads are enabled
  const iosInfoPlist = {
    ITSAppUsesNonExemptEncryption: false,
    ...(adsEnabled && {
      NSUserTrackingUsageDescription: "This identifier is used to deliver personalized ads.",
      SKAdNetworkItems: [
        { SKAdNetworkIdentifier: "cstr6suwn9.skadnetwork" },
        { SKAdNetworkIdentifier: "4fzdc2evr5.skadnetwork" },
        { SKAdNetworkIdentifier: "v9wttpbfk9.skadnetwork" },
        { SKAdNetworkIdentifier: "n38lu8286q.skadnetwork" },
      ],
    }),
  };

  // =============================================================================
  // Android Configuration
  // =============================================================================
  // Only include AD_ID permission if ads are enabled
  const androidPermissions = adsEnabled ? ["com.google.android.gms.permission.AD_ID"] : [];

  // =============================================================================
  // Extra Configuration
  // =============================================================================
  const extraConfig = {
    router: {
      origin: false,
    },
    eas: {
      // Get your project ID by running: eas init
      projectId: "your-eas-project-id",
    },
    // Ads configuration exposed to runtime
    adsEnabled,
    ...(adsEnabled && {
      "react-native-google-mobile-ads": {
        android_app_id: androidAppId,
        ios_app_id: iosAppId,
      },
      admob: {
        androidAppId,
        iosAppId,
        androidBannerId,
        iosBannerId,
        androidInterstitialId,
        iosInterstitialId,
        androidRewardedId,
        iosRewardedId,
      },
    }),
    // Legal URLs for App Store compliance
    privacyPolicyUrl: "https://your-domain.com/privacy",
    termsOfServiceUrl: "https://your-domain.com/terms",
  };

  // =============================================================================
  // Final Config
  // =============================================================================
  return {
    ...config,
    expo: {
      ...config.expo,
      name: "myapp",
      slug: "myapp",
      version: "0.0.1",
      orientation: "default",
      scheme: "myapp",
      icon: "./assets/images/icon.png",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
      ios: {
        supportsTablet: true,
        buildNumber: "1",
        bundleIdentifier: "com.yourorg.myapp",
        icon: "./assets/images/icon.png",
        infoPlist: iosInfoPlist,
      },
      android: {
        package: "com.yourorg.myapp",
        versionCode: 1,
        permissions: androidPermissions,
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff",
        },
        allowBackup: true,
        softwareKeyboardLayoutMode: "pan",
      },
      plugins: [...basePlugins, ...admobPlugin],
      experiments: {
        typedRoutes: true,
      },
      extra: extraConfig,
      // Root-level AdMob config (required by the plugin)
      ...(adsEnabled &&
        hasAdMobConfig && {
          "react-native-google-mobile-ads": {
            android_app_id: androidAppId,
            ios_app_id: iosAppId,
          },
        }),
      owner: "your-expo-username",
    },
  };
};
