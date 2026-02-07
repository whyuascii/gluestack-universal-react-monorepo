import { usePathname, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useRef } from "react";

// Simple properties type compatible with PostHog
type EventProperties = Record<string, string | number | boolean | null>;

/**
 * Hook to automatically track screen views with expo-router
 * Uses posthog.screen() as recommended in the docs
 *
 * Add to your root _layout.tsx inside PostHogProvider:
 * ```tsx
 * function RootLayoutNav() {
 *   useScreenTracking();
 *   return <Slot />;
 * }
 * ```
 */
export function useScreenTracking() {
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const posthog = usePostHog();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !posthog) return;

    // Convert pathname to readable screen name
    // /(tabs)/(home)/index -> home
    // /(auth)/login -> login
    // /(app)/dashboard -> dashboard
    const screenName =
      pathname
        .replace(/^\/(tabs)?\//, "") // Remove leading /tabs/
        .replace(/^\(.*?\)\//, "") // Remove route groups like (auth)/
        .replace(/\//g, "_") // Replace / with _
        .replace(/\[.*?\]/g, "detail") // Replace [id] with detail
        .replace(/^_+|_+$/g, "") || // Remove leading/trailing underscores
      "home";

    // Convert params to PostHog-compatible format
    const properties: EventProperties = {
      path: pathname,
      previous_screen: previousPathRef.current,
    };

    // Add search params
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string") {
        properties[key] = value;
      } else if (Array.isArray(value)) {
        properties[key] = value.join(",");
      }
    });

    // Use posthog.screen() for proper screen tracking
    posthog.screen(screenName, properties);

    previousPathRef.current = screenName;
  }, [pathname, posthog]);
}

/**
 * Track a specific screen manually
 * Useful for screens that don't follow file-based routing
 */
export function useTrackScreen(screenName: string, properties?: EventProperties) {
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog && screenName) {
      posthog.screen(screenName, properties);
    }
  }, [screenName, posthog, properties]);
}
