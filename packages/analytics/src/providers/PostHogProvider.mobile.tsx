import { PostHogProvider as RNPostHogProvider } from "posthog-react-native";
import React, { createContext, useContext, useEffect, useState } from "react";
import { analytics } from "../config/posthog.mobile";
import type { Analytics } from "../types";

const AnalyticsContext = createContext<Analytics | null>(null);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    analytics.init().then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    // Return children without analytics context during initialization
    return <>{children}</>;
  }

  const client = analytics.getClient();

  if (!client) {
    // If PostHog failed to initialize, return children without analytics
    return <>{children}</>;
  }

  return (
    <RNPostHogProvider client={client}>
      <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>
    </RNPostHogProvider>
  );
}

export function useAnalytics(): Analytics {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within PostHogProvider");
  }
  return context;
}
