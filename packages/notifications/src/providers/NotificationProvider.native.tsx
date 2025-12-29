import React, { useEffect } from "react";
import OneSignal, {
  type NotificationClickEvent,
  type NotificationWillDisplayEvent,
} from "react-native-onesignal";
import { inAppNotificationService } from "../services/inApp";
import { nativePushService } from "../services/push.native";
import { useNotificationStore } from "../stores/notificationStore";
import { NotificationProvider as BaseProvider } from "./NotificationProvider";

/**
 * Native-specific NotificationProvider (iOS & Android)
 * Initializes OneSignal for mobile and sets up notification listeners
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setPermissionGranted, setPushEnabled } = useNotificationStore();

  useEffect(() => {
    const setupNotificationListeners = async () => {
      try {
        // Listen for permission changes
        // @ts-expect-error - OneSignal native types may differ from package version
        OneSignal.Notifications.addEventListener("permissionChange", (granted: boolean) => {
          console.log("[NotificationProvider.native] Permission changed:", granted);
          setPermissionGranted(granted);
        });

        // Listen for notification clicks
        // @ts-expect-error - OneSignal native types may differ from package version
        OneSignal.Notifications.addEventListener("click", (event: NotificationClickEvent) => {
          console.log("[NotificationProvider.native] Notification clicked:", event);

          const { notification } = event;

          // Handle notification click (e.g., navigate to specific screen)
          // You can pass data in notification.additionalData
          if (notification.additionalData) {
            const { screen, params } = notification.additionalData as {
              screen?: string;
              params?: Record<string, unknown>;
            };

            if (screen) {
              // Navigate to screen using your navigation library
              // Example: navigation.navigate(screen, params);
              console.log("[NotificationProvider.native] Navigate to:", screen, params);
            }
          }
        });

        // Listen for notifications received while app is in foreground
        // @ts-expect-error - OneSignal native types may differ from package version
        OneSignal.Notifications.addEventListener(
          "foregroundWillDisplay",
          (event: NotificationWillDisplayEvent) => {
            console.log(
              "[NotificationProvider.native] Notification received in foreground:",
              event
            );

            const notification = event.getNotification();

            // Show as in-app notification instead of system notification
            inAppNotificationService.show({
              type: "in-app",
              title: notification.title || "Notification",
              message: notification.body || "",
              priority: "normal",
              dismissible: true,
              autoHide: true,
              autoHideDelay: 5000,
              data: notification.additionalData as Record<string, unknown>,
            });

            // Prevent the notification from displaying as a system notification
            event.preventDefault();
          }
        );

        // Check initial permission state
        // @ts-expect-error - OneSignal native types may differ from package version
        const hasPermission = await OneSignal.Notifications.getPermissionAsync();
        setPermissionGranted(hasPermission);
        setPushEnabled(hasPermission);
      } catch (error) {
        console.error("[NotificationProvider.native] Failed to setup listeners:", error);
      }
    };

    setupNotificationListeners();
  }, [setPermissionGranted, setPushEnabled]);

  return <BaseProvider pushService={nativePushService}>{children}</BaseProvider>;
};
