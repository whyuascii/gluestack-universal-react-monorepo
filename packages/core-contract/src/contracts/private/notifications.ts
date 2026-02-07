/**
 * Notifications Contract
 *
 * Authenticated endpoints for notification management.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const NotificationSchema = z.object({
  id: z.string(),
  tenantId: z.string().nullable(),
  recipientUserId: z.string(),
  actorUserId: z.string().nullable(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  deepLink: z.string().nullable(),
  data: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.coerce.date(),
  readAt: z.coerce.date().nullable(),
  archivedAt: z.coerce.date().nullable(),
});

export type NotificationResponse = z.infer<typeof NotificationSchema>;

// =============================================================================
// Notifications Contract
// =============================================================================

export const notificationsContract = {
  inbox: oc
    .route({ method: "GET", path: "/private/notifications/inbox" })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().min(1).max(50).optional(),
        })
        .optional()
    )
    .output(
      z.object({
        notifications: z.array(NotificationSchema),
        nextCursor: z.string().nullable(),
        hasMore: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  unreadCount: oc
    .route({ method: "GET", path: "/private/notifications/unread-count" })
    .output(
      z.object({
        count: z.number(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  markAsRead: oc
    .route({ method: "POST", path: "/private/notifications/{notificationId}/read" })
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      NOT_FOUND: {},
    }),

  markAllAsRead: oc
    .route({ method: "POST", path: "/private/notifications/read-all" })
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  archive: oc
    .route({ method: "POST", path: "/private/notifications/{notificationId}/archive" })
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      NOT_FOUND: {},
    }),

  sendTestNotification: oc
    .route({ method: "POST", path: "/private/notifications/test" })
    .output(
      z.object({
        success: z.boolean(),
        messageId: z.string().optional(),
        error: z.string().optional(),
        configured: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      INTERNAL_ERROR: {},
    }),

  // Push Provider Integration
  registerPushToken: oc
    .route({ method: "POST", path: "/private/notifications/push-token" })
    .input(
      z.object({
        token: z.string().min(1),
        platform: z.enum(["ios", "android"]),
        isExpoPushToken: z.boolean().optional(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      BAD_REQUEST: {},
    }),

  removePushToken: oc
    .route({ method: "DELETE", path: "/private/notifications/push-token" })
    .input(
      z.object({
        platform: z.enum(["ios", "android"]),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  getSubscriberHash: oc
    .route({ method: "GET", path: "/private/notifications/subscriber-hash" })
    .output(
      z.object({
        subscriberId: z.string(),
        subscriberHash: z.string(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  getProviderConfig: oc
    .route({ method: "GET", path: "/private/notifications/provider-config" })
    .output(
      z.object({
        provider: z.enum(["novu", "none"]),
        appId: z.string(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),
};

export type NotificationsContract = typeof notificationsContract;
