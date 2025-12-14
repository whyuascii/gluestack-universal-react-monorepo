// Export mobile-specific PostHog provider and hook
export { PostHogProvider, useAnalytics } from "./providers/PostHogProvider.mobile";

// Export ErrorBoundary
export { ErrorBoundary } from "./components/ErrorBoundary.native";

// Export types
export * from "./types";

// Export analytics instance
export { analytics } from "./config/posthog.mobile";
