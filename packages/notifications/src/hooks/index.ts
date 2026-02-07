/**
 * Notification Hooks
 *
 * TanStack Query hooks for notification data and real-time streaming.
 */

// Query hooks
export {
  useNotificationList,
  useUnreadCount,
  useSubscriberHash,
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  NOTIFICATION_QUERY_KEYS,
  type UseNotificationsOptions,
  type UseUnreadCountOptions,
} from "./queries";

// Real-time streaming
export { useNotificationStream, type NotificationStreamOptions } from "./useNotificationStream";

// API client (for advanced usage)
export { notificationClient, notificationOrpc } from "./client";
