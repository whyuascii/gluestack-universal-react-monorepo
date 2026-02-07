"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import React, { createContext, useContext, useEffect, Suspense } from "react";
import { analytics } from "../config/posthog.web";
import type { Analytics } from "../types";

const AnalyticsContext = createContext<Analytics | null>(null);

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track pageviews
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * PostHog Analytics Provider
 *
 * Wraps your app with PostHog context for analytics, feature flags, and experiments.
 *
 * Features enabled:
 * - Event tracking
 * - Feature flags (useFeatureFlagEnabled, useFeatureFlagVariantKey, useFeatureFlagPayload)
 * - Experiments (A/B tests via feature flags)
 * - Surveys (when enabled in PostHog project settings)
 * - Automatic page view tracking
 *
 * Usage:
 *   import { PostHogProvider } from "@app/analytics/web";
 *
 *   export default function RootLayout({ children }) {
 *     return <PostHogProvider>{children}</PostHogProvider>;
 *   }
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <AnalyticsContext.Provider value={analytics}>
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        {children}
      </AnalyticsContext.Provider>
    </PHProvider>
  );
}

export function useAnalytics(): Analytics {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within PostHogProvider");
  }
  return context;
}
