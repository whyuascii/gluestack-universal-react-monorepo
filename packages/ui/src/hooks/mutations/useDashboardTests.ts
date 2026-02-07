/**
 * Dashboard Integration Test Mutation Hooks
 *
 * Hooks for testing integrations from the dashboard.
 */

import { useMutation } from "@tanstack/react-query";
import { orpc } from "../../api";

/**
 * Hook to send a test email via Resend
 */
export function useSendTestEmail() {
  return useMutation({
    ...orpc.private.features.dashboard.sendTestEmail.mutationOptions(),
  });
}

/**
 * Hook to send a test in-app notification
 */
export function useSendTestNotification() {
  return useMutation({
    ...orpc.private.features.dashboard.sendTestNotification.mutationOptions(),
  });
}

/**
 * Hook to track a test event in PostHog
 */
export function useTrackTestEvent() {
  return useMutation({
    ...orpc.private.features.dashboard.trackTestEvent.mutationOptions(),
  });
}

/**
 * Hook to test RevenueCat subscription integration
 */
export function useTestSubscription() {
  return useMutation({
    ...orpc.private.features.dashboard.testSubscription.mutationOptions(),
  });
}
