/**
 * usePushNotifications Hook
 *
 * Manage push notification permissions and subscriptions.
 * Uses browser Notification API for web and Expo Notifications for mobile.
 */

import { useEffect, useState } from "react";
import type { NotificationPermission } from "../types";

// Type-safe window/Notification access for cross-platform compatibility
const getWindow = () => (typeof globalThis !== "undefined" ? (globalThis as any) : undefined);
const hasNotificationAPI = () => {
  const win = getWindow();
  return win && "Notification" in win;
};

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [pushToken, setPushToken] = useState<string | undefined>();

  useEffect(() => {
    // Check current permission status
    if (hasNotificationAPI()) {
      const win = getWindow();
      setPermission(win.Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!hasNotificationAPI()) {
      return "default";
    }

    const win = getWindow();
    const result = await win.Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribe = async (): Promise<void> => {
    await requestPermission();
  };

  const unsubscribe = async (): Promise<void> => {
    // Browser/device permissions must be revoked through system settings
  };

  return {
    permission,
    pushToken,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
