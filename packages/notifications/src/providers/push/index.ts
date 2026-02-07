/**
 * Push Provider Module
 *
 * Provider-agnostic interface for push notification services.
 * Uses Novu for in-app notifications and Expo Push (Firebase) for mobile.
 *
 * Stack:
 * - Novu: In-app notifications, push orchestration, subscriber management
 * - Expo Push: Mobile push delivery via Firebase (FCM) and APNs
 * - Resend: Email delivery (separate @app/mailer package)
 *
 * Usage:
 * ```typescript
 * // At app startup
 * import { initializePushProvider } from "@app/notifications/server";
 * await initializePushProvider();
 *
 * // When sending notifications
 * import { getPushProvider } from "@app/notifications/server";
 * const provider = getPushProvider();
 * await provider.sendPush({ userId, title, body });
 * ```
 */

// Types
export type {
  PushProvider,
  PushProviderConfig,
  PushProviderType,
  SubscriberInfo,
  PushCredentials,
  SendPushParams,
  SendPushResult,
} from "./types";

// Factory (main API)
export {
  getProviderType,
  initializePushProvider,
  getPushProvider,
  isPushProviderInitialized,
  resetPushProvider,
} from "./factory";

// Providers (for direct use if needed)
export { NoOpPushProvider } from "./noop";

// Note: NovuPushProvider is dynamically imported by the factory
// to avoid loading the SDK when not in use.
// Use the factory functions instead of importing providers directly.

// Convenience functions for multi-tenant support
export { createTenantTopic, addUserToTenant, removeUserFromTenant, notifyTenant } from "./novu";

// Re-export Novu config utilities
export {
  getNovuServerConfig,
  getNovuClientConfig,
  generateSubscriberHash,
  isNovuConfigured,
  getNovuAppId,
  getTenantTopicKey,
  createSubscriberData,
  NovuWorkflows,
} from "../../config/novu";
export type { NovuServerConfig, NovuClientConfig, NovuSubscriberData } from "../../config/novu";
