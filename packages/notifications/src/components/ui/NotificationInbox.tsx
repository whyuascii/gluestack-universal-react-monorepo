/**
 * NotificationInbox Component
 *
 * Full inbox with header and notification list.
 * Can be used standalone or inside a modal/popover.
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
import { Bell, X } from "lucide-react-native";
import { NotificationList } from "./NotificationList";
import type { NotificationInboxProps } from "./types";

/**
 * NotificationInbox displays a full inbox with header and list.
 *
 * Usage:
 *   <NotificationInbox
 *     title="Notifications"
 *     notifications={notifications}
 *     unreadCount={unreadCount}
 *     onClose={() => setIsOpen(false)}
 *     onNotificationPress={handlePress}
 *     onMarkAsRead={handleMarkAsRead}
 *     onMarkAllAsRead={handleMarkAllAsRead}
 *     onRefresh={refetch}
 *   />
 */
export function NotificationInbox({
  title = "Notifications",
  onClose,
  notifications,
  isLoading,
  isRefreshing,
  error,
  onNotificationPress,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
  unreadCount = 0,
  isMarkingAllAsRead,
  emptyTitle,
  emptyDescription,
  hideHeader = false,
}: NotificationInboxProps) {
  return (
    <SafeAreaView className="flex-1 bg-background-50/30">
      {/* Header */}
      {!hideHeader && (
        <View className="flex-row items-center justify-between px-6 py-4 bg-background-0 border-b border-outline-100">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-xl bg-primary-500 items-center justify-center shadow-sm">
              <Bell size={22} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View>
              <Text className="text-xl font-bold text-typography-900">{title}</Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-primary-600 font-medium">{unreadCount} unread</Text>
              )}
            </View>
          </View>
          {onClose && (
            <Pressable
              onPress={onClose}
              className="p-2.5 rounded-xl bg-background-100 active:bg-background-200"
              accessibilityLabel="Close notifications"
              accessibilityRole="button"
            >
              <X size={20} color="#6B7280" strokeWidth={2.5} />
            </Pressable>
          )}
        </View>
      )}

      {/* Notification List */}
      <View className="flex-1">
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          error={error}
          onNotificationPress={onNotificationPress}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onRefresh={onRefresh}
          unreadCount={unreadCount}
          isMarkingAllAsRead={isMarkingAllAsRead}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      </View>
    </SafeAreaView>
  );
}
