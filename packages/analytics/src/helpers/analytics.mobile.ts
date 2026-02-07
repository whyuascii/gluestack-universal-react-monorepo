import type PostHog from "posthog-react-native";

// Simple properties type compatible with PostHog
type EventProperties = Record<string, string | number | boolean | null>;

/**
 * Global PostHog client reference for use outside React components
 * Set by PostHogProvider on initialization
 */
let posthogClient: PostHog | null = null;

/**
 * Set the global PostHog client (called from PostHogProvider)
 * @internal
 */
export function setPostHogClient(client: PostHog | null): void {
  posthogClient = client;
}

/**
 * Get the global PostHog client for use outside React components
 */
export function getPostHogClient(): PostHog | null {
  return posthogClient;
}

/**
 * Get the current session ID
 */
export function getSessionId(): string | undefined {
  if (!posthogClient) return undefined;
  return posthogClient.getSessionId();
}

/**
 * Track an event from anywhere (outside React components)
 */
export function trackEvent(eventName: string, properties?: EventProperties): void {
  if (posthogClient) {
    posthogClient.capture(eventName, properties);
    posthogClient.flush();
  }
}

/**
 * Identify a user with PostHog
 * Call after authentication
 */
export function identifyUser(userId: string, properties?: EventProperties): void {
  if (posthogClient) {
    posthogClient.identify(userId, properties);
    posthogClient.flush();
  }
}

/**
 * Reset PostHog on logout
 * Clears the identified user and starts a new anonymous session
 */
export function resetAnalytics(): void {
  if (posthogClient) {
    posthogClient.reset();
  }
}

/**
 * Track feature usage
 */
export function trackFeatureUsed(featureName: string, properties?: EventProperties): void {
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
  context?: EventProperties
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  trackEvent("error_occurred", {
    error_type: errorType,
    error_message: errorObj.message,
    error_stack: errorObj.stack ?? null,
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
  properties?: EventProperties
): void {
  trackEvent("purchase", {
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
  }
): void {
  trackEvent(`subscription_${action}`, properties);
}

/**
 * Set user properties without sending an event
 */
export function setUserProperties(properties: EventProperties): void {
  if (posthogClient) {
    posthogClient.capture("$set", { $set: properties });
    posthogClient.flush();
  }
}

/**
 * Track screen view manually
 */
export function trackScreen(screenName: string, properties?: EventProperties): void {
  if (posthogClient) {
    posthogClient.screen(screenName, properties);
    posthogClient.flush();
  }
}

/**
 * Flush all pending events immediately
 * Useful before app goes to background
 */
export function flushEvents(): void {
  if (posthogClient) {
    posthogClient.flush();
  }
}

/**
 * Check if a feature flag is enabled
 */
export async function isFeatureEnabled(flagKey: string): Promise<boolean> {
  if (!posthogClient) return false;
  return posthogClient.isFeatureEnabled(flagKey) ?? false;
}

/**
 * Get feature flag payload
 */
export function getFeatureFlagPayload(flagKey: string): unknown {
  if (!posthogClient) return null;
  return posthogClient.getFeatureFlagPayload(flagKey);
}

/**
 * Reload feature flags from PostHog
 */
export async function reloadFeatureFlags(): Promise<void> {
  if (posthogClient) {
    await posthogClient.reloadFeatureFlagsAsync();
  }
}
