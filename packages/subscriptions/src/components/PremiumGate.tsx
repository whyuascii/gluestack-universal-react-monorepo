import React, { useEffect } from "react";
import { usePaywall } from "../hooks/usePaywall";
import { useSubscription } from "../hooks/useSubscription";

interface PremiumGateProps {
  /**
   * Content to show when user has premium
   */
  children: React.ReactNode;

  /**
   * Content to show when user doesn't have premium
   * If not provided and showPaywall is true, paywall will be shown
   */
  fallback?: React.ReactNode;

  /**
   * Whether to automatically show paywall when user is not premium
   * Default: false
   */
  showPaywall?: boolean;

  /**
   * Custom entitlement to check (defaults to premium)
   */
  entitlement?: string;

  /**
   * Loading state fallback
   */
  loadingFallback?: React.ReactNode;
}

/**
 * PremiumGate Component
 *
 * Gates content behind a premium subscription.
 * Can optionally show a fallback or automatically present the paywall.
 */
export function PremiumGate({
  children,
  fallback,
  showPaywall = false,
  entitlement,
  loadingFallback = null,
}: PremiumGateProps) {
  const { isPremium, hasEntitlement, isLoading } = useSubscription();
  const { showPaywallIfNeeded } = usePaywall();

  const hasPremium = entitlement ? hasEntitlement(entitlement) : isPremium;

  // Auto-present paywall if requested
  useEffect(() => {
    if (!isLoading && !hasPremium && showPaywall && !fallback) {
      showPaywallIfNeeded(entitlement);
    }
  }, [isLoading, hasPremium, showPaywall, fallback, entitlement, showPaywallIfNeeded]);

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (hasPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // If showPaywall is true and no fallback, return null
  // (paywall will be shown via useEffect)
  if (showPaywall) {
    return null;
  }

  // Default: show nothing if not premium
  return null;
}
