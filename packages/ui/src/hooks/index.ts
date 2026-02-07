/**
 * UI Hooks
 *
 * Organized by purpose:
 * - queries/: TanStack Query hooks for data fetching
 * - mutations/: TanStack Query hooks for data mutations
 * - auth/: Authentication-related hooks
 */

// Auth hooks
export * from "./auth";

// Query hooks (TanStack Query)
export * from "./queries";

// Mutation hooks (TanStack Query)
export * from "./mutations";

// Accessibility hooks
export {
  useAccessibilityAnnounce,
  useAccessibilityAnnounceDelayed,
} from "./useAccessibilityAnnounce";
export { useFormFieldId } from "./useFormFieldId";

// i18n hooks
export { useLanguageSync } from "./useLanguageSync";
