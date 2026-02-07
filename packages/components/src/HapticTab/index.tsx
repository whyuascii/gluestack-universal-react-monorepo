/**
 * HapticTab Component
 *
 * A tab bar button wrapper that provides haptic feedback on press.
 * Use with @react-navigation/bottom-tabs for enhanced mobile UX.
 *
 * @example
 * ```tsx
 * import { HapticTab } from "@app/components";
 *
 * <Tabs
 *   screenOptions={{
 *     tabBarButton: HapticTab,
 *   }}
 * >
 *   <Tabs.Screen name="home" />
 *   <Tabs.Screen name="settings" />
 * </Tabs>
 * ```
 */

import React from "react";
import { type GestureResponderEvent, Platform, Pressable, type PressableProps } from "react-native";

// Conditionally import haptics to avoid web errors
// Use dynamic import to satisfy ESLint no-require-imports rule
let HapticsModule: typeof import("expo-haptics") | null = null;
let HapticsPromise: Promise<typeof import("expo-haptics") | null> | null = null;

if (Platform.OS !== "web") {
  HapticsPromise = import("expo-haptics")
    .then((m) => {
      HapticsModule = m;
      return m;
    })
    .catch(() => null);
}

export type HapticFeedbackStyle = "light" | "medium" | "heavy" | "soft" | "rigid";

export interface HapticTabProps extends PressableProps {
  /** Type of haptic feedback (default: "light") */
  hapticStyle?: HapticFeedbackStyle;
  /** Disable haptic feedback */
  disableHaptics?: boolean;
}

/**
 * Map our simplified styles to expo-haptics ImpactFeedbackStyle
 */
const getHapticStyle = (style: HapticFeedbackStyle) => {
  if (!HapticsModule) return null;

  const styleMap: Record<
    HapticFeedbackStyle,
    (typeof HapticsModule.ImpactFeedbackStyle)[keyof typeof HapticsModule.ImpactFeedbackStyle]
  > = {
    light: HapticsModule.ImpactFeedbackStyle.Light,
    medium: HapticsModule.ImpactFeedbackStyle.Medium,
    heavy: HapticsModule.ImpactFeedbackStyle.Heavy,
    soft: HapticsModule.ImpactFeedbackStyle.Soft,
    rigid: HapticsModule.ImpactFeedbackStyle.Rigid,
  };

  return styleMap[style];
};

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (style: HapticFeedbackStyle = "light") => {
  if (Platform.OS === "web") return;

  // Wait for Haptics to load if not loaded yet
  if (!HapticsModule && HapticsPromise) {
    await HapticsPromise;
  }

  if (!HapticsModule) return;

  try {
    const hapticStyle = getHapticStyle(style);
    if (hapticStyle !== null) {
      await HapticsModule.impactAsync(hapticStyle);
    }
  } catch (error) {
    // Silently fail if haptics not available
    console.warn("Haptic feedback not available:", error);
  }
};

/**
 * Trigger selection haptic (for toggles, checkboxes)
 */
export const triggerSelectionHaptic = async () => {
  if (Platform.OS === "web") return;

  // Wait for Haptics to load if not loaded yet
  if (!HapticsModule && HapticsPromise) {
    await HapticsPromise;
  }

  if (!HapticsModule) return;

  try {
    await HapticsModule.selectionAsync();
  } catch {
    // Silently fail
  }
};

/**
 * Trigger notification haptic (for success, warning, error)
 */
export const triggerNotificationHaptic = async (
  type: "success" | "warning" | "error" = "success"
) => {
  if (Platform.OS === "web") return;

  // Wait for Haptics to load if not loaded yet
  if (!HapticsModule && HapticsPromise) {
    await HapticsPromise;
  }

  if (!HapticsModule) return;

  try {
    const typeMap = {
      success: HapticsModule.NotificationFeedbackType.Success,
      warning: HapticsModule.NotificationFeedbackType.Warning,
      error: HapticsModule.NotificationFeedbackType.Error,
    };
    await HapticsModule.notificationAsync(typeMap[type]);
  } catch {
    // Silently fail
  }
};

/**
 * HapticTab - Tab bar button with haptic feedback
 *
 * Drop-in replacement for tab bar buttons that adds
 * haptic feedback on iOS and Android.
 */
export const HapticTab: React.FC<HapticTabProps> = ({
  hapticStyle = "light",
  disableHaptics = false,
  onPressIn,
  onPress,
  children,
  ...props
}) => {
  const handlePressIn = React.useCallback(
    (event: GestureResponderEvent) => {
      // Trigger haptic feedback on iOS (feels best on press-in)
      if (!disableHaptics && Platform.OS === "ios") {
        triggerHaptic(hapticStyle);
      }

      // Call original handler if provided
      onPressIn?.(event);
    },
    [disableHaptics, hapticStyle, onPressIn]
  );

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      // Trigger haptic feedback on Android (feels best on press)
      if (!disableHaptics && Platform.OS === "android") {
        triggerHaptic(hapticStyle);
      }

      // Call original handler if provided
      onPress?.(event);
    },
    [disableHaptics, hapticStyle, onPress]
  );

  return (
    <Pressable {...props} onPressIn={handlePressIn} onPress={handlePress}>
      {children}
    </Pressable>
  );
};

/**
 * Hook for adding haptic feedback to any component
 */
export const useHaptics = () => {
  return {
    impact: triggerHaptic,
    selection: triggerSelectionHaptic,
    notification: triggerNotificationHaptic,
    isAvailable: Platform.OS !== "web" && HapticsModule !== null,
  };
};

export default HapticTab;
