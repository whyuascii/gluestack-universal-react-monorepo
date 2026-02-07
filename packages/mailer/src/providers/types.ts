/**
 * Mailer Provider Interface
 *
 * Provider-agnostic interface for email services.
 * Implementations: ResendMailerProvider, NoOpMailerProvider
 *
 * Stack:
 * - Resend: Default email delivery provider
 * - React Email: Template rendering (handled by send.ts)
 *
 * NOTE: This is separate from the SendEmailParams in ../types.ts which is
 * higher-level and used by sendTemplateEmail. These types are lower-level
 * and used by provider implementations.
 */

/**
 * Configuration for initializing a mailer provider
 */
export interface MailerProviderConfig {
  apiKey: string;
  from: {
    name: string;
    email: string;
  };
  replyTo?: string;
  /** Provider-specific options */
  options?: Record<string, unknown>;
}

/**
 * Parameters for sending a single email (provider-agnostic)
 *
 * This is the lower-level interface used by provider implementations.
 * Higher-level code should use sendTemplateEmail from send.ts instead.
 */
export interface ProviderSendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Override default from address */
  from?: string;
  /** Override default reply-to */
  replyTo?: string;
  /** Tags for categorization/tracking */
  tags?: Record<string, string>;
}

/**
 * Standardized result from any email provider
 */
export interface SendEmailResult {
  /** Provider-specific message ID, null if failed */
  id: string | null;
  /** Whether the send was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Mailer Provider Interface
 *
 * Abstract interface that all mailer providers must implement.
 * Currently using Resend as the default provider.
 */
export interface MailerProvider {
  /** Provider name for logging/debugging */
  readonly name: string;

  /**
   * Initialize the provider with configuration
   * Should be called once at app startup
   */
  initialize(config: MailerProviderConfig): Promise<void>;

  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean;

  /**
   * Get the current provider configuration
   */
  getConfig(): MailerProviderConfig;

  /**
   * Send a single email
   */
  send(params: ProviderSendEmailParams): Promise<SendEmailResult>;

  /**
   * Send multiple emails in batch
   * Not all providers support this - optional method
   */
  sendBatch?(params: ProviderSendEmailParams[]): Promise<SendEmailResult[]>;
}

/**
 * Supported mailer provider types
 *
 * To add a new provider:
 * 1. Add the type here
 * 2. Create implementation in providers/<name>.ts
 * 3. Add case to factory.ts
 */
export type MailerProviderType = "resend" | "none";
