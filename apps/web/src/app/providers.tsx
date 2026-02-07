"use client";

import { GluestackUIProvider } from "@app/components";
import i18n from "@app/i18n/web";
import { AnalyticsProvider } from "@app/ui/analytics-web";
import { DEFAULT_CACHE_TIMES } from "@app/ui";
// import { RevenueCatProvider } from "@app/subscriptions"; // Temporarily disabled for landing page
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Note: @novu/nextjs Inbox component handles its own provider context
// No need for a separate NovuProvider wrapper

// Note: InactivityLogoutProvider is now in the (private) layout
// to avoid initializing auth on public pages (privacy, terms, etc.)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: DEFAULT_CACHE_TIMES.staleTime,
            gcTime: DEFAULT_CACHE_TIMES.gcTime,
          },
        },
      })
  );

  return (
    <AnalyticsProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider>
            <SafeAreaProvider className="flex flex-col flex-1 min-h-0">
              {/* <RevenueCatProvider> */}
              {children}
              {/* </RevenueCatProvider> */}
            </SafeAreaProvider>
          </GluestackUIProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </AnalyticsProvider>
  );
}
