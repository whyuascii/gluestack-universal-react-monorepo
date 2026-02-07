/**
 * Notification Query Hooks
 *
 * TanStack Query hooks for fetching notification data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationOrpc } from "./client";
import type { AppNotification } from "../components/ui/types";

// =============================================================================
// QUERY KEYS
// =============================================================================

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  inbox: (limit?: number) => [...NOTIFICATION_QUERY_KEYS.all, "inbox", limit] as const,
  unreadCount: () => [...NOTIFICATION_QUERY_KEYS.all, "unread-count"] as const,
  subscriberHash: () => [...NOTIFICATION_QUERY_KEYS.all, "subscriber-hash"] as const,
};

// =============================================================================
// TRANSFORM FUNCTION
// =============================================================================

/**
 * Transform API notification response to AppNotification format
 */
function transformNotification(apiNotification: {
  id: string;
  title: string;
  body?: string | null;
  type: string;
  readAt?: Date | string | null;
  createdAt: Date | string;
  archivedAt?: Date | string | null;
  deepLink?: string | null;
  data?: Record<string, unknown> | null;
}): AppNotification {
  return {
    id: apiNotification.id,
    title: apiNotification.title,
    body: apiNotification.body ?? null,
    type: apiNotification.type,
    isRead: !!apiNotification.readAt,
    readAt: apiNotification.readAt
      ? typeof apiNotification.readAt === "string"
        ? apiNotification.readAt
        : apiNotification.readAt.toISOString()
      : null,
    createdAt:
      typeof apiNotification.createdAt === "string"
        ? apiNotification.createdAt
        : apiNotification.createdAt.toISOString(),
    archivedAt: apiNotification.archivedAt
      ? typeof apiNotification.archivedAt === "string"
        ? apiNotification.archivedAt
        : apiNotification.archivedAt.toISOString()
      : null,
    deepLink: apiNotification.deepLink ?? null,
    data: apiNotification.data ?? null,
  };
}

// =============================================================================
// QUERIES
// =============================================================================

export interface UseNotificationsOptions {
  /** Number of notifications to fetch */
  limit?: number;
  /** Whether to enable polling (for mobile) */
  pollingInterval?: number;
  /** Whether query is enabled */
  enabled?: boolean;
}

/**
 * Hook to fetch notifications from the API
 *
 * @example
 * const { data, isLoading, refetch } = useNotifications({ limit: 50 });
 */
export function useNotificationList(options: UseNotificationsOptions = {}) {
  const { limit = 50, pollingInterval, enabled = true } = options;

  const queryOptions = notificationOrpc.private.notifications.inbox.queryOptions({ limit });

  return useQuery({
    ...queryOptions,
    queryKey: NOTIFICATION_QUERY_KEYS.inbox(limit),
    select: (result: {
      notifications: Array<Parameters<typeof transformNotification>[0]>;
      hasMore: boolean;
      nextCursor?: string | null;
    }) => ({
      notifications: (result.notifications || []).map((n) => transformNotification(n)),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    }),
    enabled,
    refetchInterval: pollingInterval,
    staleTime: 10000,
  });
}

export interface UseUnreadCountOptions {
  /** Whether to enable polling (for mobile) */
  pollingInterval?: number;
  /** Whether query is enabled */
  enabled?: boolean;
}

/**
 * Hook to get unread notification count
 *
 * @example
 * const { data } = useUnreadCount();
 * // data?.count is the unread count
 */
export function useUnreadCount(options: UseUnreadCountOptions = {}) {
  const { pollingInterval, enabled = true } = options;

  const queryOptions = notificationOrpc.private.notifications.unreadCount.queryOptions();

  return useQuery({
    ...queryOptions,
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    enabled,
    refetchInterval: pollingInterval,
    staleTime: 10000,
  });
}

/**
 * Hook to fetch the Novu subscriber hash for secure client authentication
 */
export function useSubscriberHash(options?: { enabled?: boolean }) {
  return useQuery({
    ...notificationOrpc.private.notifications.getSubscriberHash.queryOptions(),
    queryKey: NOTIFICATION_QUERY_KEYS.subscriberHash(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
}

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Hook to mark a single notification as read
 *
 * @example
 * const mutation = useMarkAsRead();
 * mutation.mutate("notification-id");
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return notificationOrpc.private.notifications.markAsRead.call({ notificationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 *
 * @example
 * const mutation = useMarkAllAsRead();
 * mutation.mutate();
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return notificationOrpc.private.notifications.markAllAsRead.call();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to archive a notification
 *
 * @example
 * const mutation = useArchiveNotification();
 * mutation.mutate("notification-id");
 */
export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return notificationOrpc.private.notifications.archive.call({ notificationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}
