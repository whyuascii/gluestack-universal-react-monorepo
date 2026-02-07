/**
 * Subscriptions Module
 *
 * Cross-platform subscription management with support for multiple providers.
 *
 * - **Client-side (mobile):** RevenueCat SDK for in-app purchases
 * - **Server-side:** Unified provider abstraction for Polar, RevenueCat, and more
 *
 * @packageDocumentation
 */

// =============================================================================
// Provider System (for server-side use)
// =============================================================================
export {
  getProvider,
  getProviderNames,
  isProviderConfigured,
  getConfiguredProviders,
} from "./providers";

export type {
  SubscriptionProvider,
  ProviderName,
  WebhookEvent,
  SubscriptionUpdate,
  SubscriptionStatus as SubscriptionStatusType,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
  WebhookResult,
  AnalyticsEvent,
} from "./providers";

// =============================================================================
// Configuration (RevenueCat mobile SDK)
// =============================================================================
export { REVENUECAT_CONFIG, getRevenueCatConfig, getPlatformApiKey } from "./config/revenuecat";
export type { EntitlementKey, ProductKey } from "./config/revenuecat";

// =============================================================================
// Store
// =============================================================================
export { useSubscriptionStore } from "./stores/subscriptionStore";
export type { CustomerInfo, EntitlementInfo, EntitlementsRecord } from "./stores/subscriptionStore";

// =============================================================================
// Providers
// =============================================================================
export {
  RevenueCatProvider,
  useRevenueCatAvailability,
  LOG_LEVEL,
  STOREKIT_VERSION,
} from "./providers/RevenueCatProvider";

// =============================================================================
// Hooks
// =============================================================================
export { useRevenueCat } from "./hooks/useRevenueCat";
export { useSubscription } from "./hooks/useSubscription";
export { usePaywall } from "./hooks/usePaywall";

// =============================================================================
// Components
// =============================================================================
export { PremiumGate } from "./components/PremiumGate";
export { SubscriptionStatus } from "./components/SubscriptionStatus";
export { SubscriptionSync } from "./components/SubscriptionSync";
export type { SubscriptionSyncProps, SubscriptionSyncUser } from "./components/SubscriptionSync";

// =============================================================================
// Screens
// =============================================================================
export { PaywallScreen } from "./screens/PaywallScreen";
export { SubscriptionScreen } from "./screens/SubscriptionScreen";

// =============================================================================
// Helpers - Expo/Environment
// =============================================================================
export {
  isRunningInExpoGo,
  isRunningInDevBuild,
  isRevenueCatAvailable,
  getRevenueCatUnavailableReason,
  warnIfRevenueCatUnavailable,
  getEnvironmentInfo,
  type EnvironmentInfo,
} from "./helpers/expo";

// =============================================================================
// Helpers - Sync
// =============================================================================
export {
  refreshSubscription,
  syncPurchases,
  restorePurchases,
  loginUser,
  logoutUser,
  hasActiveEntitlement,
  getCustomerInfo,
  resetSubscriptionState,
  setUserAttributes,
  getAnonymousUserId,
} from "./helpers/sync";

// =============================================================================
// Helpers - Analytics
// =============================================================================
export {
  formatPaywallViewedEvent,
  formatPurchaseStartedEvent,
  formatPurchaseCompletedEvent,
  formatRestoreEvent,
  formatPurchaseFailedEvent,
  extractUserPropertiesFromSubscription,
  calculateSubscriptionMetrics,
  type SubscriptionEventType,
  type SubscriptionEventBase,
  type PaywallViewedEvent,
  type PurchaseStartedEvent,
  type PurchaseCompletedEvent,
  type RestoreEvent,
  type PurchaseFailedEvent,
  type SubscriptionEvent,
} from "./helpers/analytics";

// =============================================================================
// Error Types
// =============================================================================
export {
  PurchaseErrorCode,
  PurchaseError,
  parsePurchaseError,
  shouldLogError,
} from "./types/errors";
