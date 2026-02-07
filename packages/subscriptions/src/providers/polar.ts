/**
 * Polar Subscription Provider
 *
 * Handles web payments via Polar.sh.
 *
 * @see https://docs.polar.sh/developers/webhooks
 */

import { Webhook } from "standardwebhooks";
import type {
  SubscriptionProvider,
  WebhookEvent,
  SubscriptionUpdate,
  SubscriptionStatus,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
  AnalyticsEvent,
} from "./types";

// =============================================================================
// Environment
// =============================================================================

const getWebhookSecret = () => process.env.POLAR_WEBHOOK_SECRET || "";
const getAccessToken = () => process.env.POLAR_ACCESS_TOKEN || "";

// =============================================================================
// Polar-Specific Types
// =============================================================================

interface PolarSubscriptionData {
  id: string;
  status: string;
  product_id: string;
  product?: { name: string };
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  customer_id: string;
  metadata?: {
    tenantId?: string;
    userId?: string;
  };
}

interface PolarWebhookPayload {
  type: string;
  event_id: string;
  data: PolarSubscriptionData;
}

// =============================================================================
// Status Mapping
// =============================================================================

function mapPolarStatus(polarStatus: string): SubscriptionStatus {
  switch (polarStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
    case "incomplete_expired":
      return "expired";
    case "paused":
      return "paused";
    default:
      return "active";
  }
}

// =============================================================================
// Provider Implementation
// =============================================================================

export const polarProvider: SubscriptionProvider = {
  name: "polar",

  verifyWebhook(payload: string, signature: string): boolean {
    const secret = getWebhookSecret();
    if (!secret) {
      console.warn("[Polar] POLAR_WEBHOOK_SECRET not configured");
      return false;
    }

    try {
      const wh = new Webhook(secret);
      wh.verify(payload, { "webhook-signature": signature });
      return true;
    } catch {
      return false;
    }
  },

  parseWebhookEvent(payload: string): WebhookEvent {
    const data = JSON.parse(payload) as PolarWebhookPayload;
    return {
      eventId: data.event_id || `polar_${Date.now()}`,
      eventType: data.type,
      rawPayload: data,
    };
  },

  mapEventToSubscriptionUpdate(event: WebhookEvent): SubscriptionUpdate | null {
    const payload = event.rawPayload as PolarWebhookPayload;
    const { data } = payload;

    // Only handle subscription events
    if (!event.eventType.startsWith("subscription.")) {
      return null;
    }

    // Require tenantId in metadata
    const tenantId = data.metadata?.tenantId;
    if (!tenantId) {
      console.warn("[Polar] No tenantId in subscription metadata");
      return null;
    }

    // Handle revoked event (immediate termination)
    if (event.eventType === "subscription.revoked") {
      return {
        tenantId,
        userId: data.metadata?.userId,
        status: "expired",
        planId: data.product_id,
        planName: data.product?.name,
        providerSubscriptionId: data.id,
        providerCustomerId: data.customer_id,
      };
    }

    // Handle other subscription events
    return {
      tenantId,
      userId: data.metadata?.userId,
      status: mapPolarStatus(data.status),
      planId: data.product_id,
      planName: data.product?.name,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      providerSubscriptionId: data.id,
      providerCustomerId: data.customer_id,
    };
  },

  getAnalyticsEvent(event: WebhookEvent, update: SubscriptionUpdate | null): AnalyticsEvent | null {
    if (!update?.userId) return null;

    const payload = event.rawPayload as PolarWebhookPayload;

    switch (event.eventType) {
      case "subscription.created":
        return {
          name: "subscription.started",
          userId: update.userId,
          properties: {
            plan_id: payload.data.product_id,
            provider: "polar",
            trial_used: false,
          },
        };

      case "subscription.updated":
        if (payload.data.status === "past_due") {
          return {
            name: "subscription.payment_failed",
            userId: update.userId,
            properties: {
              plan_id: payload.data.product_id,
              provider: "polar",
            },
          };
        }
        if (payload.data.status === "active") {
          return {
            name: "subscription.renewed",
            userId: update.userId,
            properties: {
              plan_id: payload.data.product_id,
              provider: "polar",
            },
          };
        }
        return null;

      case "subscription.canceled":
        return {
          name: "subscription.canceled",
          userId: update.userId,
          properties: {
            plan_id: payload.data.product_id,
            provider: "polar",
            reason: "user_requested",
          },
        };

      case "subscription.revoked":
        return {
          name: "subscription.expired",
          userId: update.userId,
          properties: {
            plan_id: payload.data.product_id,
            provider: "polar",
          },
        };

      default:
        return null;
    }
  },

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("POLAR_ACCESS_TOKEN not configured");
    }

    const { Polar } = await import("@polar-sh/sdk");
    const polar = new Polar({ accessToken });

    const checkout = await polar.checkouts.create({
      productId: params.planId,
      successUrl: params.successUrl,
      metadata: {
        tenantId: params.tenantId,
        userId: params.userId,
      },
    });

    return { checkoutUrl: checkout.url };
  },

  async createPortalSession(customerId: string): Promise<PortalResult> {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("POLAR_ACCESS_TOKEN not configured");
    }

    const { Polar } = await import("@polar-sh/sdk");
    const polar = new Polar({ accessToken });

    const session = await polar.customerSessions.create({
      customerId,
    });

    return { portalUrl: session.customerPortalUrl };
  },
};
