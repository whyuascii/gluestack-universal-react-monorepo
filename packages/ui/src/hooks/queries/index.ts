/**
 * Query Hooks
 *
 * TanStack Query hooks for data fetching using oRPC.
 * All server state management goes through these hooks.
 */

export { queryKeys } from "./keys";
export type { QueryKeys } from "./keys";

// Query hooks
export { useMe } from "./useMe";
export { useDashboard, useIntegrationStatus } from "./useDashboard";
export { useInviteDetails } from "./useInvites";
export { useTodos, useTodo, todosQueryKey } from "./useTodos";
export { useNotificationPreferencesQuery, useGroupMembers } from "./useSettings";
export { useBillingStatus, useEntitlements } from "./useBilling";

// Analytics queries
export { useAnalyticsConsent } from "./useAnalytics";
