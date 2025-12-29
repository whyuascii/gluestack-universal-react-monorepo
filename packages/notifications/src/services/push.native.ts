import OneSignal from "react-native-onesignal";
import { getMobileConfig } from "../config/onesignal";
import type { PushNotification } from "../types";
import { BasePushNotificationService } from "./push";

/**
 * OneSignal implementation for React Native (iOS & Android)
 */
export class OneSignalNativeService extends BasePushNotificationService {
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const config = getMobileConfig();

    if (!config.appId) {
      console.warn("[OneSignalNativeService] No app ID configured. Skipping initialization.");
      return;
    }

    try {
      // Initialize OneSignal
      // @ts-expect-error - OneSignal native types may differ from package version
      OneSignal.initialize(config.appId);

      // Request permissions on iOS (Android auto-requests)
      await this.requestPermissions();

      this.initialized = true;
      console.log("[OneSignalNativeService] Initialized successfully");
    } catch (error) {
      console.error("[OneSignalNativeService] Initialization failed:", error);
      throw error;
    }
  }

  async send(userId: string, notification: PushNotification): Promise<void> {
    this.ensureInitialized();

    // OneSignal native SDK doesn't send notifications from client
    // This should be done via backend API calling OneSignal REST API
    console.warn(
      "[OneSignalNativeService] Sending notifications should be done from your backend API"
    );
  }

  async sendBatch(
    userIds: string[],
    notification: Omit<PushNotification, "userId">
  ): Promise<void> {
    this.ensureInitialized();
    console.warn("[OneSignalNativeService] Batch sending should be done from your backend API");
  }

  async subscribe(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      // @ts-expect-error - OneSignal native types may differ from package version
      OneSignal.login(userId);
      console.log("[OneSignalNativeService] User subscribed:", userId);
    } catch (error) {
      console.error("[OneSignalNativeService] Failed to subscribe user:", error);
      throw error;
    }
  }

  async unsubscribe(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      // @ts-expect-error - OneSignal native types may differ from package version
      OneSignal.logout();
      console.log("[OneSignalNativeService] User unsubscribed:", userId);
    } catch (error) {
      console.error("[OneSignalNativeService] Failed to unsubscribe user:", error);
      throw error;
    }
  }

  async requestPermissions(): Promise<boolean> {
    this.ensureInitialized();

    try {
      // @ts-expect-error - OneSignal native types may differ from package version
      const permission = await OneSignal.Notifications.requestPermission(true);
      console.log("[OneSignalNativeService] Permission granted:", permission);
      return permission;
    } catch (error) {
      console.error("[OneSignalNativeService] Failed to request permissions:", error);
      return false;
    }
  }

  async isEnabled(): Promise<boolean> {
    this.ensureInitialized();

    try {
      // @ts-expect-error - OneSignal native types may differ from package version
      const hasPermission = await OneSignal.Notifications.getPermissionAsync();
      return hasPermission;
    } catch (error) {
      console.error("[OneSignalNativeService] Failed to check notification status:", error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    this.ensureInitialized();

    try {
      // @ts-expect-error - OneSignal native types may differ from package version
      const playerId = OneSignal.User.pushSubscription.id;
      return playerId ?? null;
    } catch (error) {
      console.error("[OneSignalNativeService] Failed to get push token:", error);
      return null;
    }
  }
}

// Export singleton instance
export const nativePushService = new OneSignalNativeService();
