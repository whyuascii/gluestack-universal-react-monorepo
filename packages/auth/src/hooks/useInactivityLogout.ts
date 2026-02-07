/**
 * Inactivity Logout Hook (Web Only)
 *
 * Automatically logs out users after a period of inactivity.
 * Tracks mouse, keyboard, touch, and scroll events to detect activity.
 *
 * Default timeout: 15 minutes
 */

import { useEffect, useRef, useCallback } from "react";

// Universal platform detection (works in both web and React Native)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowRef = typeof window !== "undefined" ? (window as any) : undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const documentRef = typeof document !== "undefined" ? (document as any) : undefined;
const isWebPlatform = Boolean(windowRef && documentRef);

export interface UseInactivityLogoutOptions {
  /** Timeout in milliseconds (default: 15 minutes) */
  timeout?: number;
  /** Callback when inactivity timeout is reached */
  onInactivityLogout: () => void;
  /** Whether the hook is enabled (e.g., only when authenticated) */
  enabled?: boolean;
  /** Optional callback when activity is detected (for UI feedback) */
  onActivity?: () => void;
  /** Optional warning callback before logout (e.g., show modal) */
  onWarning?: (secondsRemaining: number) => void;
  /** Seconds before logout to trigger warning (default: 60) */
  warningThreshold?: number;
}

const DEFAULT_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const DEFAULT_WARNING_THRESHOLD = 60; // 60 seconds before logout

// Cross-platform timeout type
type TimeoutHandle = ReturnType<typeof setTimeout>;

/**
 * Hook for automatic logout after inactivity (web only)
 *
 * @example
 * ```tsx
 * const { logout } = useLogout();
 *
 * useInactivityLogout({
 *   timeout: 10 * 60 * 1000, // 10 minutes
 *   onInactivityLogout: logout,
 *   enabled: !!session,
 *   onWarning: (seconds) => showWarningModal(seconds),
 * });
 * ```
 */
export function useInactivityLogout({
  timeout = DEFAULT_TIMEOUT,
  onInactivityLogout,
  enabled = true,
  onActivity,
  onWarning,
  warningThreshold = DEFAULT_WARNING_THRESHOLD,
}: UseInactivityLogoutOptions) {
  const timeoutRef = useRef<TimeoutHandle | null>(null);
  const warningIntervalRef = useRef<TimeoutHandle | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Only run on web
  const isWeb = isWebPlatform;

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

  const startWarningCountdown = useCallback(() => {
    if (!onWarning) return;

    warningIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, Math.ceil((timeout - elapsed) / 1000));

      if (remaining <= warningThreshold && remaining > 0) {
        onWarning(remaining);
      }
    }, 1000);
  }, [onWarning, timeout, warningThreshold]);

  const resetTimer = useCallback(() => {
    if (!isWeb || !enabled) return;

    lastActivityRef.current = Date.now();
    clearTimers();

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onInactivityLogout();
    }, timeout);

    // Start warning countdown if warning callback provided
    if (onWarning) {
      const warningStart = timeout - warningThreshold * 1000;
      setTimeout(() => {
        if (enabled) {
          startWarningCountdown();
        }
      }, warningStart);
    }

    onActivity?.();
  }, [
    isWeb,
    enabled,
    timeout,
    onInactivityLogout,
    onActivity,
    onWarning,
    warningThreshold,
    clearTimers,
    startWarningCountdown,
  ]);

  useEffect(() => {
    // Only run on web and when enabled
    if (!isWeb || !enabled || !windowRef || !documentRef) {
      return;
    }

    // Events that indicate user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "visibilitychange",
    ];

    // Throttle activity detection to avoid excessive resets
    let throttleTimeout: TimeoutHandle | null = null;
    const throttledReset = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        resetTimer();
      }, 1000); // Throttle to once per second
    };

    // Handle visibility change specially
    const handleVisibilityChange = () => {
      if (documentRef!.visibilityState === "visible") {
        // Check if we should have logged out while tab was hidden
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= timeout) {
          onInactivityLogout();
        } else {
          resetTimer();
        }
      }
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      if (event === "visibilitychange") {
        documentRef!.addEventListener(event, handleVisibilityChange);
      } else {
        windowRef!.addEventListener(event, throttledReset, { passive: true });
      }
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimers();
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      activityEvents.forEach((event) => {
        if (event === "visibilitychange") {
          documentRef!.removeEventListener(event, handleVisibilityChange);
        } else {
          windowRef!.removeEventListener(event, throttledReset);
        }
      });
    };
  }, [isWeb, enabled, timeout, resetTimer, clearTimers, onInactivityLogout]);

  return {
    /** Manually reset the inactivity timer */
    resetTimer,
    /** Get time remaining until logout (in ms) */
    getTimeRemaining: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      return Math.max(0, timeout - elapsed);
    },
  };
}
