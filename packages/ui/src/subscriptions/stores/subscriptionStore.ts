import { create } from "zustand";
import { REVENUECAT_CONFIG } from "../config/revenuecat";

/**
 * Customer Info type (platform-agnostic subset)
 * Full types differ between SDKs, so we extract common fields
 */
export interface CustomerInfo {
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  entitlements: {
    active: Record<string, EntitlementInfo>;
    all: Record<string, EntitlementInfo>;
  };
  originalAppUserId: string;
  originalApplicationVersion: string | null;
  requestDate: Date;
}

export interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  productIdentifier: string;
  purchaseDate: Date;
  expirationDate: Date | null;
}

export type EntitlementsRecord = Record<string, EntitlementInfo>;

interface SubscriptionState {
  /**
   * Current customer info from RevenueCat
   */
  customerInfo: CustomerInfo | null;

  /**
   * Loading state for initial fetch
   */
  isLoading: boolean;

  /**
   * Error state
   */
  error: Error | null;

  /**
   * Whether the user has the premium entitlement
   */
  isPremium: () => boolean;

  /**
   * Get all active subscription product IDs
   */
  activeSubscriptions: () => string[];

  /**
   * Check if user has a specific entitlement
   */
  hasEntitlement: (entitlementId: string) => boolean;

  /**
   * Actions
   */
  setCustomerInfo: (info: CustomerInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

/**
 * Subscription store
 * Holds customer info and provides entitlement checking
 */
export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  customerInfo: null,
  isLoading: true,
  error: null,

  isPremium: () => {
    const state = get();
    return state.hasEntitlement(REVENUECAT_CONFIG.entitlements.premium);
  },

  activeSubscriptions: () => {
    const state = get();
    return state.customerInfo?.activeSubscriptions ?? [];
  },

  hasEntitlement: (entitlementId: string) => {
    const state = get();
    if (!state.customerInfo) return false;

    const entitlement = state.customerInfo.entitlements.active[entitlementId];
    return entitlement?.isActive ?? false;
  },

  setCustomerInfo: (info) => {
    set({ customerInfo: info, isLoading: false, error: null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  reset: () => {
    set({ customerInfo: null, isLoading: true, error: null });
  },
}));
