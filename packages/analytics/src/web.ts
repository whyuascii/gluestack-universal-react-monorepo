// Export web-specific PostHog provider and hook
export { PostHogProvider, useAnalytics } from "./providers/PostHogProvider.web";

// Export ErrorBoundary
export { ErrorBoundary } from "./components/ErrorBoundary";

// Export types
export * from "./types";

// Export analytics instance
export { analytics } from "./config/posthog.web";
