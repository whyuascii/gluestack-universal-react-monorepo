/**
 * Analytics Abstraction Layer
 *
 * Platform-agnostic analytics interface.
 *
 * Usage:
 *   // In components (cross-platform)
 *   import { useAnalytics } from "@app/ui/analytics";
 *   const { track } = useAnalytics();
 *
 *   // Providers (platform-specific)
 *   Web:    import { AnalyticsProvider } from "@app/ui/analytics-web";
 *   Mobile: import { AnalyticsProvider } from "@app/ui/analytics-native";
 */

// Shared exports - types, context, and cross-platform hook
export * from "./types";
export * from "./tracing";
