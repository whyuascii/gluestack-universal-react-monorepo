// Export mobile-specific PostHog provider and hook
export { PostHogProvider, useAnalytics } from "./providers/PostHogProvider.mobile";

// Export screen tracking hooks
export { useScreenTracking, useTrackScreen } from "./hooks/useScreenTracking.mobile";

// Export helper functions for use outside React
export {
  trackEvent,
  identifyUser,
  resetAnalytics,
  trackFeatureUsed,
  trackError,
  trackRevenue,
  trackSubscription,
  setUserProperties,
  trackScreen,
  flushEvents,
  isFeatureEnabled,
  getFeatureFlagPayload,
  reloadFeatureFlags,
  getPostHogClient,
  getSessionId,
} from "./helpers/analytics.mobile";

// Export ErrorBoundary
export { ErrorBoundary } from "./components/ErrorBoundary.native";

// Export types
export * from "./types";

// Export analytics instance
export { analytics } from "./config/posthog.mobile";

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE FLAGS & EXPERIMENTS (React Hooks)
// ─────────────────────────────────────────────────────────────────────────────

// Re-export PostHog React Native hooks for feature flags and experiments
// These require PostHogProvider to be in the component tree
export {
  usePostHog,
  useFeatureFlag,
  useFeatureFlags,
  PostHogSurveyProvider,
} from "posthog-react-native";

// Re-export custom feature flag hooks that match web API
export {
  useFeatureFlagEnabled,
  useFeatureFlagPayload,
  useFeatureFlagVariantKey,
} from "./hooks/useFeatureFlags.mobile";

// Export mobile logger
export { logger, createMobileLogger, type MobileLogger, type LogContext } from "./mobile/logger";
