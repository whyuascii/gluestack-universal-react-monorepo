/**
 * Notification Handlers
 *
 * Maps application events to notifications.
 * Each handler decides what notification(s) to send for an event.
 *
 * Uses @app/notifications for:
 * - Inbox persistence
 * - User preference checking
 * - Push notification delivery (Novu + Expo Push)
 * - Smart batching
 * - Topic management for multi-tenant broadcasts
 */

import {
  notify,
  getPushProvider,
  isPushProviderInitialized,
  createTenantTopic,
  addUserToTenant,
  removeUserFromTenant,
  type Notification,
} from "@app/notifications/server";
import { sendTemplateEmail } from "@app/mailer";
import { on, type EventName, type AppEvents } from "./events";
import { notificationStream } from "./notification-stream";

/**
 * Send notification via @app/notifications and publish to SSE stream
 */
async function sendNotification(params: {
  recipientUserId: string;
  actorUserId?: string;
  tenantId?: string;
  type: Parameters<typeof notify>[0]["type"];
  title: string;
  body: string;
  deepLink?: string;
  data?: Record<string, unknown>;
}): Promise<Notification> {
  // Use @app/notifications for full notification flow
  // (inbox, preferences, push, batching)
  const notification = await notify({
    recipientUserId: params.recipientUserId,
    tenantId: params.tenantId || "system", // Use "system" for non-tenant notifications
    type: params.type,
    title: params.title,
    body: params.body,
    deepLink: params.deepLink,
    data: params.data,
    actorUserId: params.actorUserId,
  });

  // Also publish to SSE stream for real-time in-app updates
  notificationStream.publish(params.recipientUserId, notification);

  return notification;
}

/**
 * Handler definitions
 * Each handler receives the event payload and creates appropriate notifications
 */
const handlers: {
  [E in EventName]?: (payload: AppEvents[E]) => Promise<void>;
} = {
  /**
   * When a user verifies their email, send a welcome notification
   */
  "user.verified": async ({ userId, name }) => {
    await sendNotification({
      recipientUserId: userId,
      type: "member_joined",
      title: "Welcome to App!",
      body: `Hi ${name}, your email is verified. Let's get started!`,
      deepLink: "/dashboard",
    });
  },

  /**
   * When a user signs up (before verification)
   * Could send a "check your email" reminder notification
   */
  "user.signed_up": async () => {
    // The email verification flow handles communication
    // No notification needed at this stage
  },

  /**
   * When an invite is sent
   * Notify the inviter that the invite was sent successfully
   */
  "invite.sent": async ({ inviterUserId, email, tenantName, tenantId }) => {
    await sendNotification({
      recipientUserId: inviterUserId,
      tenantId,
      type: "member_invited",
      title: "Invite sent!",
      body: `Your invitation to ${email} for ${tenantName} was sent.`,
      data: { email, tenantName },
    });
  },

  /**
   * When an invite is accepted
   * Notify the inviter that someone joined their group
   */
  "invite.accepted": async ({ userId, userName, tenantId, tenantName, inviterUserId }) => {
    await sendNotification({
      recipientUserId: inviterUserId,
      actorUserId: userId,
      tenantId,
      type: "member_joined",
      title: "New member joined!",
      body: `${userName} accepted your invite and joined ${tenantName}.`,
      deepLink: `/nest/${tenantId}`,
      data: { userName, tenantName },
    });
  },

  /**
   * When a tenant is created
   * Create topic for the tenant and add owner, notify owner with next steps
   */
  "tenant.created": async ({ tenantId, tenantName, ownerUserId }) => {
    // Create tenant topic for push notifications
    if (isPushProviderInitialized()) {
      try {
        const provider = getPushProvider();
        await createTenantTopic(provider, tenantId, tenantName);
        await addUserToTenant(provider, tenantId, ownerUserId);
      } catch {
        // Don't fail the notification - topic creation is optional
      }
    }

    await sendNotification({
      recipientUserId: ownerUserId,
      tenantId,
      type: "settings_changed",
      title: `${tenantName} created!`,
      body: "Your group is ready. Invite your family or friends to get started.",
      deepLink: `/nest/${tenantId}/settings`,
    });
  },

  /**
   * When a new member joins a tenant (generic, not via invite)
   * Add user to tenant topic for push notifications
   */
  "tenant.member_joined": async ({ tenantId, userId }) => {
    // Add user to tenant topic for push notifications
    if (isPushProviderInitialized()) {
      try {
        const provider = getPushProvider();
        await addUserToTenant(provider, tenantId, userId);
      } catch {
        // Don't fail - topic management is optional
      }
    }

    // Could notify all existing members in the future
  },

  /**
   * When a subscription is activated
   * Send email and in-app notification
   */
  "subscription.activated": async ({ tenantId, userId, userEmail, userName, planName }) => {
    // Send email
    try {
      await sendTemplateEmail("subscriptionActivated", {
        to: userEmail,
        data: {
          name: userName,
          planName,
          dashboardLink: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || ""}/dashboard`,
        },
      });
    } catch {
      console.error("[Notification] Failed to send subscription activated email");
    }

    // Send in-app notification
    await sendNotification({
      recipientUserId: userId,
      tenantId,
      type: "settings_changed",
      title: "Subscription Activated!",
      body: `Your ${planName} subscription is now active.`,
      deepLink: "/settings/billing",
    });
  },

  /**
   * When a payment fails
   * Send email and in-app notification to update payment method
   */
  "subscription.payment_failed": async ({
    tenantId,
    userId,
    userEmail,
    userName,
    retryDate,
    updatePaymentUrl,
  }) => {
    // Send email
    try {
      await sendTemplateEmail("paymentFailed", {
        to: userEmail,
        data: {
          name: userName,
          retryDate,
          updatePaymentUrl,
        },
      });
    } catch {
      console.error("[Notification] Failed to send payment failed email");
    }

    // Send in-app notification
    await sendNotification({
      recipientUserId: userId,
      tenantId,
      type: "settings_changed",
      title: "Payment Failed",
      body: "Please update your payment method to continue your subscription.",
      deepLink: "/settings/billing",
    });
  },

  /**
   * When a trial is ending soon
   * Send email reminder to upgrade
   */
  "subscription.trial_ending": async ({
    tenantId,
    userId,
    userEmail,
    userName,
    planName,
    trialEndDate,
    upgradeUrl,
  }) => {
    // Send email
    try {
      await sendTemplateEmail("trialEnding", {
        to: userEmail,
        data: {
          name: userName,
          planName,
          trialEndDate,
          upgradeUrl,
        },
      });
    } catch {
      console.error("[Notification] Failed to send trial ending email");
    }

    // Send in-app notification
    await sendNotification({
      recipientUserId: userId,
      tenantId,
      type: "settings_changed",
      title: "Trial Ending Soon",
      body: `Your free trial ends on ${trialEndDate}. Upgrade to keep premium features.`,
      deepLink: "/settings/billing",
    });
  },

  /**
   * When a subscription is canceled
   * Send in-app notification (email is handled by payment provider)
   */
  "subscription.canceled": async ({ tenantId, userId, userName, planName, canceledAt }) => {
    await sendNotification({
      recipientUserId: userId,
      tenantId,
      type: "settings_changed",
      title: "Subscription Canceled",
      body: `Your ${planName} subscription has been canceled. You'll have access until ${canceledAt}.`,
      deepLink: "/settings/billing",
    });
  },
};

/**
 * Register all notification handlers
 * Called once during app startup
 */
export function registerNotificationHandlers(): void {
  for (const [event, handler] of Object.entries(handlers)) {
    if (handler) {
      on(event as EventName, handler as any);
    }
  }
}
