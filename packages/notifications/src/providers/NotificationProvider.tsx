import React, { createContext, useContext, useEffect, useState } from "react";
import type { PushNotificationService } from "../types";

interface NotificationContextValue {
  pushService: PushNotificationService | null;
  isInitialized: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  pushService: null,
  isInitialized: false,
});

/**
 * Base NotificationProvider - should not be used directly
 * Use NotificationProvider from @app/notifications/web or @app/notifications/mobile
 */
export interface NotificationProviderProps {
  children: React.ReactNode;
  pushService: PushNotificationService;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pushService,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await pushService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error("[NotificationProvider] Failed to initialize:", error);
      }
    };

    initializeNotifications();
  }, [pushService]);

  return (
    <NotificationContext.Provider value={{ pushService, isInitialized }}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access notification context
 */
export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }

  return context;
};
