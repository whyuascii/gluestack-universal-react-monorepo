/**
 * Auth client exports
 *
 * This default export auto-detects the platform based on environment variables:
 * - If EXPO_PUBLIC_API_URL is set, uses native client
 * - Otherwise, uses web (React) client
 *
 * For explicit platform imports:
 * - Web: import from '@app/auth/client/react'
 * - Mobile: import from '@app/auth/client/native'
 */

import { createAuthClient } from "better-auth/react";

// Shared types
export type { User, Session } from "better-auth/types";

/**
 * Auto-detect the API URL based on platform environment variables
 * EXPO_PUBLIC_API_URL takes precedence (indicates mobile/Expo environment)
 */
function getApiUrl(): string {
  // Check Expo/React Native env first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fall back to Next.js/web env
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Development fallback
  return "http://localhost:3030";
}

// Log the API URL for debugging (only in development)
const apiUrl = getApiUrl();
if (process.env.NODE_ENV === "development") {
  console.log("[Auth Client] Using API URL:", apiUrl);
}

/**
 * Cross-platform auth client that auto-detects the correct API URL
 * fetchOptions.credentials: "include" ensures cookies are sent on all platforms
 */
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
