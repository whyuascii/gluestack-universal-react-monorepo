/**
 * Dashboard React Query Hooks
 */

import type { Session } from "@app/auth";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "./service";

/**
 * Dashboard query keys for cache management
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  detail: () => [...dashboardKeys.all, "detail"] as const,
};

/**
 * Hook to fetch dashboard data
 * Requires an active session to be enabled
 */
export function useDashboard(session: Session | null) {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: getDashboard,
    enabled: !!session,
  });
}
