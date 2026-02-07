import { initializeMailerProvider, sendTemplateEmail } from "@app/mailer";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";

/**
 * Email send result
 */
export interface EmailResult {
  success: boolean;
  id?: string;
  error?: unknown;
}

/**
 * Mailer service interface
 */
export interface MailerService {
  /**
   * Send verification email
   * Note: This is typically called by Better Auth, but exposed for manual use
   */
  sendVerificationEmail(to: string, name: string, token: string): Promise<EmailResult>;

  /**
   * Send password reset email
   * Note: This is typically called by Better Auth, but exposed for manual use
   */
  sendPasswordResetEmail(to: string, name: string, token: string): Promise<EmailResult>;

  /**
   * Send welcome email after email verification
   */
  sendWelcomeEmail(to: string, name: string): Promise<EmailResult>;

  /**
   * Send tenant invite email
   */
  sendInviteEmail(
    to: string,
    inviterName: string,
    tenantName: string,
    token: string
  ): Promise<EmailResult>;

  /**
   * Send waitlist welcome email
   */
  sendWaitlistEmail(to: string, name: string): Promise<EmailResult>;
}

/**
 * Build a full URL for email links
 */
function buildUrl(fastify: FastifyInstance, path: string, params?: Record<string, string>): string {
  const baseUrl = fastify.config.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

/**
 * Create the mailer service
 */
function createMailerService(fastify: FastifyInstance): MailerService {
  const sendEmail = async (
    template: Parameters<typeof sendTemplateEmail>[0],
    to: string,
    data: Parameters<typeof sendTemplateEmail>[1]["data"],
    locale = "en"
  ): Promise<EmailResult> => {
    try {
      const result = await sendTemplateEmail(template, {
        to,
        data,
        locale,
      });

      fastify.log.info({ emailId: result.id, to, template }, "Email sent successfully");
      return { success: true, id: result.id };
    } catch (error) {
      fastify.log.error({ error, to, template }, "Failed to send email");
      return { success: false, error };
    }
  };

  return {
    async sendVerificationEmail(to, name, token) {
      const verificationLink = buildUrl(fastify, "/verify-email", { token });
      return sendEmail("authVerifyEmail", to, { name, verificationLink });
    },

    async sendPasswordResetEmail(to, name, token) {
      const resetLink = buildUrl(fastify, "/reset-password", { token });
      return sendEmail("authResetPassword", to, { name, resetLink, expiresIn: "1 hour" });
    },

    async sendWelcomeEmail(to, name) {
      const dashboardLink = buildUrl(fastify, "/dashboard");
      return sendEmail("authWelcome", to, { name, dashboardLink });
    },

    async sendInviteEmail(to, inviterName, tenantName, token) {
      const inviteLink = buildUrl(fastify, "/invite/accept", { token });
      return sendEmail("inviteToTenant", to, { inviterName, tenantName, inviteLink });
    },

    async sendWaitlistEmail(to, name) {
      // Unsubscribe link could be added later with a token
      return sendEmail("waitlistWelcome", to, { name });
    },
  };
}

/**
 * Mailer Plugin
 *
 * Initializes the mailer and provides helper methods for sending emails.
 *
 * Usage:
 *   await fastify.mailer.sendWelcomeEmail(user.email, user.name);
 *   await fastify.mailer.sendInviteEmail(email, inviter.name, tenant.name, token);
 */
export default fastifyPlugin(
  async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
    // Initialize mailer with config
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      fastify.log.warn("RESEND_API_KEY not set - emails will fail to send");
    }

    await initializeMailerProvider({
      apiKey: apiKey || "",
      from: {
        name: fastify.config.APP_NAME || "App",
        email: fastify.config.EMAIL_FROM_ADDRESS || "noreply@example.com",
      },
    });

    // Create and decorate with mailer service
    const mailer = createMailerService(fastify);
    fastify.decorate("mailer", mailer);

    fastify.log.info("Mailer plugin initialized");
  },
  { name: "mailer", dependencies: ["config"] }
);
