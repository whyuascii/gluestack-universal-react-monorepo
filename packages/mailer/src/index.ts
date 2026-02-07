/**
 * Mailer Package
 *
 * Transactional email service using pluggable providers (default: Resend) and React Email
 *
 * ## Usage
 *
 * ```typescript
 * import { sendTemplateEmail, initializeMailerProvider } from '@app/mailer';
 *
 * // Initialize (optional - auto-initializes on first use)
 * initializeMailerProvider();
 *
 * // Send a template email
 * await sendTemplateEmail('authVerifyEmail', {
 *   to: 'user@example.com',
 *   data: {
 *     name: 'John',
 *     verificationLink: 'https://...'
 *   }
 * });
 * ```
 *
 * ## Environment Variables
 *
 * - `RESEND_API_KEY` - Resend API key (required for Resend provider)
 * - `EMAIL_FROM_NAME` - From name (default: "My App")
 * - `EMAIL_FROM_ADDRESS` - From email (default: "noreply@example.com")
 * - `EMAIL_REPLY_TO` - Reply-to email (optional)
 */

// Provider initialization (new API)
export {
  initializeMailerProvider,
  getMailerProvider,
  isMailerProviderInitialized,
  resetMailerProvider,
} from "./providers";

// Provider implementations (for direct use if needed)
export { ResendMailerProvider, NoOpMailerProvider } from "./providers";

// Provider types
export type {
  MailerProvider,
  MailerProviderConfig,
  ProviderSendEmailParams,
  SendEmailResult,
  MailerProviderType,
} from "./providers";

// Sending
export { sendEmail, sendTemplateEmail } from "./send";

// Types
export type {
  EmailTemplate,
  SendEmailParams,
  SendTemplateEmailParams,
  TemplateData,
  MailerConfig,
} from "./types";

// Templates (for direct use if needed)
export * as templates from "./templates";

// ============================================================================
// DEPRECATED EXPORTS - For backward compatibility
// These will be removed in a future major version
// ============================================================================

import { initializeMailerProvider, getMailerProvider } from "./providers";
import type { MailerConfig } from "./types";

/**
 * @deprecated Use `initializeMailerProvider()` instead.
 * This function will be removed in a future major version.
 *
 * @example
 * // Old (deprecated):
 * initializeMailer({ apiKey: '...', from: { name: 'App', email: 'app@example.com' } });
 *
 * // New:
 * initializeMailerProvider({ apiKey: '...', from: { name: 'App', email: 'app@example.com' } });
 */
export function initializeMailer(config?: MailerConfig): void {
  console.warn(
    "[Mailer] initializeMailer() is deprecated. Use initializeMailerProvider() instead."
  );
  initializeMailerProvider(config);
}

/**
 * @deprecated Use `getMailerProvider().getConfig()` instead.
 * This function will be removed in a future major version.
 *
 * @example
 * // Old (deprecated):
 * const config = getMailerConfig();
 *
 * // New:
 * const config = getMailerProvider().getConfig();
 */
export function getMailerConfig(): MailerConfig {
  console.warn(
    "[Mailer] getMailerConfig() is deprecated. Use getMailerProvider().getConfig() instead."
  );
  const provider = getMailerProvider();
  const providerConfig = provider.getConfig();
  return {
    apiKey: providerConfig.apiKey,
    from: providerConfig.from,
    replyTo: providerConfig.replyTo,
  };
}
