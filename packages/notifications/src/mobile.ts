/**
 * @app/notifications/mobile
 *
 * Mobile-specific exports for the notifications package
 * Uses OneSignal native SDK (react-native-onesignal)
 *
 * @example
 * ```tsx
 * import { NotificationProvider, usePushNotifications } from '@app/notifications/mobile';
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
 *   return <Button onPress={handleSubscribe}>Enable Notifications</Button>;
 * }
 * ```
 */

// Export everything from base
export * from "./index";

// Mobile-specific provider
export { NotificationProvider } from "./providers/NotificationProvider.native";

// Mobile-specific push service
export { nativePushService } from "./services/push.native";
