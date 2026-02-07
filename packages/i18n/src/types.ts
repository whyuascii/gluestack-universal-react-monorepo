import "react-i18next";
import type authEN from "./locales/en/auth.json";
import type commonEN from "./locales/en/common.json";
import type dashboardEN from "./locales/en/dashboard.json";
import type groupEN from "./locales/en/group.json";
import type validationEN from "./locales/en/validation.json";

// Define the resource structure
interface Resources {
  common: typeof commonEN;
  auth: typeof authEN;
  validation: typeof validationEN;
  group: typeof groupEN;
  dashboard: typeof dashboardEN;
}

// Extend react-i18next module to include our custom types
declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: Resources;
  }
}

// Language configuration types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL?: boolean;
  isDefault?: boolean;
}

export interface LanguagesConfig {
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: Language[];
  namespaces: string[];
}

// Export namespace type for type-safe namespace usage
export type Namespace = keyof Resources;
