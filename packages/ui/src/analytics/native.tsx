/**
 * Mobile Analytics - Provider and Hook
 *
 * Wraps PostHog for React Native and provides a unified interface.
 */

import {
  PostHogProvider as PHProvider,
  trackEvent,
  identifyUser,
  resetAnalytics,
  trackScreen,
  getPostHogClient,
  getSessionId,
  getFeatureFlagPayload,
  useScreenTracking,
} from "@app/analytics/mobile";
import React, { useEffect, useMemo } from "react";
import { setApiAnalyticsContext } from "../api/orpc-client";
import { AnalyticsContext, type Analytics, type AnalyticsContextValue } from "./types";
import { createTraceId } from "./tracing";

/**
 * Analytics Provider for Mobile
 *
 * Wrap your app with this provider to enable analytics.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider>
      <AnalyticsContextInner>{children}</AnalyticsContextInner>
    </PHProvider>
  );
}

/**
 * Inner provider that has access to PostHog context
 */
function AnalyticsContextInner({ children }: { children: React.ReactNode }) {
  // Enable automatic screen tracking
  useScreenTracking();

  // Set API analytics context for request tracing
  useEffect(() => {
    setApiAnalyticsContext({
      getDistinctId: () => getPostHogClient()?.getDistinctId() || undefined,
      getSessionId,
    });
  }, []);

  const analytics = useMemo<AnalyticsContextValue>(
    () => ({
      isReady: true,

      track: (event: string, properties?: Record<string, any>) => {
        trackEvent(event, properties);
      },

      page: (name?: string, properties?: Record<string, any>) => {
        // On mobile, page is the same as screen
        trackScreen(name || "unknown", properties);
      },

      screen: (name?: string, properties?: Record<string, any>) => {
        trackScreen(name || "unknown", properties);
      },

      identify: (userId: string, traits?: Record<string, any>) => {
        identifyUser(userId, traits);
      },

      reset: () => {
        resetAnalytics();
      },

      getDistinctId: () => {
        const client = getPostHogClient();
        return client?.getDistinctId() || undefined;
      },

      createTraceId: () => {
        return createTraceId();
      },

      isFeatureEnabled: (flag: string) => {
        // Note: Mobile SDK has async feature flags, this is sync fallback
        const client = getPostHogClient();
        return client?.isFeatureEnabled(flag) ?? false;
      },

      getFeatureFlag: (flag: string) => {
        return getFeatureFlagPayload(flag);
      },
    }),
    []
  );

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>;
}

/**
 * Get analytics functions outside of React (for API client, etc.)
 */
export function getAnalytics(): Analytics {
  return {
    track: trackEvent,
    page: (name, props) => trackScreen(name || "unknown", props),
    screen: (name, props) => trackScreen(name || "unknown", props),
    identify: identifyUser,
    reset: resetAnalytics,
    getDistinctId: () => getPostHogClient()?.getDistinctId() || undefined,
    createTraceId,
    isFeatureEnabled: (flag) => getPostHogClient()?.isFeatureEnabled(flag) ?? false,
    getFeatureFlag: getFeatureFlagPayload,
  };
}

// Re-export shared hook and utilities
export { useAnalytics } from "./types";
export { createTraceId, createTraceHeaders, TRACE_HEADERS } from "./tracing";
export type { Analytics, AnalyticsContextValue } from "./types";
