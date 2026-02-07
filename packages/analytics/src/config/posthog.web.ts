import posthog from "posthog-js";
import type { Analytics, AnalyticsProperties, AnalyticsUser } from "../types";

class PostHogWeb implements Analytics {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized || typeof window === "undefined") return;

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (!apiKey) {
      console.warn("PostHog API key not found. Analytics will be disabled.");
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      cookieless_mode: "always", // GDPR-compliant: no cookies for analytics
      person_profiles: "always", // or 'identified_only'
      defaults: "2025-11-30",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          posthog.debug();
        }
      },
      capture_pageview: false, // We'll capture manually
      capture_pageleave: true,
      autocapture: false, // Disable autocapture for more control
      // Enable error tracking
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false,
      },
    });

    this.initialized = true;
  }

  track(event: string, properties?: AnalyticsProperties): void {
    if (!this.initialized) return;
    posthog.capture(event, properties as Record<string, unknown>);
  }

  identify(userId: string, properties?: Partial<AnalyticsUser>): void {
    if (!this.initialized) return;
    posthog.identify(userId, properties as Record<string, unknown>);
  }

  reset(): void {
    if (!this.initialized) return;
    posthog.reset();
  }

  capture(event: string, properties?: AnalyticsProperties): void {
    this.track(event, properties);
  }
}

// Initialize on import (browser only)
const analytics = new PostHogWeb();
if (typeof window !== "undefined") {
  analytics.init();
}

export { analytics };
