/**
 * Resend Mailer Provider
 *
 * Implementation of MailerProvider using Resend for email delivery.
 * This is the default provider when RESEND_API_KEY is configured.
 *
 * @see https://resend.com/docs/send-with-nodejs
 */

import { Resend } from "resend";
import type {
  MailerProvider,
  MailerProviderConfig,
  ProviderSendEmailParams,
  SendEmailResult,
} from "./types";

/**
 * Resend email provider implementation
 *
 * Features:
 * - Single email sending via send()
 * - Batch sending via sendBatch()
 * - Tag conversion from Record to Resend's Array format
 * - Graceful error handling with SendEmailResult
 */
export class ResendMailerProvider implements MailerProvider {
  readonly name = "resend";
  private client: Resend | null = null;
  private config: MailerProviderConfig | null = null;

  /**
   * Initialize the provider with configuration
   *
   * @param config - Provider configuration including API key and from address
   */
  async initialize(config: MailerProviderConfig): Promise<void> {
    if (!config.apiKey) {
      console.warn("[Mailer:Resend] API key not provided. Email sending will fail.");
    }
    this.client = new Resend(config.apiKey);
    this.config = config;
  }

  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }

  /**
   * Get the current provider configuration
   *
   * @throws Error if provider is not initialized
   */
  getConfig(): MailerProviderConfig {
    if (!this.config) {
      throw new Error("ResendMailerProvider not initialized. Call initialize() first.");
    }
    return this.config;
  }

  /**
   * Send a single email
   *
   * @param params - Email parameters
   * @returns SendEmailResult with success status and optional error
   */
  async send(params: ProviderSendEmailParams): Promise<SendEmailResult> {
    if (!this.client || !this.config) {
      return { id: null, success: false, error: "Provider not initialized" };
    }

    const from = params.from || `${this.config.from.name} <${this.config.from.email}>`;

    try {
      const { data, error } = await this.client.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo || this.config.replyTo,
        // Convert tags from Record<string, string> to Resend's Array format
        tags: params.tags
          ? Object.entries(params.tags).map(([name, value]) => ({ name, value }))
          : undefined,
      });

      if (error) {
        console.error("[Mailer:Resend] Failed to send email:", error.message);
        return { id: null, success: false, error: error.message };
      }

      return { id: data?.id || null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Mailer:Resend] Email send error:", errorMessage);
      return { id: null, success: false, error: errorMessage };
    }
  }

  /**
   * Send multiple emails in batch
   *
   * Note: For simplicity, this sends emails sequentially.
   * Resend has a batch API that could be used for better performance
   * with high volumes.
   *
   * @param params - Array of email parameters
   * @returns Array of SendEmailResult for each email
   */
  async sendBatch(params: ProviderSendEmailParams[]): Promise<SendEmailResult[]> {
    return Promise.all(params.map((p) => this.send(p)));
  }
}
