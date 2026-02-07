"use client";

/**
 * NotificationInboxContent
 *
 * Shared notification inbox content used by both web modal and mobile full-screen.
 * Modern, unified design with smooth animations.
 */

import { Bell, CheckCheck, ChevronRight, RefreshCw, X } from "lucide-react-native";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

// Types
interface NotificationData {
  id: string;
  title: string;
  body: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  deepLink?: string | null;
  data: Record<string, unknown> | null;
}

interface NotificationInboxContentProps {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
  onNotificationPress?: (notification: NotificationData) => void;
  onClose?: () => void;
  isMarkingAsRead?: string | null;
  isMarkingAllAsRead?: boolean;
  showCloseButton?: boolean;
}

// Helpers
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type?: string): string {
  const icons: Record<string, string> = {
    test: "🔔",
    welcome: "👋",
    invite: "✉️",
    member_joined: "👥",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    task: "📋",
    comment: "💬",
    mention: "👤",
    reminder: "⏰",
    payment: "💳",
    subscription: "⭐",
  };
  return icons[type || ""] || "📬";
}

const isWeb = Platform.OS === "web";

// Skeleton component
function NotificationSkeleton() {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#F5F5F4",
        borderWidth: 1,
        borderColor: "#E7E5E4",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          backgroundColor: "#E7E5E4",
        }}
      />
      <View style={{ flex: 1, gap: 8 }}>
        <View
          style={{
            height: 16,
            backgroundColor: "#E7E5E4",
            borderRadius: 8,
            width: "75%",
          }}
        />
        <View
          style={{
            height: 12,
            backgroundColor: "#F5F5F4",
            borderRadius: 6,
            width: "50%",
          }}
        />
        <View
          style={{
            height: 10,
            backgroundColor: "#F5F5F4",
            borderRadius: 4,
            width: 60,
            marginTop: 4,
          }}
        />
      </View>
    </View>
  );
}

// Empty state component
function EmptyState() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        paddingVertical: 64,
        paddingHorizontal: 32,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: "#F5F5F4",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Bell size={40} color="#A8A29E" strokeWidth={1.5} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#1C1917",
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        {t("notifications.empty.title", "You're all caught up!")}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#78716C",
          textAlign: "center",
        }}
      >
        {t("notifications.empty.message", "No new notifications")}
      </Text>
    </View>
  );
}

// Notification item component
function NotificationItem({
  notification,
  onPress,
  onMarkAsRead,
  isMarkingAsRead,
}: {
  notification: NotificationData;
  onPress?: () => void;
  onMarkAsRead: () => void;
  isMarkingAsRead: boolean;
}) {
  const icon = getNotificationIcon((notification.data?.type as string) || notification.type);
  const isUnread = !notification.isRead;

  const handleMarkAsRead = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    onMarkAsRead();
  };

  const containerStyle = {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    backgroundColor: isUnread ? "#FFF5F4" : "#FFFFFF",
    borderWidth: 1,
    borderColor: isUnread ? "#FFCFC9" : "#E7E5E4",
  };

  const content = (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
      {/* Icon */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          backgroundColor: isUnread ? "#FFE8E6" : "#F5F5F4",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              lineHeight: 20,
              color: isUnread ? "#1C1917" : "#44403C",
              fontWeight: isUnread ? "600" : "500",
            }}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          {isUnread && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#F97066",
                marginTop: 4,
              }}
            />
          )}
        </View>

        {notification.body && (
          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              color: "#78716C",
              marginTop: 4,
            }}
            numberOfLines={2}
          >
            {notification.body}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#A8A29E",
              fontWeight: "500",
            }}
          >
            {formatRelativeTime(notification.createdAt)}
          </Text>

          {isUnread && (
            <Pressable
              onPress={handleMarkAsRead}
              disabled={isMarkingAsRead}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderWidth: 1,
                borderColor: "#E7E5E4",
                opacity: isMarkingAsRead ? 0.5 : 1,
              }}
            >
              <CheckCheck size={14} color="#78716C" strokeWidth={2.5} />
              <Text
                style={{
                  fontSize: 12,
                  color: "#44403C",
                  fontWeight: "500",
                }}
              >
                {isMarkingAsRead ? "..." : "Done"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Chevron for deep links */}
      {notification.deepLink && (
        <View style={{ justifyContent: "center", paddingLeft: 4 }}>
          <ChevronRight size={18} color="#D6D3D1" />
        </View>
      )}
    </View>
  );

  if (isWeb) {
    return (
      <View style={containerStyle} onClick={onPress} role="button" tabIndex={0}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [containerStyle, pressed && { opacity: 0.9 }]}
    >
      {content}
    </Pressable>
  );
}

// Main component
export function NotificationInboxContent({
  notifications,
  unreadCount,
  isLoading,
  isRefreshing = false,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
  onNotificationPress,
  onClose,
  isMarkingAsRead,
  isMarkingAllAsRead = false,
  showCloseButton = true,
}: NotificationInboxContentProps) {
  const { t } = useTranslation();

  const handleNotificationPress = useCallback(
    (notification: NotificationData) => {
      onNotificationPress?.(notification);
    },
    [onNotificationPress]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF9" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F5F5F4",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: "#F97066",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={24} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1C1917",
                letterSpacing: -0.3,
              }}
            >
              {t("notifications.title", "Notifications")}
            </Text>
            {unreadCount > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#F97066",
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                {t("notifications.unreadCount", "{{count}} unread", { count: unreadCount })}
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Refresh button */}
          <Pressable
            onPress={onRefresh}
            disabled={isRefreshing}
            style={{
              padding: 10,
              borderRadius: 12,
              backgroundColor: "#F5F5F4",
              opacity: isRefreshing ? 0.7 : 1,
            }}
            accessibilityLabel={t("notifications.refresh", "Refresh")}
          >
            {isWeb ? (
              <View
                className={isRefreshing ? "animate-spin" : ""}
                style={{ width: 18, height: 18 }}
              >
                <RefreshCw size={18} color="#78716C" />
              </View>
            ) : (
              <RefreshCw size={18} color="#78716C" />
            )}
          </Pressable>

          {/* Close button (web modal only) */}
          {showCloseButton && onClose && (
            <Pressable
              onPress={onClose}
              style={{
                padding: 10,
                borderRadius: 12,
                backgroundColor: "#F5F5F4",
              }}
              accessibilityLabel={t("notifications.close", "Close")}
            >
              <X size={18} color="#78716C" strokeWidth={2.5} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Mark All as Read */}
      {unreadCount > 0 && !isLoading && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#F5F5F4",
          }}
        >
          <Pressable
            onPress={onMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              paddingHorizontal: 20,
              paddingVertical: 14,
              backgroundColor: pressed ? "#E85A50" : "#F97066",
              borderRadius: 16,
              opacity: isMarkingAllAsRead ? 0.6 : 1,
            })}
          >
            {isMarkingAllAsRead ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text
              style={{
                fontSize: 15,
                color: "#FFFFFF",
                fontWeight: "600",
              }}
            >
              {isMarkingAllAsRead
                ? t("notifications.markingAllRead", "Marking all as read...")
                : t("notifications.markAllRead", `Mark all ${unreadCount} as read`)}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#F97066"
            colors={["#F97066"]}
          />
        }
      >
        {isLoading ? (
          // Loading skeletons
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : error ? (
          // Error state
          <View
            style={{
              paddingVertical: 48,
              paddingHorizontal: 32,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1C1917",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {t("notifications.error.title", "Couldn't load notifications")}
            </Text>
            <Pressable
              onPress={onRefresh}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: "#F97066",
                borderRadius: 12,
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {t("notifications.error.retry", "Try again")}
              </Text>
            </Pressable>
          </View>
        ) : notifications.length === 0 ? (
          // Empty state
          <EmptyState />
        ) : (
          // Notification list
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onMarkAsRead={() => onMarkAsRead(notification.id)}
                isMarkingAsRead={isMarkingAsRead === notification.id}
              />
            ))}

            {/* Footer count */}
            <View
              style={{
                paddingVertical: 20,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#A8A29E",
                  fontWeight: "500",
                }}
              >
                {notifications.length === 1
                  ? t("notifications.totalCount", "1 notification")
                  : t("notifications.totalCount_plural", `${notifications.length} notifications`, {
                      count: notifications.length,
                    })}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Web-only CSS for animations */}
      {isWeb && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .animate-spin {
                animation: spin 1s linear infinite;
              }
            `,
          }}
        />
      )}
    </View>
  );
}

export default NotificationInboxContent;
