/**
 * Analytics Query Hooks
 *
 * Hooks for fetching analytics-related data like consent status.
 */

import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../api";

/**
 * Hook to get the current user's analytics consent
 */
export function useAnalyticsConsent(options?: { enabled?: boolean }) {
  return useQuery({
    ...orpc.private.user.analytics.getConsent.queryOptions(),
    enabled: options?.enabled ?? true,
    staleTime: Infinity, // Consent rarely changes
  });
}
