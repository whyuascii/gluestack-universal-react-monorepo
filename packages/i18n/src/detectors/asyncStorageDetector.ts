import type { LanguageDetectorAsyncModule } from "i18next";

const LANGUAGE_STORAGE_KEY = "user-language";

/**
 * Check if we're running in React Native runtime (not Node.js bundling)
 */
function isReactNativeRuntime(): boolean {
  // During bundling, these will be undefined or throw
  return (
    typeof globalThis !== "undefined" &&
    // Check for React Native's HermesInternal or native modules
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (typeof (globalThis as any).HermesInternal !== "undefined" ||
      // Check for Expo/RN environment - window exists but is not a browser Window
      (typeof window !== "undefined" &&
        // __DEV__ is a React Native global
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (globalThis as any).__DEV__ !== "undefined"))
  );
}

/**
 * Language detector for React Native with AsyncStorage caching.
 *
 * Priority (highest to lowest):
 * 1. User preference (AsyncStorage) - set when user chooses language or logs in
 * 2. Device locale (Localization.getLocales())
 * 3. Default English (fallback)
 *
 * To apply user's account preference on login:
 *   i18n.changeLanguage(user.preferredLanguage)
 */
export const asyncStorageDetector: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,

  detect(callback: (lng: string | readonly string[] | undefined) => void) {
    (async () => {
      // Skip AsyncStorage in non-RN environments (bundling, SSR, etc.)
      if (!isReactNativeRuntime()) {
        callback("en");
        return;
      }

      try {
        // Dynamically import to avoid issues during bundling
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const Localization = await import("expo-localization");

        // Priority 1: User preference from AsyncStorage
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage) {
          callback(savedLanguage);
          return;
        }

        // Priority 2: Device locale
        const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";
        callback(deviceLanguage);
      } catch (error) {
        // Silently fall back - this is expected during bundling
        callback("en");
      }
    })();
  },

  init() {
    // No initialization needed
  },

  cacheUserLanguage(language: string) {
    // Skip in non-RN environments
    if (!isReactNativeRuntime()) {
      return;
    }

    (async () => {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch {
        // Silently ignore - this is expected during bundling
      }
    })();
  },
};
