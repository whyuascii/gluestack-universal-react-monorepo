/**
 * Server-side Notification API
 *
 * Use this in backend services (API, workers, etc.)
 * Excludes React components and hooks.
 *
 * @example
 * // Initialize push provider at app startup
 * import { initializePushProvider } from "@app/notifications/server";
 * await initializePushProvider();
 *
 * // Send notifications
 * import { getPushProvider, notify } from "@app/notifications/server";
 * const provider = getPushProvider();
 * await provider.sendPush({ userId, title, body });
 */

// Core API
export { notify, notifyMany } from "./notify";
export type { NotifyParams } from "./notify";

// Database operations
export {
  // Inbox
  getInbox,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  createInboxEntry,
  generateBatchKey,
  getBatchedNotifications,
  // Preferences
  getPreferences,
  upsertPreferences,
  initializeUserPreferences,
  // Targets
  updateLastActive,
  isUserActive,
  getNotificationTarget,
  upsertNotificationTarget,
  // Delivery
  logDelivery,
} from "./db";

// Push Provider System (new)
export {
  // Factory functions
  initializePushProvider,
  getPushProvider,
  isPushProviderInitialized,
  getProviderType,
  resetPushProvider,
  // Multi-tenant helpers
  createTenantTopic,
  addUserToTenant,
  removeUserFromTenant,
  notifyTenant,
  // Novu config
  getNovuServerConfig,
  getNovuClientConfig,
  generateSubscriberHash,
  isNovuConfigured,
  getNovuAppId,
  getTenantTopicKey,
  createSubscriberData,
  NovuWorkflows,
} from "./providers/push";

// Push Provider Types
export type {
  PushProvider,
  PushProviderConfig,
  PushProviderType,
  SubscriberInfo,
  PushCredentials,
  SendPushParams,
  SendPushResult,
  NovuServerConfig,
  NovuClientConfig,
  NovuSubscriberData,
} from "./providers/push";

// Re-export types from database
export type {
  Notification,
  NotificationType,
  NotificationPreferences,
  NotificationTarget,
  NotificationDelivery,
  DeliveryChannel,
  DeliveryStatus,
} from "@app/database";

// Novu Workflows (code-first definitions)
export {
  // All workflows array
  allWorkflows,
  workflowMap,
  workflowIds,
  // Individual workflows
  pushNotificationWorkflow,
  inAppNotificationWorkflow,
  welcomeWorkflow,
  inviteReceivedWorkflow,
  memberJoinedWorkflow,
  todoAssignedWorkflow,
  todoNudgeWorkflow,
  todoCompletedWorkflow,
  eventCreatedWorkflow,
  eventReminderWorkflow,
  eventChangedWorkflow,
  limitAlertWorkflow,
  achievementWorkflow,
  surveyCreatedWorkflow,
  weeklySummaryWorkflow,
  reminderWorkflow,
  directMessageWorkflow,
  milestoneWorkflow,
  kudosSentWorkflow,
  settingsChangedWorkflow,
} from "./workflows";

export type { WorkflowId } from "./workflows";

// Workflow server integration
export {
  createNovuBridgePlugin,
  createNovuHandler,
  syncWorkflows,
  getWorkflowStats,
} from "./workflows/serve";

export type { NovuBridgeOptions } from "./workflows/serve";
