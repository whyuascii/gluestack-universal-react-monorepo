/**
 * Notification Types
 *
 * Type definitions for all notification-related functionality
 */

/**
 * Notification Categories
 */
export type NotificationCategory = "transactional" | "marketing" | "system";

/**
 * Notification Priority
 */
export type NotificationPriority = "urgent" | "high" | "normal" | "low";

/**
 * Base Notification Interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  data?: Record<string, unknown>;
  createdAt: Date;
  read: boolean;
}

/**
 * Push Notification
 */
export interface PushNotification extends Notification {
  type: "push";
  imageUrl?: string;
  actionUrl?: string;
}

/**
 * In-App Notification
 */
export interface InAppNotification extends Notification {
  type: "in_app";
  icon?: string;
  actionUrl?: string;
}

/**
 * Transactional Notification (Email/SMS)
 * @deprecated Use @app/mailer for transactional emails
 */
export interface TransactionalNotification {
  type: "transactional";
  to: string; // Email or phone number
  subject?: string;
  template: TransactionalTemplate;
  data: Record<string, string>;
}

/**
 * Transactional Templates
 * @deprecated Use @app/mailer for transactional emails
 */
export enum TransactionalTemplate {
  PASSWORD_RESET = "password_reset",
  EMAIL_VERIFICATION = "email_verification",
  WELCOME = "welcome",
  ACCOUNT_DELETED = "account_deleted",
}

/**
 * Marketing Notification
 */
export interface MarketingNotification extends Notification {
  type: "marketing";
  campaign?: string;
  segment?: string[];
}

/**
 * Notification Permission Status
 */
export type NotificationPermission = "granted" | "denied" | "default";

/**
 * Notification State
 */
export interface NotificationState {
  notifications: InAppNotification[];
  unreadCount: number;
  permission: NotificationPermission;
  pushToken?: string;
}
