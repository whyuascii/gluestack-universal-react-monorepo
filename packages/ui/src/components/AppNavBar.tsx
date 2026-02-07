"use client";

/**
 * AppNavBar - Shared navigation bar for authenticated pages
 *
 * Used across all post-login screens (dashboard, todos, settings, etc.)
 * Platform-specific notification components can be passed in.
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 * All colors reference theme tokens (primary, typography, background, outline).
 */

import { Box, HStack, Text, Pressable, VStack } from "@app/components";
import type { Session } from "@app/auth";
import { Bell, Settings, LogOut, ListTodo, Home } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { iconColors } from "../constants/colors";

export interface AppNavBarProps {
  /** Current user session */
  session: Session | null;
  /** Current active route for highlighting */
  activeRoute?: "dashboard" | "todos" | "settings";
  /** Navigation callbacks */
  onNavigateToDashboard?: () => void;
  onNavigateToTodos?: () => void;
  onNavigateToSettings?: () => void;
  onLogout?: () => void;
  /** Loading state for logout */
  isLoggingOut?: boolean;
  /**
   * Custom notification component for platform-specific implementations.
   * Web: Pass NovuInbox from @novu/nextjs
   * Mobile: Pass native notification component
   */
  NotificationComponent?: React.ComponentType<{ bellSize?: "sm" | "md" | "lg" }>;
}

/**
 * Nav button wrapper with consistent styling
 */
const NavButton: React.FC<{
  onPress?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  variant?: "default" | "danger";
  children: React.ReactNode;
}> = ({ onPress, isActive, isDisabled, variant = "default", children }) => {
  const baseClasses = "w-10 h-10 rounded-full items-center justify-center";
  const variantClasses = variant === "danger" || isActive ? "bg-primary-50" : "bg-background-100";
  const disabledClasses = isDisabled ? "opacity-50" : "";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
    >
      {children}
    </Pressable>
  );
};

export const AppNavBar: React.FC<AppNavBarProps> = ({
  session,
  activeRoute,
  onNavigateToDashboard,
  onNavigateToTodos,
  onNavigateToSettings,
  onLogout,
  isLoggingOut = false,
  NotificationComponent,
}) => {
  const { t } = useTranslation("common");

  const userName = session?.user?.name?.split(" ")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <View className="bg-background-0 border-b border-outline-200">
      <View className="flex-row justify-between items-center py-3 px-5 max-w-[1280px] w-full self-center">
        {/* Left: Logo */}
        <HStack space="md" className="items-center">
          <Pressable onPress={onNavigateToDashboard}>
            <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center">
              <Text className="text-typography-0 font-bold text-base">A</Text>
            </View>
          </Pressable>
          <Text className="text-xl font-bold text-typography-900 hidden md:flex">
            {t("app.name")}
          </Text>
        </HStack>

        {/* Right: Navigation Items */}
        <HStack space="sm" className="items-center">
          {/* Dashboard */}
          {onNavigateToDashboard && (
            <NavButton onPress={onNavigateToDashboard} isActive={activeRoute === "dashboard"}>
              <Home
                size={20}
                color={activeRoute === "dashboard" ? iconColors.active : iconColors.inactive}
              />
            </NavButton>
          )}

          {/* Todos */}
          {onNavigateToTodos && (
            <NavButton onPress={onNavigateToTodos} isActive={activeRoute === "todos"}>
              <ListTodo
                size={20}
                color={activeRoute === "todos" ? iconColors.active : iconColors.inactive}
              />
            </NavButton>
          )}

          {/* Notifications */}
          {NotificationComponent ? (
            <NotificationComponent bellSize="md" />
          ) : (
            <NavButton>
              <Bell size={20} color={iconColors.inactive} />
            </NavButton>
          )}

          {/* Settings */}
          {onNavigateToSettings && (
            <NavButton onPress={onNavigateToSettings} isActive={activeRoute === "settings"}>
              <Settings
                size={20}
                color={activeRoute === "settings" ? iconColors.active : iconColors.inactive}
              />
            </NavButton>
          )}

          {/* Logout */}
          {onLogout && (
            <NavButton onPress={onLogout} isDisabled={isLoggingOut} variant="danger">
              <LogOut size={20} color={iconColors.active} />
            </NavButton>
          )}

          {/* User Avatar */}
          <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center">
            <Text className="text-base font-bold text-primary-600">{userInitial}</Text>
          </View>
        </HStack>
      </View>
    </View>
  );
};

export default AppNavBar;
