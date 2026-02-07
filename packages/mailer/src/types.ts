/**
 * Mailer Types
 */

export type EmailTemplate =
  | "authVerifyEmail"
  | "authResetPassword"
  | "authWelcome"
  | "inviteToTenant"
  | "waitlistWelcome"
  | "subscriptionActivated"
  | "paymentFailed"
  | "trialEnding";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface SendTemplateEmailParams<T extends EmailTemplate> {
  template: T;
  to: string;
  data: TemplateData[T];
  locale?: string;
  tags?: Record<string, string>;
}

export interface TemplateData {
  authVerifyEmail: {
    name: string;
    verificationLink: string;
  };
  authResetPassword: {
    name: string;
    resetLink: string;
    expiresIn?: string;
  };
  authWelcome: {
    name: string;
    dashboardLink: string;
  };
  inviteToTenant: {
    inviterName: string;
    tenantName: string;
    inviteLink: string;
  };
  waitlistWelcome: {
    name: string;
    unsubscribeLink?: string;
  };
  subscriptionActivated: {
    name: string;
    planName: string;
    dashboardLink: string;
  };
  paymentFailed: {
    name: string;
    retryDate: string;
    updatePaymentUrl: string;
  };
  trialEnding: {
    name: string;
    planName: string;
    trialEndDate: string;
    upgradeUrl: string;
  };
}

export interface MailerConfig {
  apiKey: string;
  from: {
    name: string;
    email: string;
  };
  replyTo?: string;
}
