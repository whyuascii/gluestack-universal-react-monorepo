/**
 * Notification Configuration Module
 *
 * Stack:
 * - Novu: In-app notifications + push orchestration
 * - Expo Push: Mobile push via Firebase/APNs
 * - Resend: Email delivery (separate @app/mailer package)
 */

// Novu configuration
export {
  getNovuServerConfig,
  getNovuClientConfig,
  generateSubscriberHash,
  getNovuSecretKey,
  getNovuAppId,
  getNovuBaseUrl,
  isNovuConfigured,
  getTenantTopicKey,
  createSubscriberData,
  NovuWorkflows,
} from "./novu";
export type {
  NovuServerConfig,
  NovuClientConfig,
  NovuEnvironmentConfig,
  NovuSubscriberData,
} from "./novu";
