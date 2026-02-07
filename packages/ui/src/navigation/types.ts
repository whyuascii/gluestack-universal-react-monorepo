/**
 * Navigation Types
 *
 * Shared types for navigation components across web and mobile.
 */

import type { Session } from "@app/auth";

export type NavRoute =
  | "home"
  | "features"
  | "pricing"
  | "about"
  | "login"
  | "signup"
  | "dashboard"
  | "todos"
  | "group"
  | "settings"
  | "profile"
  | "notifications";

export interface NavigationItem {
  key: NavRoute;
  labelKey: string; // i18n translation key
  icon?: string;
  href?: string;
}

export interface NavigationCallbacks {
  onNavigateToHome?: () => void;
  onNavigateToFeatures?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToTodos?: () => void;
  onNavigateToGroup?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToNotifications?: () => void;
  onLogout?: () => void;
}

export interface BaseNavProps {
  /** Current active route for highlighting */
  activeRoute?: NavRoute;
}

export interface AuthenticatedNavProps extends BaseNavProps, NavigationCallbacks {
  /** Current user session */
  session: Session | null;
  /** Loading state for logout */
  isLoggingOut?: boolean;
  /**
   * Custom notification component for platform-specific implementations.
   * Web: Bell with dropdown
   * Mobile: Bell that navigates to notifications screen
   */
  NotificationComponent?: React.ComponentType<{ bellSize?: "sm" | "md" | "lg" }>;
}

export interface PublicNavProps extends BaseNavProps, NavigationCallbacks {}
