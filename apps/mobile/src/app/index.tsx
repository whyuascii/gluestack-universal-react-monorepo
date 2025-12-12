import { Redirect } from "expo-router";
import { useAuthStore } from "ui";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  // Mobile goes directly to login or dashboard (no marketing home page)
  if (isAuthenticated) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
