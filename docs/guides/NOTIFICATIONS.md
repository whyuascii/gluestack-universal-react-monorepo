# Notifications Guide

Complete reference for the notification system in this boilerplate.

## Overview

The notification system uses a hybrid architecture:

- **Novu** - In-app notifications (inbox, preferences, subscriber management)
- **Expo Push** - Mobile push notifications via Firebase/APNs
- **SSE (Server-Sent Events)** - Real-time delivery to connected clients
- **PostgreSQL** - Notification storage and preferences (source of truth)

**Note:** Transactional emails are handled separately by `@app/mailer` (Resend).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Notification Flow                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Action emits event → Handler creates notification → Delivery               │
│       ↓                        ↓                         ↓                  │
│  emit("invite.sent")    db.insert(notifications)   SSE → In-app toast      │
│                                ↓                   Novu → Mobile push       │
│                         @app/notifications                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Package Structure

```
packages/notifications/
├── src/
│   ├── index.ts                    # Client exports
│   ├── server.ts                   # Server exports (notify, provider)
│   ├── notify.ts                   # Core notification function
│   ├── config/
│   │   ├── index.ts                # Configuration exports
│   │   └── novu.ts                 # Novu configuration
│   ├── providers/
│   │   ├── push/
│   │   │   ├── types.ts            # PushProvider interface
│   │   │   ├── factory.ts          # Provider factory
│   │   │   ├── novu.ts             # Novu implementation
│   │   │   └── noop.ts             # No-op for testing
│   │   ├── NotificationProvider.tsx         # Shared interface
│   │   ├── NotificationProvider.web.tsx     # Web provider
│   │   └── NotificationProvider.native.tsx  # Mobile provider (Expo)
│   ├── services/
│   │   ├── topics.ts               # Multi-tenant topic management
│   │   └── marketing.ts            # Marketing campaigns
│   ├── hooks/
│   │   └── usePushNotifications.ts # Permission and state
│   └── db/                         # Database operations
```

## Configuration

### Environment Variables

```bash
# Server (for sending notifications)
NOVU_SECRET_KEY=your-novu-secret-key
NOVU_APP_ID=your-novu-app-id

# Web client
NEXT_PUBLIC_NOVU_APP_ID=your-novu-app-id

# Mobile client
EXPO_PUBLIC_NOVU_APP_ID=your-novu-app-id
```

### Novu Dashboard Setup

1. Create an account at [novu.co](https://novu.co)
2. Create a new application
3. Configure the Expo provider in Integrations:
   - Go to Integrations > Push > Add Provider
   - Select "Expo" provider
   - No additional configuration needed (uses Expo's built-in push service)
4. Create notification workflows:
   - `push-notification` - Basic push for individual notifications
   - `push-notification-batched` - For grouped/batched notifications

## Mobile Setup

### Expo Configuration

The mobile app uses Expo Push Notifications, which work with both Firebase (Android) and APNs (iOS) automatically.

**app.config.js:**

```javascript
{
  expo: {
    // ... other config
    ios: {
      infoPlist: {
        UIBackgroundModes: ["remote-notification"]
      }
    },
    android: {
      useNextNotificationsApi: true
    }
  }
}
```

### Provider Setup

```tsx
// apps/mobile/src/app/_layout.tsx
import { NotificationProvider } from "@app/notifications";

export default function RootLayout() {
  const { data: session } = useSession();

  return <NotificationProvider userId={session?.user?.id}>{/* ... */}</NotificationProvider>;
}
```

### Request Permission

```tsx
import { useNotificationContext } from "@app/notifications";

function NotificationSettings() {
  const { permission, requestPermission, isSubscribed } = useNotificationContext();

  if (permission === "granted") {
    return <Text>Notifications enabled</Text>;
  }

  return <Button onPress={requestPermission}>Enable Notifications</Button>;
}
```

## Web Setup

### Provider Setup

```tsx
// apps/web/src/app/providers.tsx
import { NotificationProvider } from "@app/notifications";

export function Providers({ children, session }) {
  return <NotificationProvider userId={session?.user?.id}>{children}</NotificationProvider>;
}
```

### Request Permission (Web)

```tsx
import { useNotificationContext } from "@app/notifications";

function NotificationBanner() {
  const { permission, requestPermission } = useNotificationContext();

  if (permission === "granted" || permission === "denied") {
    return null;
  }

  return (
    <Banner>
      <Text>Enable notifications to stay updated</Text>
      <Button onPress={requestPermission}>Enable</Button>
    </Banner>
  );
}
```

## Sending Notifications

### Using the Event System (Recommended)

The cleanest way to send notifications is through the event system:

```typescript
// apps/api/src/actions/invites.ts
import { emit } from "../lib/events";

export class InviteActions {
  static async send(input, context) {
    // ... create invite logic

    // Emit event - notification handler will create the notification
    emit("invite.sent", {
      inviteId: invite.id,
      inviterUserId: context.user.id,
      inviterName: context.user.name,
      email: inviteeEmail,
      tenantId: tenant.id,
      tenantName: tenant.name,
    });

    return invite;
  }
}
```

Then handle in `apps/api/src/lib/notification-handlers.ts`:

```typescript
const handlers = {
  "invite.sent": async ({ inviterUserId, email, tenantName, tenantId }) => {
    await sendNotification({
      recipientUserId: inviterUserId,
      tenantId,
      type: "member_invited",
      title: "Invite sent!",
      body: `Your invitation to ${email} for ${tenantName} was sent.`,
      data: { email, tenantName },
    });
  },
};
```

### Direct API Usage

For cases where you need more control:

```typescript
import { notify } from "@app/notifications/server";

// Send to specific user
await notify({
  recipientUserId: userId,
  tenantId: "tenant-123",
  type: "member_joined",
  title: "New member joined!",
  body: "Someone joined your group.",
  deepLink: "/nest/tenant-123",
  data: { userName: "John" },
});
```

### Available Notification Types

```typescript
type NotificationType =
  | "member_joined" // Someone joined the group
  | "member_invited" // Invitation was sent
  | "member_left" // Someone left the group
  | "mention" // User was mentioned
  | "comment" // New comment
  | "task_assigned" // Task was assigned
  | "reminder" // Scheduled reminder
  | "announcement" // Group announcement
  | "settings_changed"; // Settings were updated
```

## Multi-Tenant Topics

For tenant-scoped broadcasts (notify all members of a group):

```typescript
import {
  createTenantTopic,
  addUserToTenant,
  removeUserFromTenant,
  notifyTenant,
} from "@app/notifications/server";

// When tenant is created
await createTenantTopic(provider, tenantId, tenantName);
await addUserToTenant(provider, tenantId, ownerUserId);

// When member joins
await addUserToTenant(provider, tenantId, newMemberId);

// When member leaves
await removeUserFromTenant(provider, tenantId, memberId);

// Broadcast to all members
await notifyTenant(provider, tenantId, {
  title: "New Announcement",
  body: "Important update for all members.",
  type: "announcement",
});
```

## Real-Time In-App Notifications

The SSE stream provides instant delivery for in-app notifications:

```typescript
// Frontend - Subscribe to real-time notifications
import { useNotificationStream, useUnreadCount } from "@app/ui";

function NotificationBell() {
  const { data: unread } = useUnreadCount();

  // Connect to SSE stream
  useNotificationStream({
    enabled: isAuthenticated,
    onNotification: (notification) => {
      // Show toast
      toast(notification.title);
      // Invalidate unread count
      queryClient.invalidateQueries(["notifications", "unread"]);
    },
  });

  return <Badge count={unread?.count} />;
}
```

## User Preferences

Users can control which notification types they receive:

```typescript
// Get preferences
const prefs = await getNotificationPreferences(userId, tenantId);

// Update preferences
await updateNotificationPreferences(userId, tenantId, {
  inApp: true,
  push: false,
  email: true,
});
```

The `notify()` function automatically respects these preferences.

## Database Schema

The notification system uses these tables:

```typescript
// notifications - Main inbox
{
  id: uuid,
  recipientUserId: uuid,
  actorUserId: uuid,      // Who triggered this notification
  tenantId: uuid,
  type: notificationType,
  title: string,
  body: string,
  deepLink: string,
  data: jsonb,
  readAt: timestamp,
  archivedAt: timestamp,
  createdAt: timestamp,
}

// notification_preferences - User settings per tenant
{
  id: uuid,
  userId: uuid,
  tenantId: uuid,
  category: string,
  inApp: boolean,
  push: boolean,
  email: boolean,
}

// notification_targets - Push registration
{
  id: uuid,
  userId: uuid,
  platform: enum("web", "ios", "android"),
  expoPushToken: string,
  novuSubscriberId: string,
  active: boolean,
}

// notification_deliveries - Delivery tracking
{
  id: uuid,
  notificationId: uuid,
  channel: enum("in_app", "push", "email"),
  status: enum("pending", "sent", "delivered", "failed"),
  sentAt: timestamp,
  deliveredAt: timestamp,
  failureReason: string,
}
```

## Testing

### Development Mode

In development, notifications are logged to console but push delivery is disabled unless you configure Novu:

```typescript
// Check if push provider is initialized
import { isPushProviderInitialized } from "@app/notifications/server";

if (isPushProviderInitialized()) {
  // Send real push notifications
} else {
  // Log to console only
}
```

### Testing Push on Device

Expo Push notifications require a physical device:

```bash
# Build development client
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Test Notification Endpoint

The API includes a test endpoint:

```typescript
// POST /rpc/notifications/send-test
// Requires authentication
// Sends a test notification to the authenticated user
```

## Troubleshooting

### Push not received (Mobile)

1. Ensure you're using a physical device (simulators don't support push)
2. Check that `expoPushToken` is registered in `notification_targets`
3. Verify Expo provider is configured in Novu dashboard
4. Check Novu dashboard for delivery logs

### Web notifications not working

1. Ensure site is HTTPS (required for Notification API)
2. User must explicitly grant permission
3. Check browser notification settings

### SSE not connecting

1. Verify user is authenticated
2. Check API CORS settings include your frontend origin
3. Look for connection errors in browser console

## Best Practices

1. **Use events for notifications** - Emit events in actions, handle in notification-handlers.ts
2. **Respect user preferences** - The `notify()` function handles this automatically
3. **Include deep links** - Help users navigate to relevant content
4. **Batch when appropriate** - Use batched notifications for high-frequency events
5. **Test on real devices** - Push notifications require physical devices
6. **Keep messages concise** - Title < 50 chars, body < 150 chars

## Next Steps

- **[EMAIL.md](./EMAIL.md)** - Transactional email notifications
- **[ANALYTICS.md](./ANALYTICS.md)** - Track notification engagement
- **[Novu Docs](https://docs.novu.co)** - Official Novu documentation
- **[Expo Push Docs](https://docs.expo.dev/push-notifications/overview/)** - Expo Push documentation
