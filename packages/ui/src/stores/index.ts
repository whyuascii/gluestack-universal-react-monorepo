/**
 * Zustand Stores
 *
 * All global state is managed through Zustand:
 * - Auth: Session and user state (synced with Better Auth)
 * - Tenant: Active tenant and memberships
 * - Preferences: Theme, locale, notification settings
 * - UI: Ephemeral UI state (modals, toasts, sidebar)
 *
 * For server state (API data), use TanStack Query (hooks/queries, hooks/mutations).
 */

// Auth Store
export { useAuthStore, useIsAuthenticated, useUser, useAuthLoading } from "./authStore";
export type { AuthState, AuthActions } from "./authStore";

// Tenant Store
export {
  useTenantStore,
  useActiveTenant,
  useHasTenants,
  useTenantMemberships,
} from "./tenantStore";
export type { TenantState, TenantActions, TenantMembership } from "./tenantStore";

// Preferences Store
export {
  usePreferencesStore,
  useTheme,
  useLocale,
  useNotificationPreferences,
} from "./preferencesStore";
export type { PreferencesState, PreferencesActions, Preferences } from "./preferencesStore";

// UI Store
export { useUIStore } from "./uiStore";
export type { UIState, UIActions } from "./uiStore";

// Sync Component (place at app root)
export { AuthSync } from "./AuthSync";
