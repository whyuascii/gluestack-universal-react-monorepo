import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GluestackUIProvider } from "components";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nextProvider } from "react-i18next";
import { PostHogProvider } from "analytics/mobile";
import i18n from "i18n/mobile";
import { useAuthStore, RevenueCatProvider } from "ui";
import "../../global.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

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

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)/dashboard");
    }
  }, [isAuthenticated, segments]);

  return (
    <PostHogProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider mode="light">
            <SafeAreaProvider>
              <RevenueCatProvider>
                <Slot />
              </RevenueCatProvider>
            </SafeAreaProvider>
          </GluestackUIProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </PostHogProvider>
  );
}
