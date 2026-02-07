/**
 * Preferences Store
 *
 * Manages user preferences like theme, locale, and notification settings.
 * Persists to storage automatically.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Preferences {
  theme: "light" | "dark" | "system";
  locale: string;
  notifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
  };
}

export interface PreferencesState extends Preferences {
  isLoading: boolean;
}

export interface PreferencesActions {
  setTheme: (theme: Preferences["theme"]) => void;
  setLocale: (locale: string) => void;
  setNotificationPreference: (key: keyof Preferences["notifications"], value: boolean) => void;
  resetPreferences: () => void;
}

type PreferencesStore = PreferencesState & PreferencesActions;

const defaultPreferences: Preferences = {
  theme: "system",
  locale: "en",
  notifications: {
    enabled: true,
    email: true,
    push: true,
  },
};

// Cross-platform storage adapter for Zustand persist
const crossPlatformStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(name);
    }
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(name, value);
      return;
    }
    return AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(name);
      return;
    }
    return AsyncStorage.removeItem(name);
  },
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      // Initial state
      ...defaultPreferences,
      isLoading: true,

      // Actions
      setTheme: (theme) => set({ theme }),

      setLocale: (locale) => set({ locale }),

      setNotificationPreference: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),

      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: "userPreferences",
      storage: createJSONStorage(() => crossPlatformStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

/**
 * Selector hooks
 */
export const useTheme = () => usePreferencesStore((state) => state.theme);

export const useLocale = () => usePreferencesStore((state) => state.locale);

export const useNotificationPreferences = () => usePreferencesStore((state) => state.notifications);
