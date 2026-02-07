/**
 * Tenant Mutation Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../../api";

/**
 * Hook to create a new tenant
 */
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.private.workspace.tenants.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.private.user.me.get.key() });
      },
    })
  );
}

/**
 * Hook to switch active tenant
 */
export function useSwitchTenant() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.private.user.me.switchTenant.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.private.user.me.get.key() });
      },
    })
  );
}
