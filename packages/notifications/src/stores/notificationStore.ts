/**
 * Notification Store
 *
 * Zustand store for managing notification state across web and mobile
 */

import { create } from "zustand";
import type { NotificationPermission } from "../types";

export interface NotificationStoreState {
  // Initialization
  isInitialized: boolean;
  isInitializing: boolean;
  initError: Error | null;

  // Permission
  permission: NotificationPermission;
  isSubscribed: boolean;

  // User
  externalUserId: string | null;
  pushToken: string | null;
  subscriptionId: string | null;

  // In-app messages
  inAppMessagesEnabled: boolean;
  currentInAppMessage: InAppMessage | null;

  // Tags
  tags: Record<string, string>;

  // Actions
  setInitialized: (value: boolean) => void;
  setInitializing: (value: boolean) => void;
  setInitError: (error: Error | null) => void;
  setPermission: (permission: NotificationPermission) => void;
  setSubscribed: (value: boolean) => void;
  setExternalUserId: (userId: string | null) => void;
  setPushToken: (token: string | null) => void;
  setSubscriptionId: (id: string | null) => void;
  setInAppMessagesEnabled: (value: boolean) => void;
  setCurrentInAppMessage: (message: InAppMessage | null) => void;
  setTags: (tags: Record<string, string>) => void;
  addTag: (key: string, value: string) => void;
  removeTag: (key: string) => void;
  reset: () => void;
}

export interface InAppMessage {
  messageId: string;
  title?: string;
  body?: string;
  actionUrl?: string;
}

const initialState = {
  isInitialized: false,
  isInitializing: false,
  initError: null,
  permission: "default" as NotificationPermission,
  isSubscribed: false,
  externalUserId: null,
  pushToken: null,
  subscriptionId: null,
  inAppMessagesEnabled: true,
  currentInAppMessage: null,
  tags: {},
};

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  ...initialState,

  setInitialized: (value) => set({ isInitialized: value }),
  setInitializing: (value) => set({ isInitializing: value }),
  setInitError: (error) => set({ initError: error }),
  setPermission: (permission) => set({ permission }),
  setSubscribed: (value) => set({ isSubscribed: value }),
  setExternalUserId: (userId) => set({ externalUserId: userId }),
  setPushToken: (token) => set({ pushToken: token }),
  setSubscriptionId: (id) => set({ subscriptionId: id }),
  setInAppMessagesEnabled: (value) => set({ inAppMessagesEnabled: value }),
  setCurrentInAppMessage: (message) => set({ currentInAppMessage: message }),
  setTags: (tags) => set({ tags }),
  addTag: (key, value) => set((state) => ({ tags: { ...state.tags, [key]: value } })),
  removeTag: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.tags;
      return { tags: rest };
    }),
  reset: () => set(initialState),
}));
