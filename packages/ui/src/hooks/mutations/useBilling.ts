/**
 * Billing Mutation Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../../api";

/**
 * Hook to create a checkout session for upgrading
 */
export function useCheckout() {
  return useMutation(orpc.private.billing.checkout.mutationOptions());
}

/**
 * Hook to get the customer billing portal URL
 */
export function useBillingPortal() {
  return useMutation(orpc.private.billing.portal.mutationOptions());
}

/**
 * Hook to link a RevenueCat purchase to the current tenant
 */
export function useLinkRevenueCat() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.private.billing.linkRevenuecat.mutationOptions({
      onSuccess: () => {
        // Invalidate billing status after linking
        queryClient.invalidateQueries({ queryKey: orpc.private.billing.status.key() });
      },
    })
  );
}
