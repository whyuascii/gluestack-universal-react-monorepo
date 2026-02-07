/**
 * Notification Stream Hook
 *
 * Connects to SSE endpoint for real-time notification delivery.
 * Automatically reconnects on disconnect and invalidates queries on new notifications.
 */

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_QUERY_KEYS } from "./queries";

function getApiUrl(): string {
  // Next.js (web)
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Expo (mobile)
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallback
  return "http://localhost:3030";
}

export interface NotificationStreamOptions {
  /** Whether to connect to the stream */
  enabled?: boolean;
  /** Callback when a new notification arrives */
  onNotification?: (notification: unknown) => void;
}

/**
 * Hook to subscribe to real-time notifications via SSE
 *
 * @example
 * useNotificationStream({
 *   enabled: isAuthenticated,
 *   onNotification: (notification) => toast(notification.title)
 * });
 */
export function useNotificationStream(options: NotificationStreamOptions = {}) {
  const { enabled = true, onNotification } = options;
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const apiUrl = getApiUrl();
    const streamUrl = `${apiUrl}/api/notifications/stream`;

    try {
      const eventSource = new EventSource(streamUrl, {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log("[NotificationStream] Connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "new":
              // New notification - invalidate all queries and call callback
              queryClient.invalidateQueries({
                queryKey: NOTIFICATION_QUERY_KEYS.all,
              });
              onNotification?.(data.notification);
              break;

            case "read":
            case "archived":
            case "refresh":
              // State changed - invalidate queries to refresh UI
              queryClient.invalidateQueries({
                queryKey: NOTIFICATION_QUERY_KEYS.all,
              });
              break;

            case "connected":
              // Initial connection message - no action needed
              break;

            default:
              console.log("[NotificationStream] Unknown event type:", data.type);
          }
        } catch (error) {
          console.error("[NotificationStream] Failed to parse message:", error);
        }
      };

      eventSource.onerror = () => {
        console.log("[NotificationStream] Connection error, reconnecting...");
        eventSource.close();
        eventSourceRef.current = null;

        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("[NotificationStream] Failed to connect:", error);
    }
  }, [enabled, onNotification, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected: !!eventSourceRef.current,
    reconnect: connect,
  };
}
