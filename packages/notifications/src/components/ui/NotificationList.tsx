/**
 * NotificationList Component
 *
 * A scrollable list of notifications with loading, empty, and error states.
 * Works on both web and mobile via React Native.
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { CheckCheck } from "lucide-react-native";
import { EmptyNotifications, GeneralError } from "@app/components";
import { NotificationItem } from "./NotificationItem";
import type { NotificationListProps, AppNotification } from "./types";

const isWeb = Platform.OS === "web";

/**
 * Loading skeleton for notifications
 */
function NotificationSkeleton() {
  return (
    <View className="mx-4 my-1.5 p-4 rounded-2xl bg-background-50 border border-outline-100">
      <View className="flex-row items-start gap-4">
        <View className="w-12 h-12 rounded-2xl bg-background-200/80" />
        <View className="flex-1 pt-0.5">
          <View className="h-4 bg-background-200/80 rounded-lg w-4/5 mb-3" />
          <View className="h-3 bg-background-100 rounded-lg w-3/5 mb-2" />
          <View className="h-2.5 bg-background-100 rounded-lg w-24 mt-2" />
        </View>
      </View>
    </View>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <View className="flex-1 pt-2">
      <NotificationSkeleton />
      <NotificationSkeleton />
      <NotificationSkeleton />
      <NotificationSkeleton />
    </View>
  );
}

/**
 * Mark all as read button
 */
function MarkAllAsReadButton({
  unreadCount,
  onPress,
  isLoading,
}: {
  unreadCount: number;
  onPress: () => void;
  isLoading?: boolean;
}) {
  if (unreadCount === 0) return null;

  const webHoverClass = isWeb
    ? "hover:bg-primary-600 hover:shadow-md transition-all duration-200"
    : "";

  return (
    <View className="px-4 py-3">
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        className={`flex-row items-center justify-center gap-2 px-5 py-3 bg-primary-500 rounded-xl shadow-sm active:bg-primary-600 ${webHoverClass}`}
        accessibilityLabel={`Mark all ${unreadCount} notifications as read`}
        accessibilityRole="button"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
        )}
        <Text className="text-sm text-typography-0 font-semibold">
          {isLoading ? "Marking all as read..." : `Mark all ${unreadCount} as read`}
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * NotificationList displays a scrollable list of notifications.
 *
 * Usage:
 *   <NotificationList
 *     notifications={notifications}
 *     isLoading={isLoading}
 *     error={error?.message}
 *     onNotificationPress={handlePress}
 *     onMarkAsRead={handleMarkAsRead}
 *     onMarkAllAsRead={handleMarkAllAsRead}
 *     onRefresh={refetch}
 *     unreadCount={unreadCount}
 *   />
 */
export function NotificationList({
  notifications,
  isLoading = false,
  isRefreshing = false,
  error,
  onNotificationPress,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
  unreadCount = 0,
  isMarkingAllAsRead = false,
  emptyTitle,
  emptyDescription,
}: NotificationListProps) {
  if (isLoading && notifications.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <GeneralError
        title="Couldn't load notifications"
        message={error || "Something went wrong. Pull down to try again."}
        onRetry={onRefresh}
        compact
      />
    );
  }

  if (notifications.length === 0) {
    return <EmptyNotifications title={emptyTitle} message={emptyDescription} />;
  }

  const renderItem = ({ item }: { item: AppNotification }) => (
    <NotificationItem
      notification={item}
      onPress={onNotificationPress}
      onMarkAsRead={onMarkAsRead}
    />
  );

  const renderHeader = () => {
    if (onMarkAllAsRead && unreadCount > 0) {
      return (
        <MarkAllAsReadButton
          unreadCount={unreadCount}
          onPress={onMarkAllAsRead}
          isLoading={isMarkingAllAsRead}
        />
      );
    }
    return null;
  };

  const renderFooter = () => (
    <View className="py-6 items-center">
      <Text className="text-xs text-typography-400 font-medium">
        {notifications.length > 0
          ? `${notifications.length} notification${notifications.length === 1 ? "" : "s"}`
          : ""}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 16 }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#f97316"]}
            tintColor="#f97316"
          />
        ) : undefined
      }
    />
  );
}
