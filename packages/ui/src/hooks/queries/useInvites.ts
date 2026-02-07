/**
 * Invite Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../api";
import { CACHE_TIMES } from "../../constants/cache";

// Re-export InviteDetails type from contract
export type { InviteDetailsSchema } from "@app/core-contract";

/**
 * Hook to fetch invite details for a given token
 */
export function useInviteDetails(token: string | null) {
  return useQuery({
    ...orpc.private.workspace.invites.getDetails.queryOptions({
      input: { token: token! },
    }),
    enabled: !!token,
    staleTime: CACHE_TIMES.invites.staleTime,
    gcTime: CACHE_TIMES.invites.gcTime,
  });
}
