import React from "react";
import { useNotifications } from "../hooks/useNotifications";

export interface NotificationBellProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  badgeColor?: string;
  showBadge?: boolean;
}

/**
 * NotificationBell component
 * Displays a bell icon with an optional badge showing unread count
 *
 * Note: This is a basic implementation. You should customize it to match your design system
 * or use components from @app/components
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  onPress,
  size = 24,
  color = "#374151",
  badgeColor = "#EF4444",
  showBadge = true,
}) => {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onPress}
      className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      {/* Bell Icon - Using a simple SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Badge */}
      {showBadge && unreadCount > 0 && (
        <span
          className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: badgeColor }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};
