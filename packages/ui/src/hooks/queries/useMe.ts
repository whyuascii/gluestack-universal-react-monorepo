/**
 * Me Query Hook
 *
 * Fetches the current user's data including tenant context using oRPC.
 */

import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../api";
import { CACHE_TIMES } from "../../constants/cache";

/**
 * Hook to fetch current user with tenant context
 */
export function useMe(options?: {
  enabled?: boolean;
  inviteToken?: string;
  refetchOnMount?: boolean | "always";
}) {
  return useQuery({
    ...orpc.private.user.me.get.queryOptions({
      input: options?.inviteToken ? { invite: options.inviteToken } : undefined,
    }),
    enabled: options?.enabled ?? true,
    refetchOnMount: options?.refetchOnMount,
    staleTime: CACHE_TIMES.user.staleTime,
    gcTime: CACHE_TIMES.user.gcTime,
  });
}
