/**
 * Push Provider Interface
 *
 * Provider-agnostic interface for push notification services.
 * Implementations: NovuPushProvider, NoOpPushProvider
 *
 * Stack:
 * - Novu: In-app notifications + push orchestration
 * - Firebase/Expo Push: Mobile push delivery
 * - Resend: Email delivery (separate mailer package)
 */

/**
 * Configuration for initializing a push provider
 */
export interface PushProviderConfig {
  apiKey: string;
  appId: string;
  environment?: "production" | "development";
  baseUrl?: string; // For self-hosted or EU endpoints
}

/**
 * Subscriber information for identification
 */
export interface SubscriberInfo {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  locale?: string;
  avatar?: string;
  data?: Record<string, unknown>;
}

/**
 * Device credentials for push delivery
 */
/**
 * Web Push subscription data (from PushSubscription.toJSON())
 */
export interface WebPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

export interface PushCredentials {
  platform: "ios" | "android" | "web";
  token: string;
  /** Expo push token for mobile apps */
  expoPushToken?: string;
  /** Web push subscription for browsers */
  webPushSubscription?: WebPushSubscription;
}

/**
 * Parameters for sending a push notification
 */
export interface SendPushParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  deepLink?: string;
  /** Notification type for categorization */
  type?: string;
  /** iOS badge count */
  badge?: number;
  /** Sound to play */
  sound?: string;
  /** Image URL for rich notifications */
  imageUrl?: string;
  /** Time-to-live in seconds */
  ttl?: number;
}

/**
 * Result from sending a push notification
 */
export interface SendPushResult {
  messageId: string | null;
  success: boolean;
  error?: string;
}

/**
 * Push Provider Interface
 *
 * Abstract interface that all push providers must implement.
 * Currently using Novu with Expo push integration for mobile.
 */
export interface PushProvider {
  /** Provider name for logging/debugging */
  readonly name: string;

  /**
   * Initialize the provider with configuration
   * Should be called once at app startup
   */
  initialize(config: PushProviderConfig): Promise<void>;

  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean;

  // =========================================================================
  // Subscriber Management
  // =========================================================================

  /**
   * Identify/create a subscriber in the push service
   * Creates or updates subscriber profile
   */
  identifySubscriber(info: SubscriberInfo): Promise<void>;

  /**
   * Delete a subscriber from the push service
   * Called when user account is deleted
   */
  deleteSubscriber(userId: string): Promise<void>;

  /**
   * Update subscriber attributes
   */
  updateSubscriber(userId: string, info: Partial<SubscriberInfo>): Promise<void>;

  // =========================================================================
  // Device/Credential Management
  // =========================================================================

  /**
   * Register device credentials for push delivery
   * Registers Expo token, FCM token, or web push subscription
   */
  setCredentials(userId: string, credentials: PushCredentials): Promise<void>;

  /**
   * Remove device credentials
   * Called when user logs out or disables push
   */
  removeCredentials(userId: string, platform: PushCredentials["platform"]): Promise<void>;

  // =========================================================================
  // In-App Notification Delivery
  // =========================================================================

  /**
   * Send an in-app notification to a user
   * Delivered via Novu client SDK (NovuProvider) through WebSocket
   */
  sendInApp(params: SendPushParams): Promise<SendPushResult>;

  // =========================================================================
  // Push Delivery
  // =========================================================================

  /**
   * Send a single push notification to a user
   */
  sendPush(params: SendPushParams): Promise<SendPushResult>;

  /**
   * Send multiple notifications to a user (batched)
   * Provider may combine into a single push
   */
  sendBatchedPush(userId: string, notifications: SendPushParams[]): Promise<SendPushResult>;

  // =========================================================================
  // Topic/Group Management (for multi-tenant)
  // =========================================================================

  /**
   * Add users to a topic for broadcast notifications
   * Topics are used for tenant-scoped messaging
   */
  addToTopic(topicKey: string, userIds: string[]): Promise<void>;

  /**
   * Remove users from a topic
   */
  removeFromTopic(topicKey: string, userIds: string[]): Promise<void>;

  /**
   * Send notification to all subscribers in a topic
   */
  sendToTopic(topicKey: string, params: Omit<SendPushParams, "userId">): Promise<SendPushResult>;

  /**
   * Create a topic if it doesn't exist
   */
  createTopic?(topicKey: string, name?: string): Promise<void>;

  /**
   * Delete a topic
   */
  deleteTopic?(topicKey: string): Promise<void>;

  // =========================================================================
  // Preferences (optional - some providers handle this)
  // =========================================================================

  /**
   * Update user notification preferences in the provider
   * Note: We primarily use our own database for preferences,
   * but some providers need to be synced
   */
  syncPreferences?(
    userId: string,
    preferences: {
      pushEnabled?: boolean;
      channels?: Record<string, boolean>;
    }
  ): Promise<void>;
}

/**
 * Provider type enum for factory
 */
export type PushProviderType = "novu" | "none";
