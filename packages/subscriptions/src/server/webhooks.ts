/**
 * Subscription Webhook Processor
 *
 * Unified webhook processing for all subscription providers.
 * Handles idempotency, status updates, and analytics tracking.
 */

import { trackServerEvent, type ServerEventProperties } from "@app/analytics/server";
import { db, subscriptions, subscriptionEvents, eq } from "@app/database";
import {
  getProvider,
  getAppUserIdFromEvent,
  type ProviderName,
  type WebhookResult,
  type SubscriptionUpdate,
} from "../providers";

// Type for subscription insert/update operations
type SubscriptionInsert = typeof subscriptions.$inferInsert;
type SubscriptionUpdate_ = Partial<SubscriptionInsert>;

// =============================================================================
// Webhook Processing
// =============================================================================

/**
 * Process a subscription webhook from any provider.
 *
 * This function handles:
 * 1. Signature verification
 * 2. Idempotency (deduplication)
 * 3. Subscription upsert
 * 4. Analytics tracking
 *
 * @param providerName - The provider that sent the webhook
 * @param payload - Raw request body as string
 * @param signature - Signature header value
 * @returns Processing result
 *
 * @example
 * ```typescript
 * const result = await processSubscriptionWebhook(
 *   "polar",
 *   request.rawBody,
 *   request.headers["webhook-signature"]
 * );
 *
 * if (result.error === "Invalid signature") {
 *   return reply.status(401).send({ error: "Invalid signature" });
 * }
 *
 * return reply.send({ received: true, processed: result.processed });
 * ```
 */
export async function processSubscriptionWebhook(
  providerName: ProviderName,
  payload: string,
  signature: string
): Promise<WebhookResult> {
  const provider = getProvider(providerName);

  // 1. Verify signature
  if (!provider.verifyWebhook(payload, signature)) {
    console.warn(`[${providerName}] Invalid webhook signature`);
    return { processed: false, error: "Invalid signature" };
  }

  // 2. Parse event
  const event = provider.parseWebhookEvent(payload);

  // 3. Idempotency check
  const existing = await db.query.subscriptionEvents.findFirst({
    where: eq(subscriptionEvents.eventId, event.eventId),
  });

  if (existing) {
    return { processed: false, reason: "duplicate" };
  }

  // 4. Map to subscription update
  let update = provider.mapEventToSubscriptionUpdate(event);

  if (!update) {
    // Still record the event to prevent reprocessing
    await recordEvent(event.eventId, providerName, event.eventType, event.rawPayload);
    return { processed: false, reason: "ignored_event_type" };
  }

  // 5. Special handling for RevenueCat (needs to lookup by appUserId)
  if (providerName === "revenuecat") {
    const appUserId = getAppUserIdFromEvent(event);
    if (!appUserId) {
      console.warn(`[${providerName}] No appUserId in event`);
      return { processed: false, reason: "no_app_user_id" };
    }

    const existingSub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.revenuecatAppUserId, appUserId),
    });

    if (!existingSub) {
      console.warn(`[${providerName}] No linked subscription for appUserId: ${appUserId}`);
      await recordEvent(event.eventId, providerName, event.eventType, event.rawPayload);
      return { processed: false, reason: "not_linked" };
    }

    // Update with resolved tenantId and userId
    update = {
      ...update,
      tenantId: existingSub.tenantId,
      userId: existingSub.purchasedByUserId ?? undefined,
    };
  }

  // 6. Upsert subscription
  const subscriptionId = await upsertSubscription(providerName, update);

  // 7. Record event for idempotency
  await recordEvent(event.eventId, providerName, event.eventType, event.rawPayload);

  // 8. Track analytics
  const analyticsEvent = provider.getAnalyticsEvent?.(event, update);
  if (analyticsEvent?.userId) {
    trackServerEvent(
      analyticsEvent.name,
      analyticsEvent.userId,
      analyticsEvent.properties as ServerEventProperties
    );
  }

  return { processed: true, subscriptionId };
}

// =============================================================================
// Database Operations
// =============================================================================

/**
 * Record a webhook event for idempotency.
 */
async function recordEvent(
  eventId: string,
  provider: ProviderName,
  eventType: string,
  payload: unknown
): Promise<void> {
  await db.insert(subscriptionEvents).values({
    eventId,
    provider,
    eventType,
    payload: payload as Record<string, unknown>,
    processedAt: new Date(),
  });
}

/**
 * Upsert a subscription based on provider update.
 */
async function upsertSubscription(
  provider: ProviderName,
  update: SubscriptionUpdate
): Promise<string> {
  // Find existing subscription
  let existing;

  if (provider === "polar" && update.providerSubscriptionId) {
    existing = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.polarSubscriptionId, update.providerSubscriptionId),
    });
  } else if (provider === "revenuecat" && update.providerSubscriptionId) {
    existing = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.revenuecatAppUserId, update.providerSubscriptionId),
    });
  }

  // Also check for existing tenant subscription (to handle provider switch)
  if (!existing && update.tenantId) {
    existing = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, update.tenantId),
    });
  }

  if (existing) {
    // Update existing subscription
    const updateData: SubscriptionUpdate_ = {
      status: update.status,
      planId: update.planId,
      provider,
      updatedAt: new Date(),
    };

    if (update.planName) updateData.planName = update.planName;
    if (update.currentPeriodStart) updateData.currentPeriodStart = update.currentPeriodStart;
    if (update.currentPeriodEnd) updateData.currentPeriodEnd = update.currentPeriodEnd;
    if (update.cancelAtPeriodEnd !== undefined)
      updateData.cancelAtPeriodEnd = update.cancelAtPeriodEnd;
    if (update.userId) updateData.purchasedByUserId = update.userId;

    // Provider-specific fields
    if (provider === "polar") {
      if (update.providerSubscriptionId)
        updateData.polarSubscriptionId = update.providerSubscriptionId;
      if (update.providerCustomerId) updateData.polarCustomerId = update.providerCustomerId;
    } else if (provider === "revenuecat") {
      if (update.providerSubscriptionId)
        updateData.revenuecatAppUserId = update.providerSubscriptionId;
      if (update.providerCustomerId)
        updateData.revenuecatOriginalTransactionId = update.providerCustomerId;
    }

    await db.update(subscriptions).set(updateData).where(eq(subscriptions.id, existing.id));

    return existing.id;
  }

  // Create new subscription - tenantId and planId are required
  if (!update.tenantId || !update.planId) {
    throw new Error("Cannot create subscription without tenantId and planId");
  }

  const insertData: SubscriptionInsert = {
    tenantId: update.tenantId,
    purchasedByUserId: update.userId,
    status: update.status,
    planId: update.planId,
    planName: update.planName,
    currentPeriodStart: update.currentPeriodStart,
    currentPeriodEnd: update.currentPeriodEnd,
    cancelAtPeriodEnd: update.cancelAtPeriodEnd ?? false,
    provider,
    // Provider-specific fields
    polarSubscriptionId: provider === "polar" ? update.providerSubscriptionId : undefined,
    polarCustomerId: provider === "polar" ? update.providerCustomerId : undefined,
    revenuecatAppUserId: provider === "revenuecat" ? update.providerSubscriptionId : undefined,
    revenuecatOriginalTransactionId:
      provider === "revenuecat" ? update.providerCustomerId : undefined,
  };

  const [result] = await db
    .insert(subscriptions)
    .values(insertData)
    .returning({ id: subscriptions.id });

  return result.id;
}

// =============================================================================
// Additional Operations
// =============================================================================

/**
 * Update subscription status only (for cancel/revoke events that only need status update).
 */
export async function updateSubscriptionStatus(
  providerSubscriptionId: string,
  provider: ProviderName,
  status: SubscriptionUpdate["status"],
  cancelAtPeriodEnd?: boolean
): Promise<void> {
  const whereClause =
    provider === "polar"
      ? eq(subscriptions.polarSubscriptionId, providerSubscriptionId)
      : eq(subscriptions.revenuecatAppUserId, providerSubscriptionId);

  const updateData: SubscriptionUpdate_ = {
    status,
    updatedAt: new Date(),
  };

  if (cancelAtPeriodEnd !== undefined) {
    updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;
  }

  await db.update(subscriptions).set(updateData).where(whereClause);
}

/**
 * Link a RevenueCat purchase to a tenant.
 * Called from mobile after successful purchase.
 */
export async function linkRevenueCatPurchase(
  tenantId: string,
  userId: string,
  appUserId: string
): Promise<void> {
  // Check for existing subscription
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenantId),
  });

  if (existing) {
    // Update existing with RevenueCat link
    await db
      .update(subscriptions)
      .set({
        revenuecatAppUserId: appUserId,
        purchasedByUserId: userId,
        provider: "revenuecat",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    // Create placeholder - webhook will fill in details
    await db.insert(subscriptions).values({
      tenantId,
      purchasedByUserId: userId,
      provider: "revenuecat",
      revenuecatAppUserId: appUserId,
      status: "active",
      planId: "pending", // Will be updated by webhook
    });
  }
}

/**
 * Get subscription for a tenant.
 */
export async function getSubscription(tenantId: string) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenantId),
  });
}
