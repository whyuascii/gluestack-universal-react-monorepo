/**
 * Subscription Provider Types
 *
 * Defines the interface that all subscription providers must implement.
 * This abstraction allows easy switching between providers and adding new ones.
 */

// =============================================================================
// Provider Names
// =============================================================================

/** Supported subscription providers */
export type ProviderName = "polar" | "revenuecat";

// =============================================================================
// Webhook Types
// =============================================================================

/** Parsed webhook event from any provider */
export interface WebhookEvent {
  /** Unique event ID for idempotency */
  eventId: string;
  /** Event type (provider-specific) */
  eventType: string;
  /** Raw payload for logging */
  rawPayload: unknown;
}

/** Unified subscription update format */
export interface SubscriptionUpdate {
  tenantId: string;
  userId?: string;
  status: SubscriptionStatus;
  planId: string;
  planName?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  providerSubscriptionId: string;
  providerCustomerId?: string;
}

/** Subscription status values */
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "paused";

// =============================================================================
// Checkout Types
// =============================================================================

/** Parameters for creating a checkout session */
export interface CheckoutParams {
  tenantId: string;
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl?: string;
}

/** Result of checkout session creation */
export interface CheckoutResult {
  checkoutUrl: string;
}

/** Result of portal session creation */
export interface PortalResult {
  portalUrl: string;
}

// =============================================================================
// Analytics Event Types
// =============================================================================

/** Analytics event to track */
export interface AnalyticsEvent {
  name: string;
  userId?: string;
  properties: Record<string, unknown>;
}

// =============================================================================
// Provider Interface
// =============================================================================

/**
 * Interface that all subscription providers must implement.
 *
 * @example
 * ```typescript
 * export const stripeProvider: SubscriptionProvider = {
 *   name: "stripe",
 *   verifyWebhook: (payload, signature) => { ... },
 *   parseWebhookEvent: (payload) => { ... },
 *   mapEventToSubscriptionUpdate: (event) => { ... },
 * };
 * ```
 */
export interface SubscriptionProvider {
  /** Provider identifier */
  name: ProviderName;

  /**
   * Verify webhook signature.
   *
   * @param payload - Raw request body as string
   * @param signature - Signature header value
   * @returns true if signature is valid
   */
  verifyWebhook(payload: string, signature: string): boolean;

  /**
   * Parse raw webhook payload into a WebhookEvent.
   *
   * @param payload - Raw request body as string
   * @returns Parsed webhook event
   */
  parseWebhookEvent(payload: string): WebhookEvent;

  /**
   * Map provider-specific event to unified subscription update.
   *
   * @param event - Parsed webhook event
   * @returns Subscription update, or null if event should be ignored
   */
  mapEventToSubscriptionUpdate(event: WebhookEvent): SubscriptionUpdate | null;

  /**
   * Get analytics event to track for this webhook event.
   *
   * @param event - Parsed webhook event
   * @param update - Mapped subscription update (if any)
   * @returns Analytics event to track, or null if no tracking needed
   */
  getAnalyticsEvent?(event: WebhookEvent, update: SubscriptionUpdate | null): AnalyticsEvent | null;

  /**
   * Create a checkout session (optional - not all providers use hosted checkout).
   *
   * @param params - Checkout parameters
   * @returns Checkout URL
   */
  createCheckout?(params: CheckoutParams): Promise<CheckoutResult>;

  /**
   * Create a customer portal session (optional - not all providers have portals).
   *
   * @param customerId - Provider-specific customer ID
   * @returns Portal URL
   */
  createPortalSession?(customerId: string): Promise<PortalResult>;
}

// =============================================================================
// Webhook Result Types
// =============================================================================

/** Result of webhook processing */
export interface WebhookResult {
  /** Whether the webhook was processed (false if duplicate or ignored) */
  processed: boolean;
  /** Subscription ID if created/updated */
  subscriptionId?: string;
  /** Error message if processing failed */
  error?: string;
  /** Reason for not processing (for debugging) */
  reason?: string;
}
