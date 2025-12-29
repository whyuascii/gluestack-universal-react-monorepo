import { REVENUECAT_CONFIG } from "../config/revenuecat";
import { useSubscriptionStore } from "../stores/subscriptionStore";

/**
 * Hook for subscription and entitlement checking
 *
 * Platform-agnostic hook that works on both web and mobile
 */
export function useSubscription() {
  const customerInfo = useSubscriptionStore((state) => state.customerInfo);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  const error = useSubscriptionStore((state) => state.error);
  const isPremium = useSubscriptionStore((state) => state.isPremium);
  const activeSubscriptions = useSubscriptionStore((state) => state.activeSubscriptions);
  const hasEntitlement = useSubscriptionStore((state) => state.hasEntitlement);

  /**
   * Check if user has a specific product subscription
   */
  const hasProduct = (productId: string): boolean => {
    return activeSubscriptions().includes(productId);
  };

  /**
   * Check if user has the monthly subscription
   */
  const hasMonthly = (): boolean => {
    return hasProduct(REVENUECAT_CONFIG.products.monthly);
  };

  /**
   * Check if user has the yearly subscription
   */
  const hasYearly = (): boolean => {
    return hasProduct(REVENUECAT_CONFIG.products.yearly);
  };

  /**
   * Get expiration date for premium entitlement
   */
  const getPremiumExpirationDate = (): Date | null => {
    if (!customerInfo) return null;

    const premium = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlements.premium];
    return premium?.expirationDate ?? null;
  };

  /**
   * Check if subscription will renew
   * (null expiration date means lifetime/non-expiring)
   */
  const willRenew = (): boolean => {
    const expirationDate = getPremiumExpirationDate();
    return expirationDate !== null && expirationDate > new Date();
  };

  return {
    // Customer info
    customerInfo,
    isLoading,
    error,

    // Entitlement checks
    isPremium: isPremium(),
    hasEntitlement,

    // Product checks
    hasProduct,
    hasMonthly: hasMonthly(),
    hasYearly: hasYearly(),
    activeSubscriptions: activeSubscriptions(),

    // Subscription details
    expirationDate: getPremiumExpirationDate(),
    willRenew: willRenew(),
  };
}
