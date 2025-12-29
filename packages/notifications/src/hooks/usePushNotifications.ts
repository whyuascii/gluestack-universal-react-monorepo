import { useCallback, useEffect, useState } from "react";
import { useNotificationContext } from "../providers/NotificationProvider";
import { useNotificationStore } from "../stores/notificationStore";

/**
 * Hook to manage push notifications
 * Provides methods to subscribe, unsubscribe, and request permissions
 */
export const usePushNotifications = () => {
  const { pushService, isInitialized } = useNotificationContext();
  const { isPermissionGranted, isPushEnabled, setPermissionGranted, setPushEnabled } =
    useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check permission status on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (!pushService || !isInitialized) return;

      try {
        const enabled = await pushService.isEnabled();
        setPermissionGranted(enabled);
        setPushEnabled(enabled);
      } catch (err) {
        console.error("[usePushNotifications] Failed to check permissions:", err);
      }
    };

    checkPermissions();
  }, [pushService, isInitialized, setPermissionGranted, setPushEnabled]);

  /**
   * Request push notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!pushService) {
      setError(new Error("Push service not initialized"));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const granted = await pushService.requestPermissions();
      setPermissionGranted(granted);
      setPushEnabled(granted);
      return granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to request permissions");
      setError(error);
      console.error("[usePushNotifications] Failed to request permissions:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [pushService, setPermissionGranted, setPushEnabled]);

  /**
   * Subscribe user to push notifications
   */
  const subscribe = useCallback(
    async (userId: string): Promise<void> => {
      if (!pushService) {
        throw new Error("Push service not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        await pushService.subscribe(userId);
        setPushEnabled(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to subscribe");
        setError(error);
        console.error("[usePushNotifications] Failed to subscribe:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [pushService, setPushEnabled]
  );

  /**
   * Unsubscribe user from push notifications
   */
  const unsubscribe = useCallback(
    async (userId: string): Promise<void> => {
      if (!pushService) {
        throw new Error("Push service not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        await pushService.unsubscribe(userId);
        setPushEnabled(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to unsubscribe");
        setError(error);
        console.error("[usePushNotifications] Failed to unsubscribe:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [pushService, setPushEnabled]
  );

  /**
   * Get push token for the current device
   */
  const getPushToken = useCallback(async (): Promise<string | null> => {
    if (!pushService) {
      console.error("[usePushNotifications] Push service not initialized");
      return null;
    }

    try {
      return await pushService.getPushToken();
    } catch (err) {
      console.error("[usePushNotifications] Failed to get push token:", err);
      return null;
    }
  }, [pushService]);

  return {
    isPermissionGranted,
    isPushEnabled,
    isLoading,
    error,
    requestPermissions,
    subscribe,
    unsubscribe,
    getPushToken,
  };
};
