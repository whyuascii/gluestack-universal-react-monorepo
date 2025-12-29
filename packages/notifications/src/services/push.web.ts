import OneSignal from "react-onesignal";
import { getWebConfig } from "../config/onesignal";
import type { PushNotification } from "../types";
import { BasePushNotificationService } from "./push";

/**
 * OneSignal implementation for web platform
 */
export class OneSignalWebService extends BasePushNotificationService {
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const config = getWebConfig();

    if (!config.appId) {
      console.warn("[OneSignalWebService] No app ID configured. Skipping initialization.");
      return;
    }

    try {
      await OneSignal.init({
        appId: config.appId,
        allowLocalhostAsSecureOrigin: config.allowLocalhostAsSecureOrigin,
        // @ts-expect-error - OneSignal web types may differ from package version
        notifyButton: config.notifyButton,
      });

      this.initialized = true;
      console.log("[OneSignalWebService] Initialized successfully");
    } catch (error) {
      console.error("[OneSignalWebService] Initialization failed:", error);
      throw error;
    }
  }

  async send(userId: string, notification: PushNotification): Promise<void> {
    this.ensureInitialized();

    try {
      // OneSignal web SDK doesn't directly send notifications from client
      // This would typically be done via your backend API calling OneSignal REST API
      console.warn(
        "[OneSignalWebService] Sending notifications should be done from your backend API"
      );
    } catch (error) {
      console.error("[OneSignalWebService] Failed to send notification:", error);
      throw error;
    }
  }

  async sendBatch(
    userIds: string[],
    notification: Omit<PushNotification, "userId">
  ): Promise<void> {
    this.ensureInitialized();
    console.warn("[OneSignalWebService] Batch sending should be done from your backend API");
  }

  async subscribe(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      await OneSignal.login(userId);
      console.log("[OneSignalWebService] User subscribed:", userId);
    } catch (error) {
      console.error("[OneSignalWebService] Failed to subscribe user:", error);
      throw error;
    }
  }

  async unsubscribe(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      await OneSignal.logout();
      console.log("[OneSignalWebService] User unsubscribed:", userId);
    } catch (error) {
      console.error("[OneSignalWebService] Failed to unsubscribe user:", error);
      throw error;
    }
  }

  async requestPermissions(): Promise<boolean> {
    this.ensureInitialized();

    try {
      const permission = await OneSignal.Notifications.requestPermission();
      console.log("[OneSignalWebService] Permission granted:", permission);
      return permission;
    } catch (error) {
      console.error("[OneSignalWebService] Failed to request permissions:", error);
      return false;
    }
  }

  async isEnabled(): Promise<boolean> {
    this.ensureInitialized();

    try {
      const permission = await OneSignal.Notifications.permissionNative;
      return permission === "granted";
    } catch (error) {
      console.error("[OneSignalWebService] Failed to check notification status:", error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    this.ensureInitialized();

    try {
      const playerId = await OneSignal.User.PushSubscription.id;
      return playerId ?? null;
    } catch (error) {
      console.error("[OneSignalWebService] Failed to get push token:", error);
      return null;
    }
  }
}

// Export singleton instance
export const webPushService = new OneSignalWebService();
