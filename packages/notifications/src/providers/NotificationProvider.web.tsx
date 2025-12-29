import React, { useEffect } from "react";
import OneSignal from "react-onesignal";
import { webPushService } from "../services/push.web";
import { useNotificationStore } from "../stores/notificationStore";
import { NotificationProvider as BaseProvider } from "./NotificationProvider";

/**
 * Web-specific NotificationProvider
 * Initializes OneSignal for web and sets up notification listeners
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setPermissionGranted, setPushEnabled } = useNotificationStore();

  useEffect(() => {
    const setupNotificationListeners = async () => {
      try {
        // Listen for permission changes
        OneSignal.Notifications.addEventListener("permissionChange", (granted) => {
          console.log("[NotificationProvider.web] Permission changed:", granted);
          setPermissionGranted(granted);
        });

        // Listen for notification clicks
        OneSignal.Notifications.addEventListener("click", (event) => {
          console.log("[NotificationProvider.web] Notification clicked:", event);

          // Handle notification click (e.g., navigate to specific screen)
          if (event.notification.launchURL) {
            window.location.href = event.notification.launchURL;
          }
        });

        // Check initial permission state
        const permission = await OneSignal.Notifications.permissionNative;
        setPermissionGranted(permission === "granted");
        setPushEnabled(permission === "granted");
      } catch (error) {
        console.error("[NotificationProvider.web] Failed to setup listeners:", error);
      }
    };

    setupNotificationListeners();
  }, [setPermissionGranted, setPushEnabled]);

  return <BaseProvider pushService={webPushService}>{children}</BaseProvider>;
};
