/**
 * Storage key constants for localStorage, sessionStorage, and AsyncStorage
 */

export const STORAGE_KEYS = {
  // Session storage
  PENDING_INVITE_TOKEN: "pendingInviteToken",

  // Local storage
  AUTH_TOKEN: "authToken",
  USER_PREFERENCES: "userPreferences",
  THEME: "theme",
  LOCALE: "locale",
  ACTIVE_TENANT_ID: "activeTenantId",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
