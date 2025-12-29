"use client";

import { PostHogProvider } from "@app/analytics/web";
import { GluestackUIProvider } from "@app/components";
import i18n from "@app/i18n/web";
// import { RevenueCatProvider } from "@app/subscriptions"; // Temporarily disabled for landing page
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <PostHogProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider>
            <SafeAreaProvider className="flex-1 overflow-hidden">
              {/* <RevenueCatProvider> */}
              {children}
              {/* </RevenueCatProvider> */}
            </SafeAreaProvider>
          </GluestackUIProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </PostHogProvider>
  );
}
