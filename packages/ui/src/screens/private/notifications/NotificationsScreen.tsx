"use client";

/**
 * NotificationsScreen - Full notifications list (private, authenticated)
 *
 * Mobile-focused screen for viewing all notifications.
 * Web typically uses dropdown, but this screen works for both.
 */

import type { Session } from "@app/auth";
import {
  useNotificationList,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  formatRelativeTime,
  type AppNotification,
} from "@app/notifications";
import { Bell, Check, CheckCheck, RefreshCw } from "lucide-react-native";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

export interface NotificationsScreenProps {
  session: Session | null;
  onNotificationPress?: (notification: { id: string; deepLink?: string }) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  session,
  onNotificationPress,
}) => {
  const { t } = useTranslation("common");
  const { width: screenWidth } = useWindowDimensions();

  const isSmallScreen = screenWidth < 380;
  const horizontalPadding = isSmallScreen ? 16 : 24;

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useNotificationList({ limit: 100 });

  const { data: unreadData } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = notificationsData?.notifications ?? [];
  const unreadCount = unreadData?.count ?? 0;

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      if (!notification.isRead) {
        markAsReadMutation.mutate(notification.id);
      }
      onNotificationPress?.({ id: notification.id, deepLink: notification.deepLink ?? undefined });
    },
    [markAsReadMutation, onNotificationPress]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.notificationUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.notificationDot, !isUnread && styles.notificationDotRead]} />
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {item.body && <Text style={styles.notificationBody}>{item.body}</Text>}
            <Text style={styles.notificationTime}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
          {isUnread && (
            <TouchableOpacity
              style={styles.markReadButton}
              onPress={() => markAsReadMutation.mutate(item.id)}
              activeOpacity={0.7}
            >
              <Check size={16} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>{t("notifications.loading", "Loading...")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
            {t("notifications.title", "Notifications")}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => refetch()}
            disabled={isRefetching}
            activeOpacity={0.7}
          >
            <RefreshCw size={18} color={isRefetching ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              activeOpacity={0.7}
            >
              <CheckCheck size={18} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error State */}
      {error && (
        <View style={[styles.errorBanner, { marginHorizontal: horizontalPadding }]}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={48} color="#d1d5db" />
          <Text style={styles.emptyStateText}>
            {t("notifications.empty", "No notifications yet")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  titleSmall: {
    fontSize: 20,
  },
  badge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    color: "#9ca3af",
    fontSize: 16,
  },
  notificationItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  notificationUnread: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
    marginTop: 6,
    marginRight: 12,
  },
  notificationDotRead: {
    backgroundColor: "#d1d5db",
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  markReadButton: {
    padding: 8,
  },
});

export default NotificationsScreen;
