/**
 * Notification UI Component Types
 */

/**
 * Notification from our API (normalized format)
 */
export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
  deepLink: string | null;
  data: Record<string, unknown> | null;
}

/**
 * Props for notification bell component
 */
export interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount: number;
  /** Whether count is loading */
  isLoading?: boolean;
  /** Callback when bell is pressed */
  onPress?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

/**
 * Props for notification item component
 */
export interface NotificationItemProps {
  /** The notification to display */
  notification: AppNotification;
  /** Callback when notification is pressed */
  onPress?: (notification: AppNotification) => void;
  /** Callback to mark as read */
  onMarkAsRead?: (notificationId: string) => void;
  /** Whether mark as read is in progress */
  isMarkingAsRead?: boolean;
}

/**
 * Props for notification list component
 */
export interface NotificationListProps {
  /** List of notifications */
  notifications: AppNotification[];
  /** Whether list is loading */
  isLoading?: boolean;
  /** Whether list is refreshing (pull-to-refresh) */
  isRefreshing?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Callback when notification is pressed */
  onNotificationPress?: (notification: AppNotification) => void;
  /** Callback to mark notification as read */
  onMarkAsRead?: (notificationId: string) => void;
  /** Callback to mark all as read */
  onMarkAllAsRead?: () => void;
  /** Callback to refresh list */
  onRefresh?: () => void;
  /** Number of unread notifications */
  unreadCount?: number;
  /** Whether mark all as read is in progress */
  isMarkingAllAsRead?: boolean;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
}

/**
 * Props for notification inbox (full inbox with header)
 */
export interface NotificationInboxProps extends NotificationListProps {
  /** Title for the inbox header */
  title?: string;
  /** Callback when close is pressed */
  onClose?: () => void;
  /** Hide the built-in header (useful when used inside a modal with its own header) */
  hideHeader?: boolean;
}

/**
 * Notification icon type mapping
 */
export type NotificationIconType =
  | "default"
  | "test"
  | "welcome"
  | "invite"
  | "member_joined"
  | "success"
  | "warning"
  | "error";

/**
 * Get emoji icon for notification type
 */
export function getNotificationIcon(type: string): string {
  switch (type) {
    case "test":
      return "🔔";
    case "welcome":
      return "👋";
    case "invite":
      return "✉️";
    case "member_joined":
      return "👥";
    case "success":
      return "✅";
    case "warning":
      return "⚠️";
    case "error":
      return "❌";
    default:
      return "📬";
  }
}

/**
 * Format relative time for notifications
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return then.toLocaleDateString();
}
