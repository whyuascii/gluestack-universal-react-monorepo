/**
 * Subscription Sync Component
 *
 * Syncs subscription state with the authenticated user.
 * Place this component inside RevenueCatProvider after user is authenticated.
 *
 * This component:
 * 1. Sets user attributes in RevenueCat when user data is available
 * 2. Tracks subscription analytics events
 * 3. Provides a bridge between auth and subscription state
 *
 * Usage:
 *   import { RevenueCatProvider, SubscriptionSync } from "@app/subscriptions";
 *
 *   <RevenueCatProvider userId={session?.user?.id}>
 *     <SubscriptionSync user={session?.user} />
 *     <App />
 *   </RevenueCatProvider>
 */

import { useEffect, useRef, useMemo } from "react";
import { useRevenueCatAvailability } from "../providers/RevenueCatProvider";
import { setUserAttributes } from "../helpers/sync";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { REVENUECAT_CONFIG } from "../config/revenuecat";

export interface SubscriptionSyncUser {
  id: string;
  email: string;
  name: string;
}

export interface SubscriptionSyncProps {
  /**
   * The authenticated user. Pass null when not authenticated.
   */
  user: SubscriptionSyncUser | null;
  /**
   * Callback when subscription status changes
   */
  onSubscriptionChange?: (isPremium: boolean) => void;
  /**
   * Whether to sync user attributes (name, email) with RevenueCat
   * @default true
   */
  syncUserAttributes?: boolean;
}

export function SubscriptionSync({
  user,
  onSubscriptionChange,
  syncUserAttributes = true,
}: SubscriptionSyncProps) {
  const { isAvailable, isInitialized } = useRevenueCatAvailability();
  // Select customerInfo to trigger re-renders when it changes, then compute isPremium
  const customerInfo = useSubscriptionStore((state) => state.customerInfo);

  const isPremium = useMemo(() => {
    if (!customerInfo) return false;
    const entitlementId = REVENUECAT_CONFIG.entitlements.premium;
    const entitlement = customerInfo.entitlements.active[entitlementId];
    return entitlement?.isActive ?? false;
  }, [customerInfo]);

  const previousIsPremiumRef = useRef<boolean | undefined>(undefined);
  const hasSetAttributesRef = useRef(false);

  // Sync user attributes with RevenueCat when user is authenticated
  useEffect(() => {
    if (!isAvailable || !isInitialized) return;
    if (!user || !syncUserAttributes) return;
    if (hasSetAttributesRef.current) return; // Only set once per session

    async function syncAttributes() {
      try {
        await setUserAttributes({
          $email: user!.email,
          $displayName: user!.name,
          // Link RevenueCat events to PostHog for unified analytics
          // See: https://www.revenuecat.com/docs/integrations/posthog
          $posthogUserId: user!.id,
        });
        hasSetAttributesRef.current = true;

        if (__DEV__) {
          console.log(
            "[SubscriptionSync] User attributes synced to RevenueCat (including PostHog link)"
          );
        }
      } catch (error) {
        console.warn("[SubscriptionSync] Failed to sync user attributes:", error);
      }
    }

    syncAttributes();
  }, [isAvailable, isInitialized, user, syncUserAttributes]);

  // Reset attributes flag when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      hasSetAttributesRef.current = false;
    }
  }, [user]);

  // Track subscription status changes
  useEffect(() => {
    if (!isInitialized || isPremium === undefined) return;

    // Only trigger callback on actual changes (not initial load)
    if (previousIsPremiumRef.current !== undefined && previousIsPremiumRef.current !== isPremium) {
      if (__DEV__) {
        console.log(
          `[SubscriptionSync] Subscription status changed: ${previousIsPremiumRef.current} -> ${isPremium}`
        );
      }
      onSubscriptionChange?.(isPremium);
    }

    previousIsPremiumRef.current = isPremium;
  }, [isInitialized, isPremium, onSubscriptionChange]);

  // This is a sync component, doesn't render anything
  return null;
}
