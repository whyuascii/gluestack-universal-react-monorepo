import { useCallback } from "react";
import { AccessibilityInfo, Platform } from "react-native";

/**
 * Hook for making screen reader announcements.
 *
 * On mobile (iOS/Android), uses AccessibilityInfo.announceForAccessibility
 * to make VoiceOver/TalkBack announce the message.
 *
 * On web, announcements should be made via aria-live regions in the UI,
 * as there's no programmatic announcement API. This hook is a no-op on web.
 *
 * @example
 * ```tsx
 * const announce = useAccessibilityAnnounce();
 *
 * const handleSubmit = async () => {
 *   await submitForm();
 *   announce("Form submitted successfully");
 * };
 * ```
 */
export function useAccessibilityAnnounce() {
  return useCallback((message: string) => {
    if (Platform.OS !== "web") {
      AccessibilityInfo.announceForAccessibility(message);
    }
    // Web: Use aria-live regions in UI instead
    // This could be enhanced to update a visually-hidden live region if needed
  }, []);
}

/**
 * Hook for announcing screen reader messages with a delay.
 * Useful when you need to wait for UI to settle before announcing.
 *
 * @param delay - Delay in milliseconds before announcement (default: 100ms)
 *
 * @example
 * ```tsx
 * const announceDelayed = useAccessibilityAnnounceDelayed(500);
 *
 * const handleNavigation = () => {
 *   navigateTo("/dashboard");
 *   announceDelayed("Navigated to dashboard");
 * };
 * ```
 */
export function useAccessibilityAnnounceDelayed(delay = 100) {
  return useCallback(
    (message: string) => {
      if (Platform.OS !== "web") {
        setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(message);
        }, delay);
      }
    },
    [delay]
  );
}
