import { createAuthClient } from "better-auth/react";

/**
 * Better Auth React Native client for Expo mobile app
 * Provides hooks for authentication compatible with React Native
 *
 * Usage in Expo app:
 * ```tsx
 * import { authClient, useSession } from "auth/client/native";
 *
 * function MyScreen() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <ActivityIndicator />;
 *   if (!session) return <LoginScreen />;
 *
 *   return <Text>Hello {session.user.name}</Text>;
 * }
 * ```
 *
 * Note: Requires EXPO_PUBLIC_API_URL environment variable
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3030";

// Log the API URL for debugging (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("[Auth Client Native] Using API URL:", apiUrl);
}

export const authClient = createAuthClient({
  baseURL: apiUrl,
  fetchOptions: {
    credentials: "include",
  },
});

// Re-export all hooks from the client
export const { useSession, signIn, signOut, signUp } = authClient;

// Export the entire client for advanced usage
export default authClient;
