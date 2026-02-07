import posthog from "posthog-js";

/**
 * Track an event from anywhere (outside React components)
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
}

/**
 * Identify a user with PostHog
 * Call after authentication
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    posthog.identify(userId, properties);
  }
}

/**
 * Reset PostHog on logout
 * Clears the identified user and starts a new anonymous session
 */
export function resetAnalytics(): void {
  if (typeof window !== "undefined") {
    posthog.reset();
  }
}

/**
 * Track feature usage
 */
export function trackFeatureUsed(featureName: string, properties?: Record<string, unknown>): void {
  trackEvent("feature_used", {
    feature: featureName,
    ...properties,
  });
}

/**
 * Track errors for debugging
 */
export function trackError(
  errorType: string,
  error: Error | unknown,
  context?: Record<string, unknown>
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  trackEvent("error_occurred", {
    error_type: errorType,
    error_message: errorObj.message,
    error_stack: errorObj.stack,
    ...context,
  });
}

/**
 * Track revenue event (for purchase analytics)
 */
export function trackRevenue(
  amount: number,
  currency: string,
  productId: string,
  properties?: Record<string, unknown>
): void {
  trackEvent("purchase", {
    $set: { last_purchase_date: new Date().toISOString() },
    revenue: amount,
    currency,
    product_id: productId,
    ...properties,
  });
}

/**
 * Track subscription events
 */
export function trackSubscription(
  action: "started" | "renewed" | "cancelled" | "expired",
  properties?: {
    plan?: string;
    price?: number;
    currency?: string;
    trial_used?: boolean;
    source?: string;
    [key: string]: unknown;
  }
): void {
  trackEvent(`subscription_${action}`, properties);
}

/**
 * Set user properties without sending an event
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    posthog.capture("$set", { $set: properties });
  }
}

/**
 * Track page view manually
 */
export function trackPageView(pageName?: string, properties?: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    posthog.capture("$pageview", {
      page_name: pageName,
      $current_url: window.location.href,
      ...properties,
    });
  }
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window === "undefined") return false;
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

/**
 * Get feature flag payload
 */
export function getFeatureFlagPayload(flagKey: string): unknown {
  if (typeof window === "undefined") return null;
  return posthog.getFeatureFlagPayload(flagKey);
}

/**
 * Reload feature flags from PostHog
 */
export function reloadFeatureFlags(): void {
  if (typeof window !== "undefined") {
    posthog.reloadFeatureFlags();
  }
}

/**
 * Register properties that will be sent with every event
 */
export function registerSuperProperties(properties: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    posthog.register(properties);
  }
}

/**
 * Unregister a super property
 */
export function unregisterSuperProperty(propertyKey: string): void {
  if (typeof window !== "undefined") {
    posthog.unregister(propertyKey);
  }
}

/**
 * Get the current distinct ID
 */
export function getDistinctId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return posthog.get_distinct_id();
}

/**
 * Get the current session ID
 */
export function getSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return posthog.get_session_id();
}

/**
 * Opt user out of tracking
 */
export function optOut(): void {
  if (typeof window !== "undefined") {
    posthog.opt_out_capturing();
  }
}

/**
 * Opt user back into tracking
 */
export function optIn(): void {
  if (typeof window !== "undefined") {
    posthog.opt_in_capturing();
  }
}

/**
 * Check if user has opted out
 */
export function hasOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  return posthog.has_opted_out_capturing();
}
