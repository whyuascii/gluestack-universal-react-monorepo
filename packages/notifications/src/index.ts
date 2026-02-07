/**
 * @app/notifications
 *
 * Cross-platform notification management with unified components and hooks.
 *
 * - **UI Components:** NotificationBell, NotificationInbox, NotificationList, NotificationItem
 * - **Client Hooks:** useNotificationList, useUnreadCount, useNotificationStream
 * - **Providers:** NotificationProvider (web/native)
 *
 * For server-side utilities (notify, workflows, db), use:
 * ```typescript
 * import { notify, getPushProvider } from "@app/notifications/server";
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// UI Components
// =============================================================================

export {
  // Components
  NotificationBell,
  NotificationItem,
  NotificationList,
  NotificationInbox,
  // Types
  type AppNotification,
  type NotificationBellProps,
  type NotificationItemProps,
  type NotificationListProps,
  type NotificationInboxProps,
  type NotificationIconType,
  // Utilities
  getNotificationIcon,
  formatRelativeTime,
} from "./components/ui";

// =============================================================================
// Client Hooks (TanStack Query)
// =============================================================================

export {
  // Query hooks
  useNotificationList,
  useUnreadCount,
  useSubscriberHash,
  // Mutation hooks
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  // Real-time
  useNotificationStream,
  // Keys
  NOTIFICATION_QUERY_KEYS,
  // Types
  type UseNotificationsOptions,
  type UseUnreadCountOptions,
  type NotificationStreamOptions,
} from "./hooks";

// =============================================================================
// Providers
// =============================================================================

export { NotificationProvider, useNotificationContext } from "./providers/NotificationProvider.web";
export type { NotificationProviderProps } from "./providers/NotificationProvider";

// =============================================================================
// Store
// =============================================================================

export { useNotificationStore } from "./stores/notificationStore";
export type { NotificationStoreState, InAppMessage } from "./stores/notificationStore";

// =============================================================================
// Legacy Exports (for backwards compatibility)
// =============================================================================

// Old hooks from this package (may overlap with new ones)
export { useNotifications } from "./hooks/useNotifications";
export { usePushNotifications } from "./hooks/usePushNotifications";
export { useInAppNotifications } from "./hooks/useInAppNotifications";

// Old components
export { NotificationToast } from "./components/NotificationToast";
export type { NotificationToastProps } from "./components/NotificationToast";

// =============================================================================
// Configuration
// =============================================================================

export { getNovuClientConfig, getNovuAppId, isNovuConfigured } from "./providers/push";

// =============================================================================
// Services (client-side)
// =============================================================================

export { pushNotificationService } from "./services/push";
export type { PushNotificationService } from "./services/push";

export { inAppNotificationService } from "./services/inApp";
export type { InAppNotificationService } from "./services/inApp";

export { marketingNotificationService, sendAnnouncement } from "./services/marketing";
export type { MarketingNotificationService } from "./services/marketing";

// =============================================================================
// Database Types (re-exported from @app/database)
// =============================================================================

export type {
  Notification,
  NotificationType,
  NotificationPreferences,
  NotificationTarget,
  NotificationDelivery,
  DeliveryChannel,
  DeliveryStatus,
} from "@app/database";
