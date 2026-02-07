/**
 * NotificationBell Component
 *
 * Cross-platform bell icon with unread count badge.
 * Works on both web and mobile via React Native Web.
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import { Pressable, View, Text, Platform } from "react-native";
import { Bell } from "lucide-react-native";
import type { NotificationBellProps } from "./types";

/**
 * NotificationBell displays a bell icon with an optional unread count badge.
 *
 * Usage:
 *   <NotificationBell
 *     unreadCount={unreadCount}
 *     isLoading={isLoading}
 *     onPress={() => setInboxOpen(true)}
 *   />
 */
export function NotificationBell({
  unreadCount = 0,
  isLoading = false,
  onPress,
  size = "md",
  className,
}: NotificationBellProps) {
  const iconSize = size === "sm" ? 18 : size === "md" ? 22 : 26;
  const hasUnread = unreadCount > 0 && !isLoading;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  const webHoverClass =
    Platform.OS === "web" ? "hover:bg-background-100 transition-colors duration-200" : "";

  return (
    <Pressable
      onPress={onPress}
      className={`relative w-11 h-11 items-center justify-center rounded-xl bg-background-50 active:bg-background-100 ${webHoverClass} ${className ?? ""}`}
      accessibilityLabel={hasUnread ? `${unreadCount} unread notifications` : "Notifications"}
      accessibilityRole="button"
    >
      <Bell
        size={iconSize}
        color={hasUnread ? "#1f2937" : "#6b7280"}
        strokeWidth={hasUnread ? 2.2 : 2}
      />
      {hasUnread && (
        <View className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-primary-500 rounded-full items-center justify-center px-1.5 border-2 border-background-0 shadow-lg">
          <Text className="text-typography-0 text-[11px] font-bold tracking-tight">
            {displayCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
