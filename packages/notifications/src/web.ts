/**
 * @app/notifications/web
 *
 * Web-specific exports for the notifications package
 * Uses OneSignal web SDK (react-onesignal)
 *
 * @example
 * ```tsx
 * import { NotificationProvider, usePushNotifications } from '@app/notifications/web';
 *
 * export default function App({ children }) {
 *   return (
 *     <NotificationProvider>
 *       {children}
 *     </NotificationProvider>
 *   );
 * }
 *
 * function SubscribeButton() {
 *   const { subscribe, requestPermissions } = usePushNotifications();
 *
 *   const handleSubscribe = async () => {
 *     const granted = await requestPermissions();
 *     if (granted) {
 *       await subscribe('user-123');
 *     }
 *   };
 *
 *   return <button onClick={handleSubscribe}>Enable Notifications</button>;
 * }
 * ```
 */

// Export everything from base
export * from "./index";

// Web-specific provider
export { NotificationProvider } from "./providers/NotificationProvider.web";

// Web-specific push service
export { webPushService } from "./services/push.web";
