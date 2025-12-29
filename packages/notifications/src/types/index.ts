/**
 * Core notification types for the notifications package
 */

export type NotificationType = "transactional" | "marketing" | "in-app" | "system";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  data?: Record<string, unknown>;
  createdAt: Date;
  read?: boolean;
  actionUrl?: string;
}

export interface PushNotification extends Notification {
  userId: string;
  sound?: string;
  badge?: number;
  image?: string;
}

export interface InAppNotification extends Notification {
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export interface TransactionalNotification {
  to: string; // User ID or email
  template: "password-reset" | "email-verification" | "account-created" | "login-alert";
  data: Record<string, string>;
}

export interface MarketingNotification {
  segment?: string[]; // User segments to target
  title: string;
  message: string;
  actionUrl?: string;
  image?: string;
  scheduledFor?: Date;
}

/**
 * Provider abstraction interface - allows swapping notification providers
 */
export interface PushNotificationService {
  /**
   * Initialize the push notification service
   */
  initialize(): Promise<void>;

  /**
   * Send a push notification to a specific user
   */
  send(userId: string, notification: PushNotification): Promise<void>;

  /**
   * Send a push notification to multiple users
   */
  sendBatch(userIds: string[], notification: Omit<PushNotification, "userId">): Promise<void>;

  /**
   * Subscribe a user to push notifications
   */
  subscribe(userId: string): Promise<void>;

  /**
   * Unsubscribe a user from push notifications
   */
  unsubscribe(userId: string): Promise<void>;

  /**
   * Request notification permissions (mobile)
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Check if notifications are enabled
   */
  isEnabled(): Promise<boolean>;

  /**
   * Get the device's push token
   */
  getPushToken(): Promise<string | null>;
}

export interface NotificationState {
  inAppNotifications: InAppNotification[];
  unreadCount: number;
  isPermissionGranted: boolean;
  isPushEnabled: boolean;
}

export interface NotificationActions {
  addNotification: (notification: InAppNotification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  setPermissionGranted: (granted: boolean) => void;
  setPushEnabled: (enabled: boolean) => void;
}

export type NotificationStore = NotificationState & NotificationActions;
