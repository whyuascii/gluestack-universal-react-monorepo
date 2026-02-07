"use client";

/**
 * AuthenticatedLayout - Shared layout for all authenticated pages
 *
 * Provides consistent navigation across dashboard, todos, settings, etc.
 * Each screen only needs to provide its content.
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import type { Session } from "@app/auth";
import React from "react";
import { View, ScrollView } from "react-native";
import { AppNavBar, type AppNavBarProps } from "./AppNavBar";
import { useLogout } from "../hooks/auth";

export interface AuthenticatedLayoutProps {
  /** Current user session */
  session: Session | null;
  /** Current active route for nav highlighting */
  activeRoute?: "dashboard" | "todos" | "settings";
  /** Page content */
  children: React.ReactNode;
  /** Navigation callbacks */
  onNavigateToDashboard?: () => void;
  onNavigateToTodos?: () => void;
  onNavigateToSettings?: () => void;
  onLogoutSuccess?: () => void;
  /**
   * Custom signOut function for platform-specific auth clients.
   * Mobile should pass signOut from @app/auth/client/native.
   * Web can omit this to use the default authClient.
   */
  signOut?: () => Promise<unknown>;
  /**
   * Custom notification component for platform-specific implementations.
   * Web: Pass NovuInbox from @novu/nextjs
   * Mobile: Pass native notification component
   */
  NotificationComponent?: React.ComponentType<{ bellSize?: "sm" | "md" | "lg" }>;
  /** Whether to wrap content in a ScrollView (default: true) */
  scrollable?: boolean;
  /** Max width for content area (default: 1280) */
  maxContentWidth?: number;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  session,
  activeRoute,
  children,
  onNavigateToDashboard,
  onNavigateToTodos,
  onNavigateToSettings,
  onLogoutSuccess,
  signOut,
  NotificationComponent,
  scrollable = true,
  maxContentWidth = 1280,
}) => {
  // Logout hook with proper cache clearing
  const { logout, isLoggingOut } = useLogout({
    signOut,
    onSuccess: onLogoutSuccess,
    onError: (error: Error) => console.error("Logout failed:", error),
  });

  const content = (
    <View className="w-full self-center" style={{ maxWidth: maxContentWidth }}>
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-background-50 min-h-0">
      <AppNavBar
        session={session}
        activeRoute={activeRoute}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToTodos={onNavigateToTodos}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={logout}
        isLoggingOut={isLoggingOut}
        NotificationComponent={NotificationComponent}
      />

      {scrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="py-6 px-5"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View className="flex-1 py-6 px-5">{content}</View>
      )}
    </View>
  );
};

export default AuthenticatedLayout;
