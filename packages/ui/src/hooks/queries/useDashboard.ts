/**
 * Dashboard Query Hooks
 */

import type { Session } from "@app/auth";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../api";
import { CACHE_TIMES } from "../../constants/cache";

/**
 * Hook to fetch dashboard stats
 * Requires an active session to be enabled
 */
export function useDashboard(session: Session | null) {
  return useQuery({
    ...orpc.private.features.dashboard.getStats.queryOptions(),
    enabled: !!session,
    staleTime: CACHE_TIMES.dashboard.staleTime,
    gcTime: CACHE_TIMES.dashboard.gcTime,
  });
}

/**
 * Hook to fetch integration status
 * Returns which integrations are configured
 */
export function useIntegrationStatus(session: Session | null) {
  return useQuery({
    ...orpc.private.features.dashboard.getIntegrationStatus.queryOptions(),
    enabled: !!session,
    staleTime: CACHE_TIMES.integrations.staleTime,
    gcTime: CACHE_TIMES.integrations.gcTime,
  });
}
