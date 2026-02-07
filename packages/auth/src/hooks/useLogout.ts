/**
 * Logout Hook
 *
 * Handles complete logout process:
 * - Signs out via Better Auth
 * - Clears React Query cache
 * - Clears local/session storage (web only)
 * - Calls optional callback (e.g., navigation)
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { authClient } from "../utils";

// Universal platform detection (works in both web and React Native)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowRef = typeof window !== "undefined" ? (window as any) : undefined;
const isWeb = Boolean(windowRef && typeof document !== "undefined");

export interface UseLogoutOptions {
  /** Callback on successful logout (e.g., navigate to login) */
  onSuccess?: () => void;
  /** Callback on logout error */
  onError?: (error: Error) => void;
  /**
   * Custom signOut function to use instead of the default authClient.signOut
   * This is useful when the app uses a platform-specific auth client (e.g., native)
   */
  signOut?: () => Promise<unknown>;
}

/**
 * Hook for handling user logout
 *
 * @example
 * ```tsx
 * const { logout, isLoggingOut } = useLogout({
 *   onSuccess: () => router.push('/login'),
 * });
 *
 * <Button onPress={logout} disabled={isLoggingOut}>
 *   {isLoggingOut ? 'Logging out...' : 'Logout'}
 * </Button>
 * ```
 */
export function useLogout(options: UseLogoutOptions = {}) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // 1. Sign out from Better Auth (invalidates session on server)
      // Use custom signOut if provided (for platform-specific clients like native)
      const signOutFn = options.signOut ?? (() => authClient.signOut());
      await signOutFn();

      // 2. Clear all React Query cache
      queryClient.clear();

      // 3. Clear any persisted storage (web only)
      if (isWeb && windowRef) {
        try {
          // Clear localStorage items related to auth/app
          const keysToRemove: string[] = [];
          for (let i = 0; i < windowRef.localStorage.length; i++) {
            const key = windowRef.localStorage.key(i);
            if (key && (key.startsWith("auth") || key.startsWith("better-auth"))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => windowRef.localStorage.removeItem(key));

          // Clear sessionStorage
          windowRef.sessionStorage.clear();
        } catch {
          // Storage not available - ignore
        }
      }

      // 4. Call success callback (e.g., navigate to login)
      options.onSuccess?.();
    } catch (error) {
      console.error("[useLogout] Logout failed:", error);
      options.onError?.(error instanceof Error ? error : new Error("Logout failed"));
    } finally {
      setIsLoggingOut(false);
    }
  }, [queryClient, options, isLoggingOut]);

  return {
    /** Trigger logout */
    logout,
    /** Whether logout is in progress */
    isLoggingOut,
  };
}
