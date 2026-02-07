import { PostHogProvider as RNPostHogProvider, usePostHog } from "posthog-react-native";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { analytics } from "../config/posthog.mobile";
import { setPostHogClient } from "../helpers/analytics.mobile";
import type { Analytics } from "../types";

// Simple properties type compatible with PostHog
type EventProperties = Record<string, string | number | boolean | null>;

interface AnalyticsContextType {
  isInitialized: boolean;
  trackEvent: (eventName: string, properties?: EventProperties) => void;
  analytics: Analytics;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  isInitialized: false,
  trackEvent: () => {},
  analytics,
});

export const useAnalytics = () => useContext(AnalyticsContext);

const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY || "";
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Inner component that has access to PostHog context
 * Handles app lifecycle events and global client setup
 */
const PostHogInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const posthog = usePostHog();

  const trackEvent = useCallback(
    (eventName: string, properties?: EventProperties) => {
      if (posthog) {
        posthog.capture(eventName, properties);
        posthog.flush();
      }
    },
    [posthog]
  );

  useEffect(() => {
    if (!posthog) {
      setPostHogClient(null);
      return;
    }

    // Set global client for use outside React components
    setPostHogClient(posthog);

    // Capture app open event
    posthog.capture("app_opened", {
      timestamp: new Date().toISOString(),
      source: "app_launch",
    });
    posthog.flush();

    // Handle app state changes - flush on background
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // Capture app backgrounded event
        posthog.capture("app_backgrounded", {
          timestamp: new Date().toISOString(),
        });
        // Flush all pending events before going to background
        posthog.flush();
      } else if (nextAppState === "active") {
        // Capture app foregrounded event
        posthog.capture("app_foregrounded", {
          timestamp: new Date().toISOString(),
        });
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [posthog]);

  return (
    <AnalyticsContext.Provider value={{ isInitialized: true, trackEvent, analytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

interface PostHogProviderProps {
  children: React.ReactNode;
  /**
   * User ID for identifying the user (optional)
   * If provided, user will be identified on mount
   */
  userId?: string;
  /**
   * User properties to set on identify (optional)
   */
  userProperties?: Record<string, unknown>;
}

/**
 * Analytics Provider - Wraps app with PostHog
 *
 * Usage in _layout.tsx:
 * ```tsx
 * import { PostHogProvider } from "@app/analytics/mobile";
 *
 * export default function RootLayout() {
 *   return (
 *     <PostHogProvider>
 *       <Slot />
 *     </PostHogProvider>
 *   );
 * }
 * ```
 */
export function PostHogProvider({ children, userId, userProperties }: PostHogProviderProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    analytics.init().then(() => {
      setInitialized(true);

      // Identify user if provided
      if (userId) {
        analytics.identify(userId, userProperties);
      }
    });
  }, [userId, userProperties]);

  // If PostHog is not configured, pass through without analytics
  if (!posthogApiKey) {
    if (__DEV__) {
      console.log("[Analytics] PostHog API key not configured. Analytics disabled.");
    }
    return (
      <AnalyticsContext.Provider value={{ isInitialized: false, trackEvent: () => {}, analytics }}>
        {children}
      </AnalyticsContext.Provider>
    );
  }

  if (!initialized) {
    // Return children without analytics context during initialization
    return <>{children}</>;
  }

  const client = analytics.getClient();

  if (!client) {
    // If PostHog failed to initialize, return children without analytics
    return (
      <AnalyticsContext.Provider value={{ isInitialized: false, trackEvent: () => {}, analytics }}>
        {children}
      </AnalyticsContext.Provider>
    );
  }

  return (
    <RNPostHogProvider
      client={client}
      autocapture={{
        // Capture touch events for interaction tracking
        captureTouches: true,
        // Disable automatic screen capture - we handle it manually for expo-router
        captureScreens: false,
      }}
    >
      <PostHogInner>{children}</PostHogInner>
    </RNPostHogProvider>
  );
}
