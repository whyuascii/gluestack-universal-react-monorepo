import type { PushNotification, PushNotificationService } from "../types";

/**
 * Abstract push notification service interface
 * Platform-specific implementations will extend this
 */
export abstract class BasePushNotificationService implements PushNotificationService {
  protected initialized = false;

  abstract initialize(): Promise<void>;
  abstract send(userId: string, notification: PushNotification): Promise<void>;
  abstract sendBatch(
    userIds: string[],
    notification: Omit<PushNotification, "userId">
  ): Promise<void>;
  abstract subscribe(userId: string): Promise<void>;
  abstract unsubscribe(userId: string): Promise<void>;
  abstract requestPermissions(): Promise<boolean>;
  abstract isEnabled(): Promise<boolean>;
  abstract getPushToken(): Promise<string | null>;

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("Push notification service not initialized. Call initialize() first.");
    }
  }
}

/**
 * Mock implementation for development/testing
 */
export class MockPushNotificationService extends BasePushNotificationService {
  async initialize(): Promise<void> {
    console.log("[MockPushService] Initialized");
    this.initialized = true;
  }

  async send(userId: string, notification: PushNotification): Promise<void> {
    console.log("[MockPushService] Sending notification to user:", userId, notification);
  }

  async sendBatch(
    userIds: string[],
    notification: Omit<PushNotification, "userId">
  ): Promise<void> {
    console.log("[MockPushService] Sending batch notification to users:", userIds, notification);
  }

  async subscribe(userId: string): Promise<void> {
    console.log("[MockPushService] Subscribing user:", userId);
  }

  async unsubscribe(userId: string): Promise<void> {
    console.log("[MockPushService] Unsubscribing user:", userId);
  }

  async requestPermissions(): Promise<boolean> {
    console.log("[MockPushService] Requesting permissions");
    return true;
  }

  async isEnabled(): Promise<boolean> {
    return true;
  }

  async getPushToken(): Promise<string | null> {
    return "mock-push-token";
  }
}
