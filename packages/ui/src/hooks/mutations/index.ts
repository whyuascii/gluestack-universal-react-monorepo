/**
 * Mutation Hooks
 *
 * TanStack Query mutation hooks for data modifications using oRPC.
 * All write operations go through these hooks.
 */

export { useAcceptInvite, useSendInvites } from "./useInvites";
export { useJoinWaitlist } from "./useWaitlist";

// Tenant mutations
export { useCreateTenant, useSwitchTenant } from "./useTenants";

// Todo mutations
export { useCreateTodo, useUpdateTodo, useDeleteTodo, useToggleTodo } from "./useTodos";

// Settings mutations
export {
  useUpdateLanguagePreference,
  useUpdateNotificationPreferences,
  useUpdateMemberRole,
  useRemoveMember,
  useUpdateTenant,
  useLeaveGroup,
} from "./useSettings";

// Dashboard test mutations
export {
  useSendTestEmail,
  useSendTestNotification,
  useTrackTestEvent,
  useTestSubscription,
} from "./useDashboardTests";

// Billing mutations
export { useCheckout, useBillingPortal, useLinkRevenueCat } from "./useBilling";

// Analytics mutations
export {
  useTrackEvent,
  useTrack,
  useUpdateAnalyticsConsent,
  useAliasAnonymousId,
} from "./useAnalytics";
