import React, { useEffect } from "react";
import { useInAppNotifications } from "../hooks/useInAppNotifications";
import type { InAppNotification } from "../types";

export interface NotificationToastProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxVisible?: number;
}

/**
 * NotificationToast component
 * Displays in-app notifications as toast messages
 *
 * Note: This is a basic implementation. You should customize it to match your design system
 * or integrate with a toast library like react-hot-toast or sonner
 */
export const NotificationToast: React.FC<NotificationToastProps> = ({
  position = "top-right",
  maxVisible = 3,
}) => {
  const { notifications, dismiss, read } = useInAppNotifications();

  // Only show the most recent notifications
  const visibleNotifications = notifications.slice(0, maxVisible);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none`}
    >
      {visibleNotifications.map((notification) => (
        <NotificationToastItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismiss(notification.id)}
          onRead={() => read(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationToastItemProps {
  notification: InAppNotification;
  onDismiss: () => void;
  onRead: () => void;
}

const NotificationToastItem: React.FC<NotificationToastItemProps> = ({
  notification,
  onDismiss,
  onRead,
}) => {
  useEffect(() => {
    // Mark as read when notification is displayed
    if (!notification.read) {
      onRead();
    }
  }, [notification.read, onRead]);

  const priorityColors = {
    low: "bg-gray-50 border-gray-200",
    normal: "bg-blue-50 border-blue-200",
    high: "bg-orange-50 border-orange-200",
    urgent: "bg-red-50 border-red-200",
  };

  const iconColors = {
    low: "text-gray-600",
    normal: "text-blue-600",
    high: "text-orange-600",
    urgent: "text-red-600",
  };

  const priority = notification.priority || "normal";

  return (
    <div
      className={`${priorityColors[priority]} border rounded-lg shadow-lg p-4 pointer-events-auto animate-in slide-in-from-right-full duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${iconColors[priority]} flex-shrink-0`}>
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
          <p className="mt-1 text-sm text-gray-700">{notification.message}</p>

          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              onClick={onDismiss}
            >
              View Details →
            </a>
          )}
        </div>

        {/* Dismiss Button */}
        {notification.dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
