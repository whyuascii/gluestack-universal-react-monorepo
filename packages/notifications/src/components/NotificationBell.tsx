/**
 * Notification Bell Component
 *
 * Displays notification icon with unread count badge.
 * Uses the notification hooks from @app/ui for data fetching.
 */

import React from "react";
import { Pressable, View, Text } from "react-native";
import { Icon, BellIcon } from "@app/components";

export interface NotificationBellProps {
  /** Number of unread notifications (pass from parent using useUnreadCount hook) */
  unreadCount?: number;
  /** Callback when bell is pressed */
  onPress?: () => void;
  /** Additional className for styling */
  className?: string;
  /** Size of the bell icon */
  size?: "sm" | "md" | "lg";
}

/**
 * NotificationBell displays a bell icon with an optional unread count badge.
 *
 * Usage:
 *   import { useUnreadCount } from "@app/ui";
 *   const { data } = useUnreadCount();
 *   <NotificationBell unreadCount={data?.count} onPress={openNotifications} />
 */
export function NotificationBell({
  unreadCount = 0,
  onPress,
  className,
  size = "md",
}: NotificationBellProps) {
  const iconSize = size === "sm" ? "md" : size === "md" ? "lg" : "xl";
  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <Pressable
      onPress={onPress}
      className={`relative p-2 ${className ?? ""}`}
      accessibilityLabel={hasUnread ? `${unreadCount} unread notifications` : "Notifications"}
      accessibilityRole="button"
    >
      <Icon as={BellIcon} size={iconSize} className="text-typography-700" />
      {hasUnread && (
        <View className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error-500 rounded-full items-center justify-center px-1">
          <Text className="text-white text-2xs font-semibold">{displayCount}</Text>
        </View>
      )}
    </Pressable>
  );
}
