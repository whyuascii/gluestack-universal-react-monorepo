/**
 * Billing Query Hooks
 *
 * Fetches billing status and entitlements for the current tenant.
 */

import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../api";
import { CACHE_TIMES } from "../../constants/cache";

/**
 * Hook to fetch current tenant's billing status and entitlements
 */
export function useBillingStatus(options?: { enabled?: boolean }) {
  return useQuery({
    ...orpc.private.billing.status.queryOptions(),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TIMES.user.staleTime,
    gcTime: CACHE_TIMES.user.gcTime,
  });
}

/**
 * Hook to get entitlements with a simpler interface
 */
export function useEntitlements(options?: { enabled?: boolean }) {
  const query = useBillingStatus(options);

  // The billing status returns TenantEntitlements directly
  const data = query.data;

  return {
    ...query,
    entitlements: data,
    subscription: data?.subscription,
    tier: data?.tier || "free",
    isPro: data?.tier === "pro",
    isFree: data?.tier === "free",
    maxMembers: data?.features?.maxMembers || 5,
    isInGracePeriod: data?.subscription?.status === "past_due",
  };
}
