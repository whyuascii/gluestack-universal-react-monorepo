"use client";

/**
 * PrivateHeader - Top header for authenticated mobile pages
 *
 * Features:
 * - Screen title (optional)
 * - NotificationBell (navigates to notifications screen)
 * - Profile avatar (navigates to profile screen)
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import { View, Pressable, Platform } from "react-native";
import { Text } from "@app/components";
import { Bell } from "lucide-react-native";
import type { Session } from "@app/auth";
import { iconColors } from "../../constants/colors";

export interface PrivateHeaderProps {
  /** Current user session */
  session: Session | null;
  /** Screen title */
  title?: string;
  /** Show notification bell */
  showNotifications?: boolean;
  /** Notification bell press handler */
  onNotificationPress?: () => void;
  /** Unread notification count */
  unreadCount?: number;
  /** Show profile button */
  showProfile?: boolean;
  /** Profile press handler */
  onProfilePress?: () => void;
  /** Logo text (single letter) */
  logoText?: string;
  /** Show logo instead of title */
  showLogo?: boolean;
  /** App name (shown next to logo) */
  appName?: string;
}

export const PrivateHeader: React.FC<PrivateHeaderProps> = ({
  session,
  title,
  showNotifications = true,
  onNotificationPress,
  unreadCount = 0,
  showProfile = true,
  onProfilePress,
  logoText = "A",
  showLogo = false,
  appName,
}) => {
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-3 bg-background-0 border-b border-outline-200"
      style={{ paddingTop: Platform.OS === "ios" ? 8 : 12 }}
    >
      {/* Left: Title or Logo */}
      <View className="flex-1">
        {showLogo ? (
          <View className="flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center">
              <Text className="text-typography-0 font-bold text-base">{logoText}</Text>
            </View>
            {appName && <Text className="text-lg font-bold text-typography-900">{appName}</Text>}
          </View>
        ) : (
          <Text className="text-xl font-bold text-typography-900">{title}</Text>
        )}
      </View>

      {/* Right: Notifications + Profile */}
      <View className="flex-row items-center gap-2">
        {showNotifications && (
          <Pressable
            onPress={onNotificationPress}
            className="w-10 h-10 rounded-full bg-background-100 items-center justify-center relative"
          >
            <Bell size={22} color={iconColors.inactive} />
            {unreadCount > 0 && (
              <View className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-error-500 items-center justify-center px-1">
                <Text className="text-typography-0 text-[10px] font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}

        {showProfile && (
          <Pressable onPress={onProfilePress} className="ml-1">
            <View className="w-9 h-9 rounded-full bg-primary-50 items-center justify-center">
              <Text className="text-sm font-bold text-primary-600">{userInitial}</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default PrivateHeader;
