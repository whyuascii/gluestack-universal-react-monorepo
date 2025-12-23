import { PostHogProvider } from "@app/analytics/mobile";
import { GluestackUIProvider } from "@app/components";
import i18n from "@app/i18n/mobile";
import { RevenueCatProvider, useSession } from "@app/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { data: session, isPending } = useSession();

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
    if (isPending) return; // Wait for session to load

    const inAuthGroup = segments[0] === "(auth)";
    const isAuthenticated = !!session;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)/dashboard");
    }
  }, [session, isPending, segments]);

  return (
    <PostHogProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider mode="light">
            <SafeAreaProvider>
              <RevenueCatProvider userId={session?.user?.id}>
                <Slot />
              </RevenueCatProvider>
            </SafeAreaProvider>
          </GluestackUIProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </PostHogProvider>
  );
}
