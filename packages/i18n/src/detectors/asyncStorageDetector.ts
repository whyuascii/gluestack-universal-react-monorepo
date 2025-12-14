import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import type { LanguageDetectorAsyncModule } from "i18next";

const LANGUAGE_STORAGE_KEY = "user-language";

export const asyncStorageDetector: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,

  detect(callback: (lng: string | readonly string[] | undefined) => void) {
    (async () => {
      try {
        // First, try to get saved language from AsyncStorage
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (savedLanguage) {
          callback(savedLanguage);
          return;
        }

        // If no saved language, detect from device locale
        const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";
        callback(deviceLanguage);
      } catch (error) {
        console.error("Error detecting language:", error);
        // Fallback to English if detection fails
        callback("en");
      }
    })();
  },

  init() {
    // No initialization needed
  },

  cacheUserLanguage(language: string) {
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language).catch((error) => {
      console.error("Error caching language:", error);
    });
  },
};
