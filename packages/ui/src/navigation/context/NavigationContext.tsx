"use client";

/**
 * NavigationContext - Shared navigation state
 *
 * Provides:
 * - Sidebar open/closed state (web)
 * - Current route tracking
 * - Navigation helpers
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import type { NavRoute } from "../types";

interface NavigationContextValue {
  /** Whether sidebar/drawer is open */
  isSidebarOpen: boolean;
  /** Toggle sidebar open/closed */
  toggleSidebar: () => void;
  /** Open sidebar */
  openSidebar: () => void;
  /** Close sidebar */
  closeSidebar: () => void;
  /** Current active route */
  currentRoute: NavRoute | null;
  /** Set current route */
  setCurrentRoute: (route: NavRoute) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

interface NavigationProviderProps {
  children: React.ReactNode;
  /** Initial route (optional) */
  initialRoute?: NavRoute;
}

export function NavigationProvider({ children, initialRoute }: NavigationProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<NavRoute | null>(initialRoute ?? null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        currentRoute,
        setCurrentRoute,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigationContext must be used within NavigationProvider");
  }
  return context;
}

/**
 * Optional hook that doesn't throw if context is missing.
 * Useful for components that may render outside the provider.
 */
export function useOptionalNavigationContext() {
  return useContext(NavigationContext);
}
