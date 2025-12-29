import { create } from "zustand";
import type { NotificationStore, InAppNotification } from "../types";

/**
 * Global notification store using Zustand
 * Manages in-app notifications, read status, and permission state
 */
export const useNotificationStore = create<NotificationStore>((set) => ({
  // State
  inAppNotifications: [],
  unreadCount: 0,
  isPermissionGranted: false,
  isPushEnabled: false,

  // Actions
  addNotification: (notification: InAppNotification) =>
    set((state) => {
      const newNotifications = [notification, ...state.inAppNotifications];
      const unreadCount = newNotifications.filter((n) => !n.read).length;

      return {
        inAppNotifications: newNotifications,
        unreadCount,
      };
    }),

  removeNotification: (id: string) =>
    set((state) => {
      const newNotifications = state.inAppNotifications.filter((n) => n.id !== id);
      const unreadCount = newNotifications.filter((n) => !n.read).length;

      return {
        inAppNotifications: newNotifications,
        unreadCount,
      };
    }),

  markAsRead: (id: string) =>
    set((state) => {
      const newNotifications = state.inAppNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = newNotifications.filter((n) => !n.read).length;

      return {
        inAppNotifications: newNotifications,
        unreadCount,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      inAppNotifications: state.inAppNotifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () =>
    set({
      inAppNotifications: [],
      unreadCount: 0,
    }),

  setPermissionGranted: (granted: boolean) =>
    set({
      isPermissionGranted: granted,
    }),

  setPushEnabled: (enabled: boolean) =>
    set({
      isPushEnabled: enabled,
    }),
}));
