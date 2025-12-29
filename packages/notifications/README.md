# @app/notifications

Cross-platform notification system with OneSignal integration for push, in-app, and transactional notifications.

## Features

- 🔔 **Push Notifications** - OneSignal integration for web and mobile
- 📱 **In-App Notifications** - Toast notifications and notification center
- 📧 **Transactional Notifications** - Password resets, email verification, etc.
- 📣 **Marketing Notifications** - Campaigns and announcements
- 🔌 **Provider Abstraction** - Easily swap notification providers
- 🎨 **Customizable UI** - Notification bell and toast components

## Installation

This package is already part of the monorepo. No additional installation needed.

Add environment variables to your `.env` file:

```bash
# Web (Next.js)
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-web-app-id

# Mobile (Expo)
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-mobile-app-id
```

## Usage

### 1. Wrap your app with NotificationProvider

**Web (Next.js):**

```tsx
// apps/web/src/app/layout.tsx
import { NotificationProvider } from "@app/notifications/web";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
```

**Mobile (Expo):**

```tsx
// apps/mobile/src/app/_layout.tsx
import { NotificationProvider } from "@app/notifications/mobile";

export default function RootLayout() {
  return (
    <NotificationProvider>
      <Stack />
    </NotificationProvider>
  );
}
```

### 2. Request Push Notification Permissions

```tsx
import { usePushNotifications } from "@app/notifications/web"; // or /mobile

function SettingsScreen() {
  const { requestPermissions, subscribe, isPermissionGranted } = usePushNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermissions();
    if (granted) {
      await subscribe(userId); // Subscribe user to push notifications
    }
  };

  return (
    <button onClick={handleEnableNotifications} disabled={isPermissionGranted}>
      {isPermissionGranted ? "Notifications Enabled" : "Enable Notifications"}
    </button>
  );
}
```

### 3. Show In-App Notifications

```tsx
import { useInAppNotifications } from "@app/notifications";

function SomeComponent() {
  const { success, error, warning, info } = useInAppNotifications();

  const handleAction = async () => {
    try {
      await doSomething();
      success("Success!", "Your changes have been saved.");
    } catch (err) {
      error("Error", "Failed to save changes. Please try again.");
    }
  };

  return <button onClick={handleAction}>Save</button>;
}
```

### 4. Display Notification Bell & Toasts

```tsx
import { NotificationBell, NotificationToast } from "@app/notifications";

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header>
      <NotificationBell onPress={() => setShowNotifications(true)} />
      <NotificationToast position="top-right" />
    </header>
  );
}
```

### 5. Send Transactional Notifications (from backend)

```tsx
// In your auth flow
import { transactionalNotificationService } from "@app/notifications";

// When user forgets password
await transactionalNotificationService.sendPasswordReset(email, resetToken);

// When user signs up
await transactionalNotificationService.sendEmailVerification(email, verificationToken);
```

## API Reference

### Hooks

#### `useNotifications()`

Get notification state.

```tsx
const { inAppNotifications, unreadCount, isPermissionGranted, isPushEnabled } = useNotifications();
```

#### `usePushNotifications()`

Manage push notifications.

```tsx
const {
  isPermissionGranted,
  isPushEnabled,
  requestPermissions,
  subscribe,
  unsubscribe,
  getPushToken,
} = usePushNotifications();
```

#### `useInAppNotifications()`

Manage in-app notifications.

```tsx
const {
  notifications,
  unreadCount,
  show,
  success,
  error,
  warning,
  info,
  dismiss,
  read,
  readAll,
  clear,
} = useInAppNotifications();
```

### Services

#### `inAppNotificationService`

Show in-app notifications programmatically.

```tsx
import { inAppNotificationService } from "@app/notifications";

inAppNotificationService.success("Success!", "Your changes have been saved.");
inAppNotificationService.error("Error", "Something went wrong.");
inAppNotificationService.warning("Warning", "Please review your changes.");
inAppNotificationService.info("Info", "New features available!");
```

#### `transactionalNotificationService`

Send transactional notifications (password reset, email verification, etc.).

```tsx
import { transactionalNotificationService } from "@app/notifications";

await transactionalNotificationService.sendPasswordReset(email, resetToken);
await transactionalNotificationService.sendEmailVerification(email, verificationToken);
await transactionalNotificationService.sendAccountCreated(email, userName);
await transactionalNotificationService.sendLoginAlert(email, device, location, timestamp);
```

#### `marketingNotificationService`

Manage marketing notification preferences.

```tsx
import { marketingNotificationService } from "@app/notifications";

await marketingNotificationService.optIn(userId);
await marketingNotificationService.optOut(userId);
const isOptedIn = await marketingNotificationService.getPreference(userId);
```

### Components

#### `<NotificationBell />`

Displays a notification bell with unread badge.

```tsx
<NotificationBell
  onPress={() => setShowNotifications(true)}
  size={24}
  color="#374151"
  badgeColor="#EF4444"
  showBadge={true}
/>
```

#### `<NotificationToast />`

Displays in-app notifications as toasts.

```tsx
<NotificationToast
  position="top-right" // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
  maxVisible={3}
/>
```

## Architecture

This package follows a clean architecture with provider abstraction:

```
packages/notifications/
├── src/
│   ├── config/           # OneSignal configuration
│   ├── providers/        # React context providers (web & native)
│   ├── services/         # Notification services (push, inApp, transactional, marketing)
│   ├── hooks/            # React hooks
│   ├── components/       # UI components
│   ├── stores/           # Zustand store
│   └── types/            # TypeScript types
```

The package is designed to be **provider-agnostic**, meaning you can easily swap OneSignal for another provider (Firebase, Pusher, etc.) by implementing the `PushNotificationService` interface.

## Environment Variables

| Variable                       | Platform | Description                                               |
| ------------------------------ | -------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | Web      | OneSignal web app ID                                      |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID` | Mobile   | OneSignal mobile app ID                                   |
| `NEXT_PUBLIC_API_URL`          | Web      | Backend API URL for transactional/marketing notifications |
| `EXPO_PUBLIC_API_URL`          | Mobile   | Backend API URL for transactional/marketing notifications |

## Backend Integration

For transactional and marketing notifications to work, you need to implement backend API endpoints:

```
POST /api/notifications/transactional
POST /api/notifications/marketing/campaigns
PUT  /api/notifications/marketing/preferences/:userId
GET  /api/notifications/marketing/preferences/:userId
```

These endpoints should use the OneSignal REST API to send push notifications to users.

## License

ISC
