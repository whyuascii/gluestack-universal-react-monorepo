/**
 * Private Routes
 *
 * All authenticated endpoints organized by domain.
 */
import { db, user, eq } from "@app/database";
import { trackServerEvent } from "@app/analytics/server";
import {
  getTenantEntitlements,
  getProvider,
  getSubscription,
  linkRevenueCatPurchase,
} from "@app/subscriptions/server";

// Actions
import { MeActions } from "../../actions/me";
import { SettingsActions } from "../../actions/settings";
import { TenantActions } from "../../actions/tenants";
import { InviteActions } from "../../actions/invites";
import { TodoActions } from "../../actions/todos";
import { DashboardActions } from "../../actions/dashboard";
import { NotificationActions } from "../../actions/notifications";

// Middleware
import { authMiddleware, tenantMiddleware, createRBACMiddleware } from "../../middleware";

// Utils
import { throwError } from "../../lib/errors";

import { os } from "../_implementer";

// =============================================================================
// User Domain - Me Routes
// =============================================================================

const meGet = os.private.user.me.get.use(authMiddleware).handler(async ({ input, context }) => {
  return MeActions.get(input, context);
});

const meSwitchTenant = os.private.user.me.switchTenant
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return MeActions.switchTenant(input, context);
  });

// =============================================================================
// User Domain - Settings Routes
// =============================================================================

const settingsUpdateLanguagePreference = os.private.user.settings.updateLanguagePreference
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return SettingsActions.updateLanguagePreference(input, context);
  });

const settingsGetNotificationPreferences = os.private.user.settings.getNotificationPreferences
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return SettingsActions.getNotificationPreferences(context);
  });

const settingsUpdateNotificationPreferences = os.private.user.settings.updateNotificationPreferences
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return SettingsActions.updateNotificationPreferences(input, context);
  });

const settingsGetMembers = os.private.user.settings.getMembers
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(async ({ context }) => {
    return SettingsActions.getMembers(context);
  });

const settingsUpdateMemberRole = os.private.user.settings.updateMemberRole
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(createRBACMiddleware("member", "update"))
  .handler(async ({ input, context }) => {
    return SettingsActions.updateMemberRole(input, context);
  });

const settingsRemoveMember = os.private.user.settings.removeMember
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(createRBACMiddleware("member", "delete"))
  .handler(async ({ input, context }) => {
    return SettingsActions.removeMember(input, context);
  });

const settingsUpdateTenant = os.private.user.settings.updateTenant
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(createRBACMiddleware("tenant", "update"))
  .handler(async ({ input, context }) => {
    return SettingsActions.updateTenant(input, context);
  });

const settingsLeaveGroup = os.private.user.settings.leaveGroup
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(async ({ context }) => {
    return SettingsActions.leaveGroup(context);
  });

// =============================================================================
// User Domain - Analytics Routes (consent management)
// =============================================================================

const analyticsUpdateConsent = os.private.user.analytics.updateConsent
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    await db
      .update(user)
      .set({ analyticsConsent: input.consent })
      .where(eq(user.id, context.user.id));

    // Track consent change (meta-event) - always track this regardless of consent
    trackServerEvent("settings.analytics_consent_changed", context.user.id, {
      consent_level: input.consent,
    });

    return { updated: true };
  });

const analyticsGetConsent = os.private.user.analytics.getConsent
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, context.user.id),
      columns: { analyticsConsent: true },
    });

    return { consent: userRecord?.analyticsConsent ?? "anonymous" };
  });

const analyticsAlias = os.private.user.analytics.alias
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, context.user.id),
      columns: { analyticsConsent: true },
    });

    // Only alias if full analytics enabled
    if (userRecord?.analyticsConsent !== "enabled") {
      return { aliased: false };
    }

    // PostHog alias links anonymous ID to user ID
    trackServerEvent("$create_alias", context.user.id, {
      alias: input.anonymousId,
    });

    return { aliased: true };
  });

// =============================================================================
// Workspace Domain - Tenants Routes
// =============================================================================

const tenantsCreate = os.private.workspace.tenants.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return TenantActions.create(input, context);
  });

const tenantsSendInvites = os.private.workspace.tenants.sendInvites
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(createRBACMiddleware("invite", "create"))
  .handler(async ({ input, context }) => {
    return TenantActions.sendInvites(input, context);
  });

// =============================================================================
// Workspace Domain - Invites Routes
// =============================================================================

const invitesGetDetails = os.private.workspace.invites.getDetails.handler(async ({ input }) => {
  return InviteActions.getDetails(input);
});

const invitesAccept = os.private.workspace.invites.accept
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return InviteActions.accept(input, context);
  });

// =============================================================================
// Features Domain - Todos Routes
// =============================================================================

const todosList = os.private.features.todos.list
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return TodoActions.list(context);
  });

const todosGet = os.private.features.todos.get
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return TodoActions.get(input, context);
  });

const todosCreate = os.private.features.todos.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return TodoActions.create(input, context);
  });

const todosUpdate = os.private.features.todos.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return TodoActions.update(input, context);
  });

const todosDelete = os.private.features.todos.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return TodoActions.delete(input, context);
  });

const todosToggle = os.private.features.todos.toggle
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return TodoActions.toggle(input, context);
  });

// =============================================================================
// Features Domain - Dashboard Routes
// =============================================================================

const dashboardGetStats = os.private.features.dashboard.getStats
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(async ({ context }) => {
    return DashboardActions.getStats(context);
  });

const dashboardGetIntegrationStatus = os.private.features.dashboard.getIntegrationStatus
  .use(authMiddleware)
  .handler(async () => {
    return DashboardActions.getIntegrationStatus();
  });

const dashboardSendTestEmail = os.private.features.dashboard.sendTestEmail
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return DashboardActions.sendTestEmail(context);
  });

const dashboardSendTestNotification = os.private.features.dashboard.sendTestNotification
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return DashboardActions.sendTestNotification(context);
  });

const dashboardTrackTestEvent = os.private.features.dashboard.trackTestEvent
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return DashboardActions.trackTestEvent(context);
  });

const dashboardTestSubscription = os.private.features.dashboard.testSubscription
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return DashboardActions.testSubscription(context);
  });

// =============================================================================
// Notifications Domain
// =============================================================================

const notificationsInbox = os.private.notifications.inbox
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return NotificationActions.getInbox(input || {}, context);
  });

const notificationsUnreadCount = os.private.notifications.unreadCount
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return NotificationActions.getUnreadCount(context);
  });

const notificationsMarkAsRead = os.private.notifications.markAsRead
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return NotificationActions.markAsRead(input, context);
  });

const notificationsMarkAllAsRead = os.private.notifications.markAllAsRead
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return NotificationActions.markAllAsRead(context);
  });

const notificationsArchive = os.private.notifications.archive
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return NotificationActions.archive(input, context);
  });

const notificationsSendTestNotification = os.private.notifications.sendTestNotification
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return NotificationActions.sendTestNotification(context);
  });

const notificationsRegisterPushToken = os.private.notifications.registerPushToken
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return NotificationActions.registerPushToken(input, context);
  });

const notificationsRemovePushToken = os.private.notifications.removePushToken
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    return NotificationActions.removePushToken(input, context);
  });

const notificationsGetSubscriberHash = os.private.notifications.getSubscriberHash
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return NotificationActions.getSubscriberHash(context);
  });

const notificationsGetProviderConfig = os.private.notifications.getProviderConfig
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return NotificationActions.getProviderConfig(context);
  });

// =============================================================================
// Billing Domain
// =============================================================================

const billingStatus = os.private.billing.status
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(async ({ context }) => {
    return getTenantEntitlements(context.tenant.id);
  });

const billingCheckout = os.private.billing.checkout
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(async ({ input, context }) => {
    try {
      const provider = getProvider("polar");
      if (!provider.createCheckout) {
        throwError("BAD_REQUEST", "errors.billing.checkoutNotSupported");
      }

      const result = await provider.createCheckout({
        tenantId: context.tenant.id,
        userId: context.user.id,
        planId: input.planId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing?success=true`,
      });

      return { checkoutUrl: result.checkoutUrl };
    } catch (error) {
      console.error("[Billing] Checkout error:", error);
      throwError("BAD_REQUEST", "errors.billing.checkoutFailed");
    }
  });

const billingPortal = os.private.billing.portal
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(async ({ context }) => {
    try {
      // Get subscription to find provider and customerId
      const subscription = await getSubscription(context.tenant.id);
      if (!subscription?.polarCustomerId) {
        throwError("NOT_FOUND", "errors.billing.noSubscription");
      }

      const provider = getProvider("polar");
      if (!provider.createPortalSession) {
        throwError("BAD_REQUEST", "errors.billing.portalNotSupported");
      }

      const result = await provider.createPortalSession(subscription.polarCustomerId);
      return { portalUrl: result.portalUrl };
    } catch (error) {
      console.error("[Billing] Portal error:", error);
      throwError("NOT_FOUND", "errors.billing.noSubscription");
    }
  });

const billingLinkRevenuecat = os.private.billing.linkRevenuecat
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(async ({ input, context }) => {
    try {
      await linkRevenueCatPurchase(context.tenant.id, context.user.id, input.appUserId);
      return { linked: true };
    } catch (error) {
      console.error("[Billing] Link RevenueCat error:", error);
      throwError("BAD_REQUEST", "errors.billing.linkFailed");
    }
  });

// =============================================================================
// Export Combined Private Routes
// =============================================================================

export const privateRoutes = {
  user: {
    me: {
      get: meGet,
      switchTenant: meSwitchTenant,
    },
    settings: {
      updateLanguagePreference: settingsUpdateLanguagePreference,
      getNotificationPreferences: settingsGetNotificationPreferences,
      updateNotificationPreferences: settingsUpdateNotificationPreferences,
      getMembers: settingsGetMembers,
      updateMemberRole: settingsUpdateMemberRole,
      removeMember: settingsRemoveMember,
      updateTenant: settingsUpdateTenant,
      leaveGroup: settingsLeaveGroup,
    },
    analytics: {
      updateConsent: analyticsUpdateConsent,
      getConsent: analyticsGetConsent,
      alias: analyticsAlias,
    },
  },
  workspace: {
    tenants: {
      create: tenantsCreate,
      sendInvites: tenantsSendInvites,
    },
    invites: {
      getDetails: invitesGetDetails,
      accept: invitesAccept,
    },
  },
  features: {
    todos: {
      list: todosList,
      get: todosGet,
      create: todosCreate,
      update: todosUpdate,
      delete: todosDelete,
      toggle: todosToggle,
    },
    dashboard: {
      getStats: dashboardGetStats,
      getIntegrationStatus: dashboardGetIntegrationStatus,
      sendTestEmail: dashboardSendTestEmail,
      sendTestNotification: dashboardSendTestNotification,
      trackTestEvent: dashboardTrackTestEvent,
      testSubscription: dashboardTestSubscription,
    },
  },
  notifications: {
    inbox: notificationsInbox,
    unreadCount: notificationsUnreadCount,
    markAsRead: notificationsMarkAsRead,
    markAllAsRead: notificationsMarkAllAsRead,
    archive: notificationsArchive,
    sendTestNotification: notificationsSendTestNotification,
    registerPushToken: notificationsRegisterPushToken,
    removePushToken: notificationsRemovePushToken,
    getSubscriberHash: notificationsGetSubscriberHash,
    getProviderConfig: notificationsGetProviderConfig,
  },
  billing: {
    status: billingStatus,
    checkout: billingCheckout,
    portal: billingPortal,
    linkRevenuecat: billingLinkRevenuecat,
  },
};
