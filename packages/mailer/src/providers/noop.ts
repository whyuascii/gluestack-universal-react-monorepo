import type {
  MailerProvider,
  MailerProviderConfig,
  ProviderSendEmailParams,
  SendEmailResult,
} from "./types";

/**
 * NoOp Mailer Provider
 *
 * A no-operation mailer provider for development and testing.
 * - Logs email details in non-production environments for debugging
 * - Always returns success with a fake ID
 * - Used when no API key is configured or for testing
 */
export class NoOpMailerProvider implements MailerProvider {
  readonly name = "noop";
  private config: MailerProviderConfig | null = null;
  private initialized = false;

  async initialize(config: MailerProviderConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
    console.warn("[Mailer:NoOp] Initialized - emails will be logged but not sent");
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): MailerProviderConfig {
    if (!this.config) {
      throw new Error("NoOpMailerProvider not initialized. Call initialize() first.");
    }
    return this.config;
  }

  async send(params: ProviderSendEmailParams): Promise<SendEmailResult> {
    // Log email details in development for debugging
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Mailer:NoOp] Would send email:", {
        to: params.to,
        subject: params.subject,
        from:
          params.from ||
          (this.config ? `${this.config.from.name} <${this.config.from.email}>` : "unknown"),
        hasHtml: !!params.html,
        hasText: !!params.text,
        tags: params.tags,
      });
    }

    // Generate fake ID for consistency
    const fakeId = `noop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { id: fakeId, success: true };
  }

  async sendBatch(params: ProviderSendEmailParams[]): Promise<SendEmailResult[]> {
    return Promise.all(params.map((p) => this.send(p)));
  }
}
