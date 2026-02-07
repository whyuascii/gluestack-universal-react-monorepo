import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import translation files
import authEN from "./locales/en/auth.json";
import commonEN from "./locales/en/common.json";
import dashboardEN from "./locales/en/dashboard.json";
import emailsEN from "./locales/en/emails.json";
import errorsEN from "./locales/en/errors.json";
import groupEN from "./locales/en/group.json";
import settingsEN from "./locales/en/settings.json";
import subscriptionsEN from "./locales/en/subscriptions.json";
import todosEN from "./locales/en/todos.json";
import validationEN from "./locales/en/validation.json";
import authES from "./locales/es/auth.json";
import commonES from "./locales/es/common.json";
import dashboardES from "./locales/es/dashboard.json";
import emailsES from "./locales/es/emails.json";
import errorsES from "./locales/es/errors.json";
import groupES from "./locales/es/group.json";
import settingsES from "./locales/es/settings.json";
import subscriptionsES from "./locales/es/subscriptions.json";
import todosES from "./locales/es/todos.json";
import validationES from "./locales/es/validation.json";

// Translation resources
const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    validation: validationEN,
    group: groupEN,
    dashboard: dashboardEN,
    emails: emailsEN,
    errors: errorsEN,
    settings: settingsEN,
    subscriptions: subscriptionsEN,
    todos: todosEN,
  },
  es: {
    common: commonES,
    auth: authES,
    validation: validationES,
    group: groupES,
    dashboard: dashboardES,
    emails: emailsES,
    errors: errorsES,
    settings: settingsES,
    subscriptions: subscriptionsES,
    todos: todosES,
  },
};

/**
 * Language Priority (highest to lowest):
 * 1. User preference (stored in localStorage when user sets preference)
 * 2. Browser detected language (navigator.language)
 * 3. Default English (fallback)
 *
 * When user logs in, call i18n.changeLanguage(user.preferredLanguage)
 * to apply their account preference, which gets cached in localStorage.
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    ns: [
      "common",
      "auth",
      "validation",
      "group",
      "dashboard",
      "emails",
      "errors",
      "settings",
      "subscriptions",
      "todos",
    ],
    supportedLngs: ["en", "es"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Priority order: user preference (localStorage) > browser language > fallback
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "user-language",
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
