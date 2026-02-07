// Export web-specific PostHog provider and hook
export { PostHogProvider, useAnalytics } from "./providers/PostHogProvider.web";

// Export page tracking hooks
export { usePageTracking, useTrackPage } from "./hooks/useScreenTracking.web";

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
  trackPageView,
  isFeatureEnabled,
  getFeatureFlagPayload,
  reloadFeatureFlags,
  registerSuperProperties,
  unregisterSuperProperty,
  getDistinctId,
  getSessionId,
  optOut,
  optIn,
  hasOptedOut,
} from "./helpers/analytics.web";

// Export ErrorBoundary
export { ErrorBoundary } from "./components/ErrorBoundary";

// Export types
export * from "./types";

// Export analytics instance
export { analytics } from "./config/posthog.web";

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE FLAGS & EXPERIMENTS (React Hooks)
// ─────────────────────────────────────────────────────────────────────────────

// Re-export PostHog React hooks for feature flags and experiments
// These require PostHogProvider to be in the component tree
export {
  usePostHog,
  useFeatureFlagEnabled,
  useFeatureFlagPayload,
  useFeatureFlagVariantKey,
  useActiveFeatureFlags,
  PostHogFeature,
} from "posthog-js/react";

// Re-export for surveys (when using posthog-js with surveys enabled)
export { usePostHogSurvey } from "./hooks/usePostHogSurvey.web";
