/**
 * Auth hooks for React components
 */

import { useSession as useBetterAuthSession } from "./client";
import type { Session } from "./utils";

/**
 * Hook to get the current auth session
 * Returns the session with proper typing
 */
export function useSession() {
  const session = useBetterAuthSession();

  return {
    data: session.data as Session | null,
    isPending: session.isPending,
    error: session.error,
  };
}
