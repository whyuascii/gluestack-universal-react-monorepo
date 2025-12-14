import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { asyncStorageDetector } from "./detectors/asyncStorageDetector";

// Import translation files
import commonEN from "./locales/en/common.json";
import authEN from "./locales/en/auth.json";
import validationEN from "./locales/en/validation.json";

import commonES from "./locales/es/common.json";
import authES from "./locales/es/auth.json";
import validationES from "./locales/es/validation.json";

// Translation resources
const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    validation: validationEN,
  },
  es: {
    common: commonES,
    auth: authES,
    validation: validationES,
  },
};

i18n
  .use(asyncStorageDetector) // Detect and cache language with AsyncStorage
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "auth", "validation"],
    supportedLngs: ["en", "es"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
