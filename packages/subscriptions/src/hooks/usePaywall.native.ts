import { useState, useCallback } from "react";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { REVENUECAT_CONFIG } from "../config/revenuecat";

// Re-export for easier usage
export { PAYWALL_RESULT as PaywallResult };

/**
 * Hook for presenting RevenueCat paywalls (React Native)
 */
export function usePaywall() {
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);

  /**
   * Present the paywall UI
   * Returns the result of the paywall interaction
   */
  const showPaywall = useCallback(async (): Promise<PAYWALL_RESULT> => {
    try {
      setIsPaywallVisible(true);
      const result = await RevenueCatUI.presentPaywall();
      setIsPaywallVisible(false);
      return result;
    } catch (error) {
      console.error("[RevenueCat] Failed to present paywall:", error);
      setIsPaywallVisible(false);
      throw error;
    }
  }, []);

  /**
   * Present paywall only if user doesn't have required entitlement
   * Returns the result of the paywall interaction (or NOT_PRESENTED if already entitled)
   */
  const showPaywallIfNeeded = useCallback(async (entitlement?: string): Promise<PAYWALL_RESULT> => {
    try {
      setIsPaywallVisible(true);
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: entitlement ?? REVENUECAT_CONFIG.entitlements.premium,
      });
      setIsPaywallVisible(false);
      return result;
    } catch (error) {
      console.error("[RevenueCat] Failed to present paywall if needed:", error);
      setIsPaywallVisible(false);
      throw error;
    }
  }, []);

  /**
   * Dismiss paywall (not directly supported, but included for API consistency)
   */
  const dismissPaywall = useCallback(() => {
    // Native paywalls handle their own dismissal
    // This is here for API compatibility with web
    console.warn("[RevenueCat] Paywall dismissal is handled automatically on native");
  }, []);

  return {
    showPaywall,
    showPaywallIfNeeded,
    dismissPaywall,
    isPaywallVisible,
  };
}
