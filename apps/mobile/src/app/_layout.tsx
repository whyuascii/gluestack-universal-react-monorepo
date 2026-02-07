import { GluestackUIProvider } from "@app/components";
import i18n from "@app/i18n/mobile";
import { DEFAULT_CACHE_TIMES } from "@app/ui";
import { AnalyticsProvider } from "@app/ui/analytics-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

// Suppress codegen warnings for new architecture
LogBox.ignoreLogs([
  /Codegen didn't run for RNSVG/,
  /Codegen didn't run for RNCSafeArea/,
  /SafeAreaView has been deprecated/,
]);

export default function RootLayout() {
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
          <GluestackUIProvider mode="light">
            <SafeAreaProvider>
              <Slot />
            </SafeAreaProvider>
          </GluestackUIProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </AnalyticsProvider>
  );
}
