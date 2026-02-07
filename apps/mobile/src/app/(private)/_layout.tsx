import { useSession } from "@app/auth/client/native";
import { ROUTES } from "@app/ui";
import { Stack, Redirect, type Href } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Private Layout - Authenticated section of the app
 *
 * Handles:
 * - Auth guard (redirect to login if not authenticated)
 * - Contains tabs and stack screens
 */
export default function PrivateLayout() {
  const insets = useSafeAreaInsets();
  const { data: session, isPending } = useSession();

  // Show loading while checking auth
  if (isPending) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Redirect href={ROUTES.LOGIN.mobile as Href} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tab-based screens */}
        <Stack.Screen name="(tabs)" />

        {/* Stack screens (modals/full-page) */}
        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile" />

        {/* Onboarding flow */}
        <Stack.Screen name="onboarding" />

        {/* Invite acceptance */}
        <Stack.Screen name="invite" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
