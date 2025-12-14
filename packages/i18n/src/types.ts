import "react-i18next";
import type commonEN from "./locales/en/common.json";
import type authEN from "./locales/en/auth.json";
import type validationEN from "./locales/en/validation.json";

// Define the resource structure
interface Resources {
  common: typeof commonEN;
  auth: typeof authEN;
  validation: typeof validationEN;
}

// Extend react-i18next module to include our custom types
declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: Resources;
  }
}
