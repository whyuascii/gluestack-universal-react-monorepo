/**
 * Analytics Abstraction Types
 *
 * Provider-agnostic analytics interface.
 * Screens use these types - they don't know about PostHog.
 */

import { createContext, useContext } from "react";
import { createTraceId } from "./tracing";

// Re-export event types from analytics package
export type { AppEvents, AnalyticsProperties, AnalyticsUser } from "@app/analytics";

/**
 * Analytics interface for use in screens/components
 */
export interface Analytics {
  /**
   * Track an event
   */
  track: (event: string, properties?: Record<string, any>) => void;

  /**
   * Track a page view (web)
   */
  page: (name?: string, properties?: Record<string, any>) => void;

  /**
   * Track a screen view (mobile)
   */
  screen: (name?: string, properties?: Record<string, any>) => void;

  /**
   * Identify a user
   */
  identify: (userId: string, traits?: Record<string, any>) => void;

  /**
   * Reset analytics state (on logout)
   */
  reset: () => void;

  /**
   * Get the current distinct ID
   */
  getDistinctId: () => string | undefined;

  /**
   * Create a trace ID for request correlation
   */
  createTraceId: () => string;

  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled: (flag: string) => boolean;

  /**
   * Get feature flag value
   */
  getFeatureFlag: (flag: string) => any;
}

/**
 * Analytics context value
 */
export interface AnalyticsContextValue extends Analytics {
  isReady: boolean;
}

/**
 * No-op analytics for when no provider is available
 */
const noopAnalytics: AnalyticsContextValue = {
  isReady: false,
  track: () => {},
  page: () => {},
  screen: () => {},
  identify: () => {},
  reset: () => {},
  getDistinctId: () => undefined,
  createTraceId,
  isFeatureEnabled: () => false,
  getFeatureFlag: () => null,
};

/**
 * Shared analytics context
 * Used by both web and native providers
 */
export const AnalyticsContext = createContext<AnalyticsContextValue>(noopAnalytics);

/**
 * Cross-platform hook to access analytics
 * Works with both web and native AnalyticsProvider
 */
export function useAnalytics(): Analytics {
  return useContext(AnalyticsContext);
}
