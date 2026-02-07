/**
 * RevenueCat Subscription Provider
 *
 * Handles mobile payments via RevenueCat.
 *
 * @see https://www.revenuecat.com/docs/webhooks
 */

import crypto from "crypto";
import type {
  SubscriptionProvider,
  WebhookEvent,
  SubscriptionUpdate,
  SubscriptionStatus,
  AnalyticsEvent,
} from "./types";

// =============================================================================
// Environment
// =============================================================================

const getWebhookSecret = () => process.env.REVENUECAT_WEBHOOK_SECRET || "";

// =============================================================================
// RevenueCat-Specific Types
// =============================================================================

interface RevenueCatEvent {
  id: string;
  type: string;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  entitlement_ids: string[];
  expiration_at_ms: number | null;
  original_transaction_id: string;
  price_in_purchased_currency?: number;
  currency?: string;
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

// =============================================================================
// Status Mapping
// =============================================================================

function mapRevenueCatStatus(eventType: string, expirationDate: Date | null): SubscriptionStatus {
  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
    case "UNCANCELLATION":
      return "active";

    case "BILLING_ISSUE":
      return "past_due";

    case "CANCELLATION":
      return "canceled";

    case "EXPIRATION":
      return "expired";

    case "SUBSCRIBER_ALIAS":
    case "TRANSFER":
      // These don't change status, use expiration date to determine
      if (expirationDate && expirationDate < new Date()) {
        return "expired";
      }
      return "active";

    default:
      // For unknown events, check expiration
      if (expirationDate && expirationDate < new Date()) {
        return "expired";
      }
      return "active";
  }
}

// =============================================================================
// Provider Implementation
// =============================================================================

export const revenuecatProvider: SubscriptionProvider = {
  name: "revenuecat",

  verifyWebhook(payload: string, signature: string): boolean {
    const secret = getWebhookSecret();

    // If no secret configured, skip verification (dev mode)
    if (!secret) {
      console.warn("[RevenueCat] No webhook secret configured, skipping verification");
      return true;
    }

    if (!signature) {
      return false;
    }

    try {
      const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  },

  parseWebhookEvent(payload: string): WebhookEvent {
    const data = JSON.parse(payload) as RevenueCatWebhookPayload;
    return {
      eventId: data.event.id || `rc_${Date.now()}`,
      eventType: data.event.type,
      rawPayload: data,
    };
  },

  mapEventToSubscriptionUpdate(event: WebhookEvent): SubscriptionUpdate | null {
    const payload = event.rawPayload as RevenueCatWebhookPayload;
    const rcEvent = payload.event;

    // RevenueCat doesn't include tenantId in webhook - we look up by appUserId
    // Return partial update that will be matched to existing subscription
    const expirationDate = rcEvent.expiration_at_ms ? new Date(rcEvent.expiration_at_ms) : null;

    return {
      // tenantId will be resolved from existing subscription by appUserId
      tenantId: "", // Placeholder - resolved in webhook processor
      status: mapRevenueCatStatus(rcEvent.type, expirationDate),
      planId: rcEvent.product_id,
      currentPeriodEnd: expirationDate ?? undefined,
      providerSubscriptionId: rcEvent.app_user_id,
      providerCustomerId: rcEvent.original_app_user_id,
    };
  },

  getAnalyticsEvent(event: WebhookEvent, update: SubscriptionUpdate | null): AnalyticsEvent | null {
    if (!update?.userId) return null;

    const payload = event.rawPayload as RevenueCatWebhookPayload;
    const rcEvent = payload.event;

    switch (rcEvent.type) {
      case "INITIAL_PURCHASE":
        return {
          name: "subscription.started",
          userId: update.userId,
          properties: {
            plan_id: rcEvent.product_id,
            provider: "revenuecat",
            trial_used: false,
          },
        };

      case "RENEWAL":
      case "UNCANCELLATION":
        return {
          name: "subscription.renewed",
          userId: update.userId,
          properties: {
            plan_id: rcEvent.product_id,
            provider: "revenuecat",
          },
        };

      case "CANCELLATION":
        return {
          name: "subscription.canceled",
          userId: update.userId,
          properties: {
            plan_id: rcEvent.product_id,
            provider: "revenuecat",
            reason: "user_requested",
          },
        };

      case "EXPIRATION":
        return {
          name: "subscription.expired",
          userId: update.userId,
          properties: {
            plan_id: rcEvent.product_id,
            provider: "revenuecat",
          },
        };

      case "BILLING_ISSUE":
        return {
          name: "subscription.payment_failed",
          userId: update.userId,
          properties: {
            plan_id: rcEvent.product_id,
            provider: "revenuecat",
          },
        };

      case "PRODUCT_CHANGE":
        return {
          name: "subscription.started",
          userId: update.userId,
          properties: {
            plan_id: rcEvent.product_id,
            provider: "revenuecat",
            trial_used: false,
          },
        };

      default:
        return null;
    }
  },

  // RevenueCat doesn't use hosted checkout - purchases happen in-app
  // createCheckout is not implemented

  // RevenueCat doesn't have a customer portal
  // createPortalSession is not implemented
};

// =============================================================================
// Helper to get appUserId from event
// =============================================================================

export function getAppUserIdFromEvent(event: WebhookEvent): string | null {
  const payload = event.rawPayload as RevenueCatWebhookPayload;
  return payload.event?.app_user_id || null;
}
