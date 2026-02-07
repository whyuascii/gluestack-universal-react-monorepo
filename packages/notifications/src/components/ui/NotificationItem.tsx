/**
 * NotificationItem Component
 *
 * A single notification row that works on both web and mobile.
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import { Pressable, View, Text, Platform } from "react-native";
import { Check, ChevronRight } from "lucide-react-native";
import type { NotificationItemProps } from "./types";
import { getNotificationIcon, formatRelativeTime } from "./types";

/**
 * NotificationItem displays a single notification with title, body, and timestamp.
 *
 * Usage:
 *   <NotificationItem
 *     notification={notification}
 *     onPress={(n) => handlePress(n)}
 *     onMarkAsRead={(id) => markAsRead(id)}
 *   />
 */
export function NotificationItem({
  notification,
  onPress,
  onMarkAsRead,
  isMarkingAsRead = false,
}: NotificationItemProps) {
  const { isRead, title, body, createdAt, type, data } = notification;
  const icon = getNotificationIcon((data?.type as string) || type);

  const handlePress = () => {
    onPress?.(notification);
  };

  const handleMarkAsRead = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const isWeb = Platform.OS === "web";
  const webTransition = isWeb ? "transition-all duration-200 ease-out" : "";

  const containerClass = `mx-4 my-1.5 rounded-2xl ${webTransition} ${
    isRead
      ? "bg-background-0 border border-outline-100"
      : "bg-primary-50 border border-primary-100 shadow-sm"
  }`;

  const webHoverClass = isWeb
    ? isRead
      ? "hover:bg-background-50 hover:border-outline-200 hover:shadow-sm cursor-pointer"
      : "hover:shadow-md hover:border-primary-200 cursor-pointer"
    : "";

  // On web, use a div with onClick to avoid nested button issues
  // Use role="button" instead of accessibilityRole="button" to prevent rendering as <button>
  if (isWeb) {
    return (
      <View
        className={`${containerClass} ${webHoverClass}`}
        onClick={handlePress}
        // @ts-expect-error - role is valid on web for accessibility
        role="button"
        tabIndex={0}
        aria-label={`${isRead ? "" : "Unread: "}${title}`}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlePress();
          }
        }}
      >
        <View className="flex-row items-start gap-4 p-4">
          {/* Icon */}
          <View
            className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm ${
              isRead ? "bg-background-100" : "bg-primary-100"
            }`}
          >
            <Text className="text-2xl">{icon}</Text>
          </View>

          {/* Content */}
          <View className="flex-1 min-w-0">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 min-w-0">
                <Text
                  className={`text-[15px] leading-snug ${
                    isRead ? "text-typography-700 font-medium" : "text-typography-900 font-semibold"
                  }`}
                  numberOfLines={2}
                >
                  {title}
                </Text>
              </View>
              {!isRead && (
                <View className="w-2.5 h-2.5 mt-1.5 rounded-full bg-primary-500 shadow-sm" />
              )}
            </View>

            {body && (
              <Text
                className="text-[13px] text-typography-500 mt-1.5 leading-relaxed"
                numberOfLines={2}
              >
                {body}
              </Text>
            )}

            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-xs text-typography-400 font-medium">
                {formatRelativeTime(createdAt)}
              </Text>

              {!isRead && onMarkAsRead && (
                <View
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleMarkAsRead();
                  }}
                  // @ts-expect-error - role is valid on web for accessibility
                  role="button"
                  tabIndex={0}
                  aria-label="Mark as read"
                  aria-disabled={isMarkingAsRead}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMarkAsRead();
                    }
                  }}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-0/80 border border-outline-200 hover:bg-background-100 hover:border-outline-300 transition-colors duration-150 cursor-pointer"
                >
                  <Check
                    size={14}
                    color={isMarkingAsRead ? "#D1D5DB" : "#6b7280"}
                    strokeWidth={2.5}
                  />
                  <Text className="text-xs text-typography-600 font-medium">
                    {isMarkingAsRead ? "..." : "Done"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {notification.deepLink && (
            <View className="justify-center">
              <ChevronRight size={18} color="#d1d5db" />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Native implementation
  return (
    <Pressable
      onPress={handlePress}
      className={`${containerClass} active:opacity-80`}
      accessibilityRole="button"
      accessibilityLabel={`${isRead ? "" : "Unread: "}${title}`}
    >
      <View className="flex-row items-start gap-4 p-4">
        <View
          className={`w-12 h-12 rounded-2xl items-center justify-center ${
            isRead ? "bg-background-100" : "bg-primary-100"
          }`}
        >
          <Text className="text-2xl">{icon}</Text>
        </View>

        <View className="flex-1 min-w-0">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 min-w-0">
              <Text
                className={`text-[15px] leading-snug ${
                  isRead ? "text-typography-700 font-medium" : "text-typography-900 font-semibold"
                }`}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
            {!isRead && <View className="w-2.5 h-2.5 mt-1.5 rounded-full bg-primary-500" />}
          </View>

          {body && (
            <Text
              className="text-[13px] text-typography-500 mt-1.5 leading-relaxed"
              numberOfLines={2}
            >
              {body}
            </Text>
          )}

          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-xs text-typography-400 font-medium">
              {formatRelativeTime(createdAt)}
            </Text>

            {!isRead && onMarkAsRead && (
              <Pressable
                onPress={() => handleMarkAsRead()}
                disabled={isMarkingAsRead}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-background-0 border border-outline-200 active:bg-background-100"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Mark as read"
                accessibilityRole="button"
              >
                <Check
                  size={14}
                  color={isMarkingAsRead ? "#D1D5DB" : "#6b7280"}
                  strokeWidth={2.5}
                />
                <Text className="text-xs text-typography-600 font-medium">
                  {isMarkingAsRead ? "..." : "Done"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {notification.deepLink && (
          <View className="justify-center">
            <ChevronRight size={18} color="#d1d5db" />
          </View>
        )}
      </View>
    </Pressable>
  );
}
