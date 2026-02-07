/**
 * Email Sending Functions
 */

import { render } from "@react-email/components";
import * as templates from "./templates";
import { t } from "./i18n";
import { getMailerProvider } from "./providers";
import type { EmailTemplate, SendEmailParams, SendTemplateEmailParams } from "./types";

/**
 * Send a raw email
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  const provider = getMailerProvider();
  const config = provider.getConfig();

  const from = params.from || `${config.from.name} <${config.from.email}>`;

  try {
    const result = await provider.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo || config.replyTo,
      tags: params.tags,
    });

    if (!result.success) {
      console.error("[Mailer] Failed to send email:", result.error);
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return { id: result.id || "unknown" };
  } catch (error) {
    console.error("[Mailer] Email send error");
    throw error;
  }
}

/**
 * Send a template email
 */
export async function sendTemplateEmail<T extends EmailTemplate>(
  template: T,
  params: Omit<SendTemplateEmailParams<T>, "template">
): Promise<{ id: string }> {
  const { to, data, locale = "en", tags } = params;

  // Get the template component
  const TemplateComponent = templates[template];
  if (!TemplateComponent) {
    throw new Error(`Template not found: ${template}`);
  }

  // Get translations for the template
  const translations = getTranslationsForTemplate(template, locale, data);

  // Render the template to HTML with translations
  const html = await render(TemplateComponent({ ...data, ...translations } as any));
  const subject = getSubjectForTemplate(template, locale, data);

  // Send the email
  return sendEmail({
    to,
    subject,
    html,
    tags: {
      template,
      locale,
      ...tags,
    },
  });
}

/**
 * Get subject line for a template using i18n
 */
function getSubjectForTemplate(template: EmailTemplate, locale: string, data: any): string {
  switch (template) {
    case "authVerifyEmail":
      return t(locale, "verifyEmail.subject");
    case "authResetPassword":
      return t(locale, "resetPassword.subject");
    case "authWelcome":
      return t(locale, "welcome.subject", { appName: data.appName || "App" });
    case "inviteToTenant":
      return t(locale, "inviteToGroup.subject", { groupName: data.tenantName });
    case "waitlistWelcome":
      return t(locale, "waitlist.subject", { appName: data.appName || "App" });
    case "subscriptionActivated":
      return t(locale, "subscription.activated.subject", { planName: data.planName });
    case "paymentFailed":
      return t(locale, "subscription.paymentFailed.subject");
    case "trialEnding":
      return t(locale, "subscription.trialEnding.subject");
    default:
      return "Message";
  }
}

/**
 * Get translations for a specific template
 */
function getTranslationsForTemplate(
  template: EmailTemplate,
  locale: string,
  data: any
): Record<string, string> {
  const appName = data.appName || "App";

  switch (template) {
    case "authVerifyEmail":
      return {
        i18n_greeting: t(locale, "verifyEmail.greeting", { name: data.name }),
        i18n_body: t(locale, "verifyEmail.body"),
        i18n_cta: t(locale, "verifyEmail.cta"),
        i18n_expiry: t(locale, "verifyEmail.expiry"),
        i18n_ignore: t(locale, "verifyEmail.ignore"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    case "authResetPassword":
      return {
        i18n_greeting: t(locale, "resetPassword.greeting", { name: data.name }),
        i18n_body: t(locale, "resetPassword.body"),
        i18n_cta: t(locale, "resetPassword.cta"),
        i18n_expiry: t(locale, "resetPassword.expiry", { expiresIn: data.expiresIn || "1 hour" }),
        i18n_ignore: t(locale, "resetPassword.ignore"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    case "authWelcome":
      return {
        i18n_greeting: t(locale, "welcome.greeting", { name: data.name }),
        i18n_body: t(locale, "welcome.body", { appName }),
        i18n_cta: t(locale, "welcome.cta"),
        i18n_support: t(locale, "welcome.support"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    case "inviteToTenant":
      return {
        i18n_greeting: t(locale, "inviteToGroup.greeting"),
        i18n_body: t(locale, "inviteToGroup.body", {
          inviterName: data.inviterName,
          groupName: data.tenantName,
          appName,
        }),
        i18n_cta: t(locale, "inviteToGroup.cta"),
        i18n_expiry: t(locale, "inviteToGroup.expiry", { expiresIn: "7 days" }),
        i18n_ignore: t(locale, "inviteToGroup.ignore"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    case "waitlistWelcome":
      return {
        i18n_title: t(locale, "waitlist.title"),
        i18n_greeting: t(locale, "waitlist.greeting", { name: data.name }),
        i18n_body1: t(locale, "waitlist.body1"),
        i18n_body2: t(locale, "waitlist.body2"),
        i18n_body3: t(locale, "waitlist.body3"),
        i18n_unsubscribe: t(locale, "waitlist.unsubscribe"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    case "subscriptionActivated":
      return {
        i18n_greeting: t(locale, "subscription.activated.greeting", { name: data.name }),
        i18n_body: t(locale, "subscription.activated.body", { planName: data.planName }),
        i18n_cta: t(locale, "subscription.activated.cta"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    case "paymentFailed":
      return {
        i18n_greeting: t(locale, "subscription.paymentFailed.greeting", { name: data.name }),
        i18n_body: t(locale, "subscription.paymentFailed.body", { retryDate: data.retryDate }),
        i18n_cta: t(locale, "subscription.paymentFailed.cta"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    case "trialEnding":
      return {
        i18n_greeting: t(locale, "subscription.trialEnding.greeting", { name: data.name }),
        i18n_body: t(locale, "subscription.trialEnding.body", {
          planName: data.planName,
          trialEndDate: data.trialEndDate,
        }),
        i18n_cta: t(locale, "subscription.trialEnding.cta"),
        i18n_footer: t(locale, "common.footer", {
          year: new Date().getFullYear().toString(),
          appName,
        }),
      };
    default:
      return {};
  }
}
