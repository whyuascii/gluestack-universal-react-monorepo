/**
 * RevenueCat Subscriptions Module
 *
 * Cross-platform subscription management for an App
 */

// Config
export { REVENUECAT_CONFIG, getRevenueCatConfig } from "./config/revenuecat";
export type { EntitlementKey, ProductKey } from "./config/revenuecat";

// Store
export { useSubscriptionStore } from "./stores/subscriptionStore";
export type { CustomerInfo, EntitlementInfo } from "./stores/subscriptionStore";

// Providers
export { RevenueCatProvider } from "./providers/RevenueCatProvider";

// Hooks
export { useRevenueCat } from "./hooks/useRevenueCat";
export { useSubscription } from "./hooks/useSubscription";
export { usePaywall } from "./hooks/usePaywall";

// Components
export { PremiumGate } from "./components/PremiumGate";
export { SubscriptionStatus } from "./components/SubscriptionStatus";

// Screens
export { PaywallScreen } from "./screens/PaywallScreen";
export { SubscriptionScreen } from "./screens/SubscriptionScreen";
