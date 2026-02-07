/**
 * Analytics Mutation Hooks
 *
 * Hooks for tracking events and managing analytics consent.
 * All events flow through the server for privacy validation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { orpc } from "../../api";

/**
 * Hook to track analytics events through the server
 * Events are validated against allowlist and PII is scrubbed
 */
export function useTrackEvent() {
  return useMutation({
    ...orpc.public.analytics.track.mutationOptions(),
    // Don't show errors for analytics - fail silently
    onError: () => {},
  });
}

/**
 * Convenience hook that returns a stable track function
 * Can be called imperatively without managing mutation state
 */
export function useTrack() {
  const mutation = useTrackEvent();

  return useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      mutation.mutate({ event, properties });
    },
    [mutation]
  );
}

/**
 * Hook to update the user's analytics consent
 */
export function useUpdateAnalyticsConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.private.user.analytics.updateConsent.mutationOptions(),
    onSuccess: () => {
      // Invalidate consent query after updating
      queryClient.invalidateQueries({ queryKey: orpc.private.user.analytics.getConsent.key() });
    },
  });
}

/**
 * Hook to alias an anonymous ID to the current user
 * Called on login to link pre-login events to the user
 */
export function useAliasAnonymousId() {
  return useMutation(orpc.private.user.analytics.alias.mutationOptions());
}
