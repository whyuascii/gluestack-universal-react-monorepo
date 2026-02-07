"use client";

/**
 * useNavigation - Unified navigation hook
 *
 * Provides a consistent navigation interface that works across web and mobile.
 * Apps pass in their platform-specific navigation functions.
 */

import { useCallback } from "react";
import type { NavRoute, NavigationCallbacks } from "../types";

interface UseNavigationOptions {
  /** Platform-specific navigation function */
  navigate: (route: string) => void;
  /** Route mappings from NavRoute to platform paths */
  routes: Record<NavRoute, string>;
}

export function useNavigation({ navigate, routes }: UseNavigationOptions): NavigationCallbacks {
  const createNavigator = useCallback(
    (route: NavRoute) => () => {
      const path = routes[route];
      if (path) {
        navigate(path);
      }
    },
    [navigate, routes]
  );

  return {
    onNavigateToHome: createNavigator("home"),
    onNavigateToFeatures: createNavigator("features"),
    onNavigateToPricing: createNavigator("pricing"),
    onNavigateToAbout: createNavigator("about"),
    onNavigateToLogin: createNavigator("login"),
    onNavigateToSignup: createNavigator("signup"),
    onNavigateToDashboard: createNavigator("dashboard"),
    onNavigateToTodos: createNavigator("todos"),
    onNavigateToGroup: createNavigator("group"),
    onNavigateToSettings: createNavigator("settings"),
    onNavigateToProfile: createNavigator("profile"),
    onNavigateToNotifications: createNavigator("notifications"),
  };
}
