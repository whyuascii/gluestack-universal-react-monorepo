/**
 * Settings Query Hooks
 *
 * TanStack Query hooks for settings data fetching using oRPC.
 */

import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../api";
import { CACHE_TIMES } from "../../constants/cache";
import { queryKeys } from "./keys";

/**
 * Hook to fetch notification preferences from the server for the current user
 */
export function useNotificationPreferencesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...orpc.private.user.settings.getNotificationPreferences.queryOptions(),
    queryKey: queryKeys.settings.notificationPreferences(),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TIMES.settings.staleTime,
    gcTime: CACHE_TIMES.settings.gcTime,
  });
}

/**
 * Hook to fetch members of the current tenant/group
 */
export function useGroupMembers(options?: { enabled?: boolean }) {
  return useQuery({
    ...orpc.private.user.settings.getMembers.queryOptions(),
    queryKey: queryKeys.settings.members(),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TIMES.groupMembers.staleTime,
    gcTime: CACHE_TIMES.groupMembers.gcTime,
  });
}
