import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import translation files
import authEN from "./locales/en/auth.json";
import commonEN from "./locales/en/common.json";
import validationEN from "./locales/en/validation.json";
import authES from "./locales/es/auth.json";
import commonES from "./locales/es/common.json";
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
  .use(LanguageDetector) // Detect user language
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
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
