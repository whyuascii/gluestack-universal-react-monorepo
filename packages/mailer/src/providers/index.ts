/**
 * Mailer Providers Module
 *
 * Public exports for the mailer provider system.
 *
 * Usage:
 * - Use initializeMailerProvider() at app startup
 * - Use getMailerProvider() to get the current provider instance
 * - Direct provider imports (ResendMailerProvider, NoOpMailerProvider) available for testing
 */

// Types
export type {
  MailerProvider,
  MailerProviderConfig,
  ProviderSendEmailParams,
  SendEmailResult,
  MailerProviderType,
} from "./types";

// Factory functions
export {
  initializeMailerProvider,
  getMailerProvider,
  isMailerProviderInitialized,
  resetMailerProvider,
} from "./factory";

// Provider implementations (for direct use if needed)
export { ResendMailerProvider } from "./resend";
export { NoOpMailerProvider } from "./noop";
