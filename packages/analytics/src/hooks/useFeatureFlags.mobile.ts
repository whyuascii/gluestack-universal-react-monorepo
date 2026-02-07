/**
 * Feature Flag Hooks (Mobile)
 *
 * Custom hooks that match the web API for feature flags.
 * These wrap the posthog-react-native hooks for consistent API.
 *
 * Usage:
 *   import { useFeatureFlagEnabled, useFeatureFlagVariantKey } from "@app/analytics/mobile";
 *
 *   function MyComponent() {
 *     const isEnabled = useFeatureFlagEnabled("new-feature");
 *     const variant = useFeatureFlagVariantKey("experiment-key");
 *
 *     if (isEnabled) {
 *       return variant === "test" ? <NewUI /> : <ControlUI />;
 *     }
 *     return <DefaultUI />;
 *   }
 */

import { useFeatureFlag, usePostHog } from "posthog-react-native";

/**
 * Check if a feature flag is enabled
 *
 * Returns true if the flag is enabled, false otherwise.
 * Returns undefined while loading.
 *
 * Note: Always use with useFeatureFlagPayload to ensure
 * the $feature_flag_called event is sent for experiments.
 */
export function useFeatureFlagEnabled(flagKey: string): boolean | undefined {
  const value = useFeatureFlag(flagKey);

  // Convert to boolean
  if (value === undefined) return undefined;
  return Boolean(value);
}

/**
 * Get the variant key for a multivariate feature flag
 *
 * Returns the variant key (e.g., "control", "test", "variant-a")
 * or undefined while loading.
 *
 * Use this for A/B tests and experiments.
 */
export function useFeatureFlagVariantKey(flagKey: string): string | undefined {
  const value = useFeatureFlag(flagKey);

  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

/**
 * Get the payload for a feature flag
 *
 * Returns the JSON payload attached to the flag, or undefined.
 * Use this for configuration-driven features.
 */
export function useFeatureFlagPayload(flagKey: string): unknown {
  const posthog = usePostHog();

  if (!posthog) return undefined;
  return posthog.getFeatureFlagPayload(flagKey);
}
