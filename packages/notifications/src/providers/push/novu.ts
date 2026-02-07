/**
 * Novu Push Provider
 *
 * Implements the PushProvider interface using Novu's API SDK.
 * Handles:
 * - Subscriber management (create, update, delete)
 * - Device credential registration (Expo push tokens)
 * - Push notification delivery
 * - Topic/group management for multi-tenant broadcasts
 */

import type {
  PushProvider,
  PushProviderConfig,
  SubscriberInfo,
  PushCredentials,
  SendPushParams,
  SendPushResult,
} from "./types";
import { getNovuServerConfig, NovuWorkflows, getTenantTopicKey } from "../../config/novu";

/**
 * Novu API client type
 * We use a lazy import to avoid bundling @novu/api when not needed
 */
type NovuClient = InstanceType<typeof import("@novu/api").Novu>;

// Check for development environment (works in both Node.js and bundled environments)
const isDev = process.env.NODE_ENV !== "production";

export class NovuPushProvider implements PushProvider {
  readonly name = "novu";
  private client: NovuClient | null = null;
  private secretKey: string = "";
  private initialized = false;

  async initialize(config: PushProviderConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Dynamic import to avoid bundling @novu/api when not needed
      const { Novu } = await import("@novu/api");

      // Use provided config or fall back to environment config
      const novuConfig = getNovuServerConfig();
      this.secretKey = config.apiKey || novuConfig.secretKey;

      if (!this.secretKey) {
        throw new Error("Novu secret key not configured");
      }

      // Novu SDK requires security object for initialization
      this.client = new Novu({
        security: { secretKey: this.secretKey },
      });
      this.initialized = true;
    } catch (error) {
      console.error("[NovuPushProvider] Failed to initialize");
      throw error;
    }
  }

  /**
   * Make a direct API call to Novu
   * Used to bypass SDK validation issues with Zod 4
   */
  private async novuApiCall(endpoint: string, body: Record<string, unknown>): Promise<any> {
    const response = await fetch(`https://api.novu.co/v1${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${this.secretKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Novu API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private ensureInitialized(): void {
    if (!this.client) {
      throw new Error("[NovuPushProvider] Not initialized. Call initialize() first.");
    }
  }

  // =========================================================================
  // Subscriber Management
  // =========================================================================

  async identifySubscriber(info: SubscriberInfo): Promise<void> {
    this.ensureInitialized();

    try {
      // Use subscribers.create to create or update a subscriber
      await this.client!.subscribers.create({
        subscriberId: info.userId,
        email: info.email,
        firstName: info.firstName,
        lastName: info.lastName,
        phone: info.phone,
        locale: info.locale,
        avatar: info.avatar,
        data: info.data,
      });
    } catch (error: any) {
      // Handle Novu SDK response validation bug - the request succeeds but SDK fails to validate headers
      // Check if the error contains a successful result (status 200/201)
      if (error?.rawValue?.HttpMeta?.Response?.ok && error?.rawValue?.Result?.subscriberId) {
        return;
      }
      console.error("[NovuPushProvider] Failed to identify subscriber");
      throw error;
    }
  }

  async deleteSubscriber(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.client!.subscribers.delete(userId);
    } catch (error) {
      console.error("[NovuPushProvider] Failed to delete subscriber");
      throw error;
    }
  }

  async updateSubscriber(userId: string, info: Partial<SubscriberInfo>): Promise<void> {
    this.ensureInitialized();

    try {
      // Use subscribers.patch to update subscriber fields
      // Note: patch takes DTO first, then subscriberId
      await this.client!.subscribers.patch(
        {
          email: info.email,
          firstName: info.firstName,
          lastName: info.lastName,
          phone: info.phone,
          locale: info.locale,
          avatar: info.avatar,
          data: info.data,
        },
        userId
      );
    } catch (error) {
      console.error("[NovuPushProvider] Failed to update subscriber");
      throw error;
    }
  }

  // =========================================================================
  // Device/Credential Management
  // =========================================================================

  async setCredentials(userId: string, credentials: PushCredentials): Promise<void> {
    this.ensureInitialized();

    try {
      // Determine the provider ID based on platform
      let providerId: string;
      const deviceTokens: string[] = [];

      if (credentials.expoPushToken) {
        // Expo push tokens work with Novu's Expo integration
        providerId = "expo";
        deviceTokens.push(credentials.expoPushToken);
      } else if (credentials.platform === "ios") {
        // Native iOS APNs token
        providerId = "apns";
        deviceTokens.push(credentials.token);
      } else if (credentials.platform === "android") {
        // Native Android FCM token
        providerId = "fcm";
        deviceTokens.push(credentials.token);
      } else if (credentials.platform === "web" && credentials.webPushSubscription) {
        // Web push - handled by Novu's web SDK
        return;
      } else {
        throw new Error(`Unsupported platform: ${credentials.platform}`);
      }

      // Use subscribers.credentials.update to set device tokens
      // Note: update takes DTO first, then subscriberId
      // Cast providerId to the SDK's enum type
      await this.client!.subscribers.credentials.update(
        {
          providerId: providerId as "expo" | "apns" | "fcm",
          credentials: { deviceTokens },
        },
        userId
      );
    } catch (error) {
      console.error("[NovuPushProvider] Failed to set credentials");
      throw error;
    }
  }

  async removeCredentials(userId: string, platform: PushCredentials["platform"]): Promise<void> {
    this.ensureInitialized();

    try {
      // Map platform to Novu provider ID
      const providerIdMap: Record<PushCredentials["platform"], string> = {
        ios: "apns",
        android: "fcm",
        web: "web-push",
      };

      const providerId = providerIdMap[platform];

      // Use subscribers.credentials.delete to remove credentials
      // Note: delete takes subscriberId first, then providerId
      await this.client!.subscribers.credentials.delete(userId, providerId);
    } catch (error) {
      console.error("[NovuPushProvider] Failed to remove credentials");
      throw error;
    }
  }

  // =========================================================================
  // In-App Notification Delivery
  // =========================================================================

  /**
   * Send an in-app notification via Novu
   * This will be delivered to the Novu client SDK (NovuProvider) via WebSocket
   */
  async sendInApp(params: SendPushParams): Promise<SendPushResult> {
    this.ensureInitialized();

    try {
      // Use direct API call to bypass Zod 4 validation issues in the SDK
      const response = await this.novuApiCall("/events/trigger", {
        name: NovuWorkflows.IN_APP_NOTIFICATION,
        to: {
          subscriberId: params.userId,
        },
        payload: {
          title: params.title,
          body: params.body,
          data: params.data || {},
          deepLink: params.deepLink,
          type: params.type,
        },
      });

      return {
        messageId: response?.data?.transactionId || null,
        success: true,
      };
    } catch (error: any) {
      console.error("[NovuPushProvider] Failed to send in-app notification");
      return {
        messageId: null,
        success: false,
        error: error?.message || "Failed to send in-app notification",
      };
    }
  }

  // =========================================================================
  // Push Delivery
  // =========================================================================

  async sendPush(params: SendPushParams): Promise<SendPushResult> {
    this.ensureInitialized();

    try {
      // Use direct API call to bypass Zod 4 validation issues in the SDK
      const response = await this.novuApiCall("/events/trigger", {
        name: NovuWorkflows.PUSH_NOTIFICATION,
        to: {
          subscriberId: params.userId,
        },
        payload: {
          title: params.title,
          body: params.body,
          data: params.data || {},
          deepLink: params.deepLink,
          type: params.type,
          badge: params.badge,
          sound: params.sound,
          imageUrl: params.imageUrl,
        },
      });

      return {
        messageId: response?.data?.transactionId || null,
        success: true,
      };
    } catch (error: any) {
      console.error("[NovuPushProvider] Failed to send push notification");
      return {
        messageId: null,
        success: false,
        error: error?.message || "Failed to send push notification",
      };
    }
  }

  async sendBatchedPush(userId: string, notifications: SendPushParams[]): Promise<SendPushResult> {
    this.ensureInitialized();

    if (notifications.length === 0) {
      return { messageId: null, success: true };
    }

    // For batched notifications, we send a summary
    const count = notifications.length;
    const firstNotification = notifications[0];

    try {
      // Use direct API call to bypass Zod 4 validation issues in the SDK
      const response = await this.novuApiCall("/events/trigger", {
        name: NovuWorkflows.PUSH_NOTIFICATION_BATCHED,
        to: {
          subscriberId: userId,
        },
        payload: {
          count,
          title: count === 1 ? firstNotification.title : `You have ${count} new notifications`,
          body:
            count === 1
              ? firstNotification.body
              : `${firstNotification.title} and ${count - 1} more`,
          type: firstNotification.type,
          // Include all notification data for client processing
          notifications: notifications.map((n) => ({
            title: n.title,
            body: n.body,
            type: n.type,
            deepLink: n.deepLink,
            data: n.data,
          })),
        },
      });

      return {
        messageId: response?.data?.transactionId || null,
        success: true,
      };
    } catch (error: any) {
      console.error("[NovuPushProvider] Failed to send batched push notification");
      return {
        messageId: null,
        success: false,
        error: error?.message || "Failed to send batched push notification",
      };
    }
  }

  // =========================================================================
  // Topic/Group Management (Multi-tenant)
  // =========================================================================

  async addToTopic(topicKey: string, userIds: string[]): Promise<void> {
    this.ensureInitialized();

    if (userIds.length === 0) return;

    try {
      // Use topics.subscribers.assign to add users to topic
      // Note: assign takes DTO first, then topicKey
      await this.client!.topics.subscribers.assign({ subscribers: userIds }, topicKey);
    } catch (error) {
      console.error("[NovuPushProvider] Failed to add users to topic");
      throw error;
    }
  }

  async removeFromTopic(topicKey: string, userIds: string[]): Promise<void> {
    this.ensureInitialized();

    if (userIds.length === 0) return;

    try {
      // Use topics.subscribers.remove to remove users from topic
      // Note: remove takes DTO first, then topicKey
      await this.client!.topics.subscribers.remove({ subscribers: userIds }, topicKey);
    } catch (error) {
      console.error("[NovuPushProvider] Failed to remove users from topic");
      throw error;
    }
  }

  async sendToTopic(
    topicKey: string,
    params: Omit<SendPushParams, "userId">
  ): Promise<SendPushResult> {
    this.ensureInitialized();

    try {
      // Use direct API call to bypass Zod 4 validation issues in the SDK
      const response = await this.novuApiCall("/events/trigger", {
        name: NovuWorkflows.PUSH_NOTIFICATION,
        to: {
          type: "Topic",
          topicKey,
        },
        payload: {
          title: params.title,
          body: params.body,
          data: params.data || {},
          deepLink: params.deepLink,
          type: params.type,
          badge: params.badge,
          sound: params.sound,
          imageUrl: params.imageUrl,
        },
      });

      return {
        messageId: response?.data?.transactionId || null,
        success: true,
      };
    } catch (error: any) {
      console.error("[NovuPushProvider] Failed to send to topic");
      return {
        messageId: null,
        success: false,
        error: error?.message || "Failed to send topic notification",
      };
    }
  }

  async createTopic(topicKey: string, name?: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.client!.topics.create({
        key: topicKey,
        name: name || topicKey,
      });
    } catch (error: any) {
      // Topic might already exist, which is fine
      if (error?.statusCode === 409) {
        return;
      }
      console.error("[NovuPushProvider] Failed to create topic");
      throw error;
    }
  }

  async deleteTopic(topicKey: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.client!.topics.delete(topicKey);
    } catch (error: any) {
      // Topic might not exist, which is fine
      if (error?.statusCode === 404) {
        return;
      }
      console.error("[NovuPushProvider] Failed to delete topic");
      throw error;
    }
  }

  // =========================================================================
  // Preferences
  // =========================================================================

  async syncPreferences(
    userId: string,
    preferences: { pushEnabled?: boolean; channels?: Record<string, boolean> }
  ): Promise<void> {
    this.ensureInitialized();

    try {
      // Novu handles preferences at the workflow channel level
      // We can update the subscriber's data field with preferences
      if (preferences.pushEnabled !== undefined) {
        await this.client!.subscribers.patch(
          {
            data: {
              pushEnabled: preferences.pushEnabled,
              channelPreferences: preferences.channels,
            },
          },
          userId
        );
      }
    } catch (error) {
      console.error("[NovuPushProvider] Failed to sync preferences");
      throw error;
    }
  }
}

/**
 * Convenience function to create a tenant topic
 */
export async function createTenantTopic(
  provider: PushProvider,
  tenantId: string,
  tenantName?: string
): Promise<void> {
  const topicKey = getTenantTopicKey(tenantId);
  await provider.createTopic?.(topicKey, tenantName);
}

/**
 * Convenience function to add a user to a tenant topic
 */
export async function addUserToTenant(
  provider: PushProvider,
  tenantId: string,
  userId: string
): Promise<void> {
  const topicKey = getTenantTopicKey(tenantId);
  await provider.addToTopic(topicKey, [userId]);
}

/**
 * Convenience function to remove a user from a tenant topic
 */
export async function removeUserFromTenant(
  provider: PushProvider,
  tenantId: string,
  userId: string
): Promise<void> {
  const topicKey = getTenantTopicKey(tenantId);
  await provider.removeFromTopic(topicKey, [userId]);
}

/**
 * Convenience function to send a notification to all tenant members
 */
export async function notifyTenant(
  provider: PushProvider,
  tenantId: string,
  params: Omit<SendPushParams, "userId">
): Promise<SendPushResult> {
  const topicKey = getTenantTopicKey(tenantId);
  return provider.sendToTopic(topicKey, params);
}
