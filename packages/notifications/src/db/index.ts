/**
 * Database Operations for Notifications
 */

// Inbox operations
export {
  createInboxEntry,
  getInbox,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getBatchedNotifications,
  generateBatchKey,
} from "./inbox";
export type { CreateInboxEntryParams } from "./inbox";

// Preferences
export { getPreferences, upsertPreferences, initializeUserPreferences } from "./preferences";

// Delivery audit
export { logDelivery, getDeliveries } from "./delivery";

// Targets (Novu subscriber + Expo push token mapping + activity tracking)
export {
  getNotificationTarget,
  upsertNotificationTarget,
  updateLastActive,
  isUserActive,
} from "./targets";
