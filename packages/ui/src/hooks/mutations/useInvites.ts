/**
 * Invite Mutation Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../../api";

/**
 * Hook to accept an invitation
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.private.workspace.invites.accept.mutationOptions({
      onSuccess: () => {
        // Invalidate user data to reflect new membership
        queryClient.invalidateQueries({ queryKey: orpc.private.user.me.get.key() });
      },
    })
  );
}

/**
 * Hook to send invitations
 */
export function useSendInvites() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.private.workspace.tenants.sendInvites.mutationOptions({
      onSuccess: () => {
        // Invalidate user data
        queryClient.invalidateQueries({ queryKey: orpc.private.user.me.get.key() });
      },
    })
  );
}
