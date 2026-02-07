/**
 * Notification Provider (Web)
 *
 * Provides notification context for web apps using Novu.
 * In-app notifications are delivered via SSE stream.
 * Push notifications are handled by the service worker.
 */

"use client";

import React, { createContext, useContext, useEffect, useCallback, type ReactNode } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import type { NotificationProviderProps } from "./NotificationProvider";

// Type-safe window/Notification access for cross-platform compatibility
type WebNotificationPermission = "default" | "granted" | "denied";

const getWindow = (): any => (typeof globalThis !== "undefined" ? globalThis : undefined);
const hasNotificationAPI = (): boolean => {
  const win = getWindow();
  return win && typeof win === "object" && "Notification" in win;
};

interface NotificationContextValue {
  // State
  isInitialized: boolean;
  isSubscribed: boolean;
  permission: WebNotificationPermission;

  // Push actions
  requestPermission: () => Promise<void>;
  optIn: () => Promise<void>;
  optOut: () => Promise<void>;

  // User identification
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const store = useNotificationStore();

  // Initialize
  useEffect(() => {
    const win = getWindow();
    if (!win) return;
    if (store.isInitialized || store.isInitializing) return;

    store.setInitializing(true);

    try {
      // Check current permission state
      if (hasNotificationAPI()) {
        store.setPermission(win.Notification.permission);
        store.setSubscribed(win.Notification.permission === "granted");
      }

      // Login if userId provided
      if (userId) {
        store.setExternalUserId(userId);
      }

      store.setInitialized(true);
      store.setInitializing(false);
    } catch (error) {
      store.setInitError(error instanceof Error ? error : new Error("Unknown error"));
      store.setInitializing(false);
    }
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
    if (!hasNotificationAPI()) return;

    const win = getWindow();
    const permission = await win.Notification.requestPermission();
    store.setPermission(permission);
    store.setSubscribed(permission === "granted");
  }, []);

  const optIn = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  const optOut = useCallback(async () => {
    // Web doesn't have a programmatic way to opt-out
    // User must revoke permissions in browser settings
  }, []);

  const login = useCallback(async (id: string) => {
    store.setExternalUserId(id);
  }, []);

  const logout = useCallback(async () => {
    store.setExternalUserId(null);
  }, []);

  const contextValue: NotificationContextValue = {
    isInitialized: store.isInitialized,
    isSubscribed: store.isSubscribed,
    permission: store.permission,
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
