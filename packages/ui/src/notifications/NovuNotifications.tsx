"use client";

/**
 * NovuNotifications Component
 *
 * Unified notification system for web and mobile.
 * - Web: Bell icon triggers centered modal overlay
 * - Mobile: Bell icon triggers full-screen inbox
 */

import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotificationList,
  useUnreadCount,
} from "@app/notifications";
import { Bell } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, Platform, Pressable, Text, View } from "react-native";
import { NotificationInboxContent } from "./NotificationInboxContent";

const isWeb = Platform.OS === "web";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export interface NovuNotificationsProps {
  bellSize?: "sm" | "md" | "lg";
}

// Animated badge component
function AnimatedBadge({ count }: { count: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > 0 && count !== prevCount.current) {
      // Pop animation when count changes
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();
    } else if (count > 0 && prevCount.current === 0) {
      // First time showing badge
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
    prevCount.current = count;
  }, [count, scaleAnim, pulseAnim]);

  if (count === 0) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        minWidth: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
        backgroundColor: "#F97066",
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 11,
          fontWeight: "700",
        }}
      >
        {count > 99 ? "99+" : count}
      </Text>
    </Animated.View>
  );
}

export function NovuNotifications({ bellSize = "md" }: NovuNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isWeb ? 20 : screenWidth)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Data hooks
  const {
    data: notificationData,
    isLoading,
    refetch,
    isRefetching,
    error,
  } = useNotificationList({
    limit: 50,
    pollingInterval: 10000,
  });

  const { data: unreadData } = useUnreadCount({
    pollingInterval: 5000,
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = notificationData?.notifications || [];
  const unreadCount = unreadData?.count || 0;

  // Animation handlers
  const openModal = useCallback(() => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isWeb ? 20 : screenWidth,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Keyboard handler for web
  useEffect(() => {
    if (!isWeb || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const iconSize = bellSize === "sm" ? 18 : bellSize === "md" ? 22 : 26;

  // Render modal content
  const renderModalContent = () => (
    <NotificationInboxContent
      notifications={notifications}
      unreadCount={unreadCount}
      isLoading={isLoading}
      isRefreshing={isRefetching}
      error={error?.message}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onRefresh={refetch}
      onClose={closeModal}
      isMarkingAsRead={markAsReadMutation.isPending ? markAsReadMutation.variables : null}
      isMarkingAllAsRead={markAllAsReadMutation.isPending}
      showCloseButton={isWeb}
    />
  );

  return (
    <>
      {/* Bell Button */}
      <Pressable
        onPress={openModal}
        style={({ pressed }) => ({
          position: "relative",
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          backgroundColor: pressed ? "#E7E5E4" : "#F5F5F4",
          borderWidth: 1,
          borderColor: "#E7E5E4",
        })}
        accessibilityLabel={
          unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"
        }
        accessibilityRole="button"
      >
        <Bell
          size={iconSize}
          color={unreadCount > 0 ? "#1C1917" : "#78716C"}
          strokeWidth={unreadCount > 0 ? 2.2 : 2}
        />
        <AnimatedBadge count={unreadCount} />
      </Pressable>

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        {isWeb ? (
          // Web: Centered modal with backdrop
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            {/* Backdrop */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(28, 25, 23, 0.5)",
                opacity: fadeAnim,
              }}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={closeModal}
                accessibilityLabel="Close notifications"
              />
            </Animated.View>

            {/* Modal Content */}
            <Animated.View
              style={{
                width: "100%",
                maxWidth: 448,
                maxHeight: screenHeight * 0.85,
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                overflow: "hidden",
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                // Web shadow
                ...(isWeb && {
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }),
              }}
            >
              {renderModalContent()}
            </Animated.View>

            {/* Web-only CSS animations */}
            {isWeb && (
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    @supports (backdrop-filter: blur(8px)) {
                      [data-backdrop] {
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                      }
                    }
                  `,
                }}
              />
            )}
          </View>
        ) : (
          // Mobile: Full-screen slide from right
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "#FAFAF9",
              transform: [{ translateX: slideAnim }],
            }}
          >
            {renderModalContent()}
          </Animated.View>
        )}
      </Modal>
    </>
  );
}

export default NovuNotifications;
