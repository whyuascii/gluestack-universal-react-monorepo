/**
 * Server-side PostHog Analytics
 *
 * Provides analytics tracking for Node.js/API environments.
 * Includes request tracing via correlation IDs.
 */

import { PostHog } from "posthog-node";
import type {
  ServerAnalyticsConfig,
  ServerAnalyticsContext,
  ServerEventProperties,
  ServerUserProperties,
} from "./types";

let posthogInstance: PostHog | null = null;
let isInitialized = false;

/**
 * Initialize the server-side PostHog client
 */
export function initServerAnalytics(config: ServerAnalyticsConfig): void {
  if (isInitialized) {
    console.warn("[Analytics] Server analytics already initialized");
    return;
  }

  if (!config.apiKey) {
    console.warn("[Analytics] No API key provided. Server-side analytics disabled.");
    return;
  }

  posthogInstance = new PostHog(config.apiKey, {
    host: config.host || "https://us.i.posthog.com",
    flushAt: config.flushAt || 20,
    flushInterval: config.flushInterval || 10000,
  });

  // Graceful shutdown handlers
  const gracefulShutdown = async () => {
    await shutdownAnalytics();
    process.exit(0);
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);

  isInitialized = true;
  console.log("[Analytics] Server analytics initialized");
}

/**
 * Get the PostHog instance (internal use)
 */
function getPostHog(): PostHog | null {
  if (!posthogInstance) {
    console.warn("[Analytics] Server analytics not initialized");
  }
  return posthogInstance;
}

/**
 * Track a server-side event
 */
export function trackServerEvent(
  event: string,
  distinctId: string,
  properties?: ServerEventProperties
): void {
  const posthog = getPostHog();
  if (!posthog) return;

  posthog.capture({
    distinctId,
    event,
    properties: {
      $lib: "posthog-node",
      ...properties,
    },
  });
}

/**
 * Track a server-side event with tracing context
 */
export function trackServerEventWithContext(
  event: string,
  context: ServerAnalyticsContext,
  properties?: ServerEventProperties
): void {
  trackServerEvent(event, context.distinctId, {
    traceId: context.traceId,
    ...properties,
  });
}

/**
 * Identify a user server-side
 */
export function identifyServerUser(userId: string, properties?: ServerUserProperties): void {
  const posthog = getPostHog();
  if (!posthog) return;

  posthog.identify({
    distinctId: userId,
    properties,
  });
}

/**
 * Capture an error/exception
 */
export function captureServerError(
  error: Error,
  context?: {
    distinctId?: string;
    traceId?: string;
    properties?: ServerEventProperties;
  }
): void {
  const posthog = getPostHog();
  if (!posthog) return;

  const distinctId = context?.distinctId || "anonymous";

  posthog.capture({
    distinctId,
    event: "$exception",
    properties: {
      $exception_type: error.name,
      $exception_message: error.message,
      $exception_stack_trace: error.stack,
      traceId: context?.traceId,
      ...context?.properties,
    },
  });
}

/**
 * Flush all pending events and shutdown
 */
export async function shutdownAnalytics(): Promise<void> {
  if (posthogInstance) {
    console.log("[Analytics] Flushing events and shutting down...");
    await posthogInstance.shutdown();
    posthogInstance = null;
    isInitialized = false;
  }
}

/**
 * Flush pending events (without shutting down)
 */
export async function flushServerEvents(): Promise<void> {
  if (posthogInstance) {
    await posthogInstance.flush();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE FLAGS (Server-Side)
// ─────────────────────────────────────────────────────────────────────────────

/** Options for server-side feature flag evaluation */
export interface FeatureFlagOptions {
  /** Groups the user belongs to (for group-based flags) */
  groups?: Record<string, string>;
  /** Properties to evaluate the flag against (overrides stored properties) */
  personProperties?: Record<string, string>;
  /** Properties for each group */
  groupProperties?: Record<string, Record<string, string>>;
  /** Only evaluate locally without API call (faster but may miss updates) */
  onlyEvaluateLocally?: boolean;
  /** Whether to send $feature_flag_called event (default: true) */
  sendFeatureFlagEvents?: boolean;
}

/**
 * Check if a feature flag is enabled for a user
 *
 * @param flagKey - The feature flag key
 * @param distinctId - The user's distinct ID
 * @param options - Optional: groups, personProperties, groupProperties
 * @returns true if enabled, false otherwise
 *
 * Usage:
 *   const isEnabled = await isFeatureFlagEnabled("new-feature", userId);
 *   if (isEnabled) {
 *     // New feature logic
 *   }
 */
export async function isFeatureFlagEnabled(
  flagKey: string,
  distinctId: string,
  options?: FeatureFlagOptions
): Promise<boolean> {
  const posthog = getPostHog();
  if (!posthog) return false;

  const result = await posthog.isFeatureEnabled(flagKey, distinctId, options);
  return result ?? false;
}

/**
 * Get the value of a feature flag for a user
 *
 * Returns the variant key for multivariate flags, or true/false for boolean flags.
 *
 * @param flagKey - The feature flag key
 * @param distinctId - The user's distinct ID
 * @param options - Optional: groups, personProperties, groupProperties
 * @returns The flag value (string, boolean, or undefined)
 *
 * Usage:
 *   const variant = await getFeatureFlag("experiment-key", userId);
 *   if (variant === "test") {
 *     // Test variant logic
 *   }
 */
export async function getFeatureFlag(
  flagKey: string,
  distinctId: string,
  options?: FeatureFlagOptions
): Promise<string | boolean | undefined> {
  const posthog = getPostHog();
  if (!posthog) return undefined;

  return posthog.getFeatureFlag(flagKey, distinctId, options);
}

/**
 * Get the payload of a feature flag for a user
 *
 * Returns the JSON payload attached to the flag.
 *
 * @param flagKey - The feature flag key
 * @param distinctId - The user's distinct ID
 * @param matchValue - Optional: The flag value from getFeatureFlag (avoids extra API call)
 * @param options - Optional: groups, personProperties, groupProperties
 * @returns The flag payload (any JSON value)
 *
 * Usage:
 *   // Simple usage (makes two API calls)
 *   const payload = await getFeatureFlagPayload("my-flag", userId);
 *
 *   // Optimized usage (one API call, pass matchValue from getFeatureFlag)
 *   const flagValue = await getFeatureFlag("my-flag", userId);
 *   const payload = await getFeatureFlagPayload("my-flag", userId, flagValue);
 */
export async function getFeatureFlagPayload(
  flagKey: string,
  distinctId: string,
  matchValue?: string | boolean,
  options?: Omit<FeatureFlagOptions, "sendFeatureFlagEvents">
): Promise<unknown> {
  const posthog = getPostHog();
  if (!posthog) return undefined;

  return posthog.getFeatureFlagPayload(flagKey, distinctId, matchValue, options);
}

/**
 * Get all feature flags for a user
 *
 * Returns all flag values for the user. Useful for bootstrapping client-side.
 *
 * @param distinctId - The user's distinct ID
 * @param options - Optional: groups, personProperties, groupProperties
 * @returns Record of flag keys to values
 */
export async function getAllFeatureFlags(
  distinctId: string,
  options?: Omit<FeatureFlagOptions, "sendFeatureFlagEvents">
): Promise<Record<string, string | boolean>> {
  const posthog = getPostHog();
  if (!posthog) return {};

  return posthog.getAllFlags(distinctId, options);
}

/**
 * Reload feature flag definitions from PostHog
 *
 * Call this periodically or when you know flags have changed.
 * By default, flags are reloaded every 30 seconds.
 */
export async function reloadFeatureFlags(): Promise<void> {
  const posthog = getPostHog();
  if (!posthog) return;

  await posthog.reloadFeatureFlags();
}
