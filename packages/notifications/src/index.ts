/**
 * @app/notifications
 *
 * Cross-platform notification system with OneSignal integration
 * Supports push notifications, in-app notifications, and transactional/marketing campaigns
 *
 * @example
 * ```tsx
 * // Web app
 * import { NotificationProvider } from '@app/notifications/web';
 *
 * // Mobile app
 * import { NotificationProvider } from '@app/notifications/mobile';
 *
 * function App() {
 *   return (
 *     <NotificationProvider>
 *       <YourApp />
 *     </NotificationProvider>
 *   );
 * }
 * ```
 */

// Types
export * from "./types";

// Hooks
export { useNotifications } from "./hooks/useNotifications";
export { usePushNotifications } from "./hooks/usePushNotifications";
export { useInAppNotifications } from "./hooks/useInAppNotifications";

// Services
export { inAppNotificationService } from "./services/inApp";
export { transactionalNotificationService } from "./services/transactional";
export { marketingNotificationService } from "./services/marketing";

// Components
export { NotificationBell } from "./components/NotificationBell";
export { NotificationToast } from "./components/NotificationToast";

// Store
export { useNotificationStore } from "./stores/notificationStore";

// Config
export * from "./config/onesignal";
