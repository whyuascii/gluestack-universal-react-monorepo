"use client";

/**
 * Web Analytics - Provider and Hook
 *
 * Wraps PostHog for web and provides a unified interface.
 */

import {
  PostHogProvider as PHProvider,
  trackEvent,
  identifyUser,
  resetAnalytics,
  trackPageView,
  getDistinctId,
  getSessionId,
  isFeatureEnabled,
  getFeatureFlagPayload,
} from "@app/analytics/web";
import React, { useEffect, useMemo } from "react";
import { setApiAnalyticsContext } from "../api/orpc-client";
import { AnalyticsContext, type AnalyticsContextValue } from "./types";
import { createTraceId } from "./tracing";

/**
 * Analytics Provider for Web
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
 * Note: Page tracking is handled by PHProvider's PostHogPageView component
 * which is already wrapped in Suspense.
 */
function AnalyticsContextInner({ children }: { children: React.ReactNode }) {
  // Set API analytics context for request tracing
  useEffect(() => {
    setApiAnalyticsContext({ getDistinctId, getSessionId });
  }, []);

  const analytics = useMemo<AnalyticsContextValue>(
    () => ({
      isReady: true,

      track: (event: string, properties?: Record<string, any>) => {
        trackEvent(event, properties);
      },

      page: (name?: string, properties?: Record<string, any>) => {
        trackPageView(name, properties);
      },

      screen: (name?: string, properties?: Record<string, any>) => {
        // On web, screen is the same as page
        trackPageView(name, properties);
      },

      identify: (userId: string, traits?: Record<string, any>) => {
        identifyUser(userId, traits);
      },

      reset: () => {
        resetAnalytics();
      },

      getDistinctId: () => {
        return getDistinctId();
      },

      createTraceId: () => {
        return createTraceId();
      },

      isFeatureEnabled: (flag: string) => {
        return isFeatureEnabled(flag);
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
export function getAnalytics() {
  return {
    track: trackEvent,
    page: trackPageView,
    screen: trackPageView,
    identify: identifyUser,
    reset: resetAnalytics,
    getDistinctId,
    createTraceId,
    isFeatureEnabled,
    getFeatureFlag: getFeatureFlagPayload,
  };
}

// Re-export shared hook and utilities
export { useAnalytics } from "./types";
export { createTraceId, createTraceHeaders, TRACE_HEADERS } from "./tracing";
export type { Analytics, AnalyticsContextValue } from "./types";
