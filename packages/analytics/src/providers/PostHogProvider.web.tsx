"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import React, { createContext, Suspense, useContext, useEffect } from "react";
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

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsContext.Provider value={analytics}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): Analytics {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within PostHogProvider");
  }
  return context;
}
