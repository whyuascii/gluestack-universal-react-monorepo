/**
 * Tenant Store
 *
 * Manages active tenant (Group) and tenant switching.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";

export interface TenantMembership {
  tenantId: string;
  tenantName: string;
  role: "owner" | "admin" | "member";
}

export interface TenantState {
  activeTenantId: string | null;
  memberships: TenantMembership[];
  isLoading: boolean;
  isStorageLoaded: boolean;
}

export interface TenantActions {
  /** Set the active tenant and persist to storage */
  setActiveTenant: (tenantId: string) => void;
  /** Update memberships from API response */
  setMemberships: (memberships: TenantMembership[]) => void;
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  /** Initialize from storage */
  loadFromStorage: () => Promise<void>;
  /** Sync with server data */
  syncWithServer: (serverActiveTenantId: string | null, memberships: TenantMembership[]) => void;
}

type TenantStore = TenantState & TenantActions;

const ACTIVE_TENANT_KEY = "activeTenantId";

// Cross-platform storage
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
};

export const useTenantStore = create<TenantStore>((set, get) => ({
  // Initial state
  activeTenantId: null,
  memberships: [],
  isLoading: true,
  isStorageLoaded: false,

  // Actions
  setActiveTenant: (tenantId) => {
    set({ activeTenantId: tenantId });
    storage.setItem(ACTIVE_TENANT_KEY, tenantId);
  },

  setMemberships: (memberships) => set({ memberships }),

  setLoading: (isLoading) => set({ isLoading }),

  loadFromStorage: async () => {
    const stored = await storage.getItem(ACTIVE_TENANT_KEY);
    set({
      activeTenantId: stored,
      isStorageLoaded: true,
    });
  },

  syncWithServer: (serverActiveTenantId, memberships) => {
    const { activeTenantId, isStorageLoaded } = get();

    set({ memberships, isLoading: false });

    if (!isStorageLoaded) return;

    const validTenantIds = memberships.map((m) => m.tenantId);

    // If stored tenant is invalid, use server's active tenant
    if (activeTenantId && !validTenantIds.includes(activeTenantId)) {
      set({ activeTenantId: serverActiveTenantId });
      if (serverActiveTenantId) {
        storage.setItem(ACTIVE_TENANT_KEY, serverActiveTenantId);
      }
    } else if (!activeTenantId && serverActiveTenantId) {
      // No stored tenant, use server's
      set({ activeTenantId: serverActiveTenantId });
      storage.setItem(ACTIVE_TENANT_KEY, serverActiveTenantId);
    }
  },
}));

/**
 * Selector hooks
 */
export const useActiveTenant = () =>
  useTenantStore((state) => {
    const { activeTenantId, memberships } = state;
    return memberships.find((m) => m.tenantId === activeTenantId) ?? null;
  });

export const useHasTenants = () => useTenantStore((state) => state.memberships.length > 0);

export const useTenantMemberships = () => useTenantStore((state) => state.memberships);
