/**
 * Subscription Server Module
 *
 * Server-side utilities for subscription management.
 * Used by the API server for webhook processing and entitlements.
 *
 * @example
 * ```typescript
 * import {
 *   processSubscriptionWebhook,
 *   getTenantEntitlements,
 *   getProvider,
 * } from "@app/subscriptions/server";
 * ```
 */

// =============================================================================
// Providers
// =============================================================================

export {
  getProvider,
  getProviderNames,
  isProviderConfigured,
  getConfiguredProviders,
  polarProvider,
  revenuecatProvider,
  getAppUserIdFromEvent,
} from "../providers";

export type {
  SubscriptionProvider,
  ProviderName,
  WebhookEvent,
  SubscriptionUpdate,
  SubscriptionStatus,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
  WebhookResult,
  AnalyticsEvent,
} from "../providers";

// =============================================================================
// Webhook Processing
// =============================================================================

export {
  processSubscriptionWebhook,
  updateSubscriptionStatus,
  linkRevenueCatPurchase,
  getSubscription,
} from "./webhooks";

// =============================================================================
// Entitlements
// =============================================================================

export {
  getTenantEntitlements,
  getUserEntitlements,
  hasTier,
  hasFeatureAccess,
} from "./entitlements";

export type { SubscriptionTier } from "./entitlements";
