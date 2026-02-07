/**
 * No-Op Push Provider
 *
 * A provider that does nothing - used for:
 * - Testing/development without a push service
 * - Environments where push is disabled
 * - Fallback when no provider is configured
 */

import type {
  PushProvider,
  PushProviderConfig,
  SubscriberInfo,
  PushCredentials,
  SendPushParams,
  SendPushResult,
} from "./types";

// Check for development environment
const isDev = process.env.NODE_ENV !== "production";

export class NoOpPushProvider implements PushProvider {
  readonly name = "noop";
  private initialized = false;

  async initialize(_config: PushProviderConfig): Promise<void> {
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Subscriber Management
  async identifySubscriber(_info: SubscriberInfo): Promise<void> {
    // No-op
  }

  async deleteSubscriber(_userId: string): Promise<void> {
    // No-op
  }

  async updateSubscriber(_userId: string, _info: Partial<SubscriberInfo>): Promise<void> {
    // No-op
  }

  // Device Management
  async setCredentials(_userId: string, _credentials: PushCredentials): Promise<void> {
    // No-op
  }

  async removeCredentials(_userId: string, _platform: PushCredentials["platform"]): Promise<void> {
    // No-op
  }

  // In-App Notification Delivery
  async sendInApp(params: SendPushParams): Promise<SendPushResult> {
    if (isDev) {
      console.log(`[NoOpPushProvider] sendInApp: "${params.title}"`);
    }
    return { messageId: `noop_inapp_${Date.now()}`, success: true };
  }

  // Push Delivery
  async sendPush(params: SendPushParams): Promise<SendPushResult> {
    if (isDev) {
      console.log(`[NoOpPushProvider] sendPush: "${params.title}"`);
    }
    return { messageId: `noop_${Date.now()}`, success: true };
  }

  async sendBatchedPush(_userId: string, notifications: SendPushParams[]): Promise<SendPushResult> {
    if (isDev) {
      console.log(`[NoOpPushProvider] sendBatchedPush: ${notifications.length} notifications`);
    }
    return { messageId: `noop_batch_${Date.now()}`, success: true };
  }

  // Topic Management
  async addToTopic(_topicKey: string, _userIds: string[]): Promise<void> {
    // No-op
  }

  async removeFromTopic(_topicKey: string, _userIds: string[]): Promise<void> {
    // No-op
  }

  async sendToTopic(
    _topicKey: string,
    params: Omit<SendPushParams, "userId">
  ): Promise<SendPushResult> {
    if (isDev) {
      console.log(`[NoOpPushProvider] sendToTopic: "${params.title}"`);
    }
    return { messageId: `noop_topic_${Date.now()}`, success: true };
  }

  async createTopic(_topicKey: string, _name?: string): Promise<void> {
    // No-op
  }

  async deleteTopic(_topicKey: string): Promise<void> {
    // No-op
  }

  async syncPreferences(
    _userId: string,
    _preferences: { pushEnabled?: boolean; channels?: Record<string, boolean> }
  ): Promise<void> {
    // No-op
  }
}
