import { useState, useCallback } from "react";
import { useSubscriptionStore } from "../stores/subscriptionStore";

// Extend Window interface to include our paywall resolve function
declare global {
  interface Window {
    __paywallResolve?: (result: PaywallResult) => void;
  }
}

/**
 * Paywall result type (matching native SDK)
 */
export enum PaywallResult {
  /** User purchased or already has access */
  PURCHASED = "PURCHASED",
  /** User cancelled the paywall */
  CANCELLED = "CANCELLED",
  /** Paywall was not presented (already has entitlement) */
  NOT_PRESENTED = "NOT_PRESENTED",
  /** An error occurred */
  ERROR = "ERROR",
}

/**
 * Hook for presenting RevenueCat paywalls (Web)
 *
 * Note: Web SDK doesn't have built-in paywall UI like native.
 * This hook provides state management for custom paywall screens.
 */
export function usePaywall() {
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [paywallResult, setPaywallResult] = useState<PaywallResult | null>(null);
  const isPremium = useSubscriptionStore((state) => state.isPremium);
  const hasEntitlement = useSubscriptionStore((state) => state.hasEntitlement);

  /**
   * Show the paywall UI
   * Returns a promise that resolves when the paywall is dismissed
   */
  const showPaywall = useCallback((): Promise<PaywallResult> => {
    return new Promise((resolve) => {
      setIsPaywallVisible(true);
      setPaywallResult(null);

      // Store resolve function for later use
      window.__paywallResolve = resolve;
    });
  }, []);

  /**
   * Show paywall only if user doesn't have required entitlement
   */
  const showPaywallIfNeeded = useCallback(
    (entitlement?: string): Promise<PaywallResult> => {
      // Check if user already has entitlement
      const hasRequired = entitlement ? hasEntitlement(entitlement) : isPremium();

      if (hasRequired) {
        return Promise.resolve(PaywallResult.NOT_PRESENTED);
      }

      return showPaywall();
    },
    [hasEntitlement, isPremium, showPaywall]
  );

  /**
   * Dismiss the paywall with a result
   */
  const dismissPaywall = useCallback((result: PaywallResult) => {
    setIsPaywallVisible(false);
    setPaywallResult(result);

    // Resolve the promise from showPaywall
    const resolve = window.__paywallResolve;
    if (resolve) {
      resolve(result);
      delete window.__paywallResolve;
    }
  }, []);

  /**
   * Mark paywall as purchased (convenience method)
   */
  const onPurchaseSuccess = useCallback(() => {
    dismissPaywall(PaywallResult.PURCHASED);
  }, [dismissPaywall]);

  /**
   * Mark paywall as cancelled (convenience method)
   */
  const onPurchaseCancel = useCallback(() => {
    dismissPaywall(PaywallResult.CANCELLED);
  }, [dismissPaywall]);

  /**
   * Mark paywall as error (convenience method)
   */
  const onPurchaseError = useCallback(() => {
    dismissPaywall(PaywallResult.ERROR);
  }, [dismissPaywall]);

  return {
    showPaywall,
    showPaywallIfNeeded,
    dismissPaywall,
    isPaywallVisible,
    paywallResult,
    // Convenience methods
    onPurchaseSuccess,
    onPurchaseCancel,
    onPurchaseError,
  };
}
