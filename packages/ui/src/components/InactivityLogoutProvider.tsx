/**
 * Inactivity Logout Provider (Web Only)
 *
 * Wraps the app and automatically logs out users after 15 minutes of inactivity.
 * Only active when user is authenticated.
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Platform } from "react-native";
import { useInactivityLogout, useLogout } from "../hooks/auth";

interface InactivityLogoutContextValue {
  /** Time remaining until auto-logout (in seconds) */
  timeRemaining: number | null;
  /** Whether warning is being shown */
  isWarningVisible: boolean;
  /** Dismiss warning and reset timer */
  dismissWarning: () => void;
}

const InactivityLogoutContext = createContext<InactivityLogoutContextValue>({
  timeRemaining: null,
  isWarningVisible: false,
  dismissWarning: () => {},
});

export const useInactivityWarning = () => useContext(InactivityLogoutContext);

interface InactivityLogoutProviderProps {
  children: React.ReactNode;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Callback when logout occurs (for navigation) */
  onLogout?: () => void;
  /** Timeout in minutes (default: 15) */
  timeoutMinutes?: number;
  /** Whether to show warning before logout (default: true) */
  showWarning?: boolean;
  /** Seconds before logout to show warning (default: 60) */
  warningSeconds?: number;
}

export function InactivityLogoutProvider({
  children,
  isAuthenticated,
  onLogout,
  timeoutMinutes = 15,
  showWarning = true,
  warningSeconds = 60,
}: InactivityLogoutProviderProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  const { logout } = useLogout({
    onSuccess: () => {
      setIsWarningVisible(false);
      setTimeRemaining(null);
      onLogout?.();
    },
  });

  const handleInactivityLogout = useCallback(() => {
    console.log("[InactivityLogout] Auto-logout triggered");
    logout();
  }, [logout]);

  const handleWarning = useCallback(
    (seconds: number) => {
      setTimeRemaining(seconds);
      if (showWarning && !isWarningVisible) {
        setIsWarningVisible(true);
      }
    },
    [showWarning, isWarningVisible]
  );

  const handleActivity = useCallback(() => {
    // Reset warning state on activity
    if (isWarningVisible) {
      setIsWarningVisible(false);
      setTimeRemaining(null);
    }
  }, [isWarningVisible]);

  const { resetTimer } = useInactivityLogout({
    timeout: timeoutMinutes * 60 * 1000,
    onInactivityLogout: handleInactivityLogout,
    enabled: isAuthenticated && Platform.OS === "web",
    onWarning: handleWarning,
    onActivity: handleActivity,
    warningThreshold: warningSeconds,
  });

  const dismissWarning = useCallback(() => {
    setIsWarningVisible(false);
    setTimeRemaining(null);
    resetTimer();
  }, [resetTimer]);

  return (
    <InactivityLogoutContext.Provider
      value={{
        timeRemaining,
        isWarningVisible,
        dismissWarning,
      }}
    >
      {children}
    </InactivityLogoutContext.Provider>
  );
}
