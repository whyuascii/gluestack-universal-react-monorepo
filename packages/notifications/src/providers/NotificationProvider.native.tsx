/**
 * Notification Provider (Native)
 *
 * Provides notification context for React Native (Expo) apps.
 * Uses Expo Push Notifications for push delivery via Firebase/APNs.
 * In-app notifications are delivered via SSE stream.
 */

import React, { createContext, useContext, useEffect, useCallback, type ReactNode } from "react";
import { Platform } from "react-native";
import { useNotificationStore } from "../stores/notificationStore";
import type { NotificationProviderProps } from "./NotificationProvider";
import type { NotificationPermission } from "../types";

interface NotificationContextValue {
  // State
  isInitialized: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  expoPushToken: string | null;

  // Push actions
  requestPermission: () => Promise<boolean>;
  optIn: () => void;
  optOut: () => void;

  // User identification
  login: (userId: string) => void;
  logout: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const store = useNotificationStore();

  // Initialize Expo Push Notifications
  useEffect(() => {
    const initNotifications = async () => {
      if (store.isInitialized || store.isInitializing) return;

      store.setInitializing(true);

      try {
        // Dynamically import Expo modules to avoid bundling issues
        const Notifications = await import("expo-notifications");
        const Device = await import("expo-device");
        const Constants = await import("expo-constants");

        // Check if physical device (push doesn't work on simulators)
        if (!Device.isDevice) {
          store.setInitialized(true);
          store.setInitializing(false);
          return;
        }

        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        store.setPermission(existingStatus === "granted" ? "granted" : "default");
        store.setSubscribed(existingStatus === "granted");

        // Get Expo push token if we have permission
        if (existingStatus === "granted") {
          const projectId = Constants.default.expoConfig?.extra?.eas?.projectId;
          if (projectId) {
            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            store.setPushToken(tokenData.data);
          }
        }

        // Set up notification received handler
        Notifications.addNotificationReceivedListener(() => {
          // Notification received - UI will handle display
        });

        // Set up notification response handler (when user taps notification)
        Notifications.addNotificationResponseReceivedListener((response) => {
          // Handle deep link if present - this should be handled by the app
          const data = response.notification.request.content.data;
          if (data?.deepLink) {
            // App navigation should handle this
          }
        });

        // Configure Android notification channel
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }

        // Login if userId provided
        if (userId) {
          store.setExternalUserId(userId);
        }

        store.setInitialized(true);
        store.setInitializing(false);
      } catch (error) {
        console.error("[Notifications] Initialization failed:", error);
        store.setInitError(error instanceof Error ? error : new Error("Unknown error"));
        store.setInitializing(false);
      }
    };

    initNotifications();
  }, []);

  // Handle user login/logout changes
  useEffect(() => {
    if (!store.isInitialized) return;

    if (userId && userId !== store.externalUserId) {
      store.setExternalUserId(userId);
    } else if (!userId && store.externalUserId) {
      store.setExternalUserId(null);
    }
  }, [userId, store.isInitialized, store.externalUserId]);

  // Context actions
  const requestPermission = useCallback(async () => {
    try {
      const Notifications = await import("expo-notifications");
      const Constants = await import("expo-constants");

      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";

      store.setPermission(granted ? "granted" : "denied");
      store.setSubscribed(granted);

      if (granted) {
        // Get push token after permission granted
        const projectId = Constants.default.expoConfig?.extra?.eas?.projectId;
        if (projectId) {
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          store.setPushToken(tokenData.data);
        }
      }

      return granted;
    } catch {
      return false;
    }
  }, []);

  const optIn = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  const optOut = useCallback(() => {
    // On mobile, user must disable in system settings
    // No programmatic way to disable push permissions
  }, []);

  const login = useCallback((id: string) => {
    store.setExternalUserId(id);
  }, []);

  const logout = useCallback(() => {
    store.setExternalUserId(null);
  }, []);

  const contextValue: NotificationContextValue = {
    isInitialized: store.isInitialized,
    isSubscribed: store.isSubscribed,
    permission: store.permission,
    expoPushToken: store.pushToken,
    requestPermission,
    optIn,
    optOut,
    login,
    logout,
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
}
