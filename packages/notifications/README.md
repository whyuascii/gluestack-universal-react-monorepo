# @app/notifications

Cross-platform notification management with unified components, hooks, and server-side utilities.

- **UI Components:** NotificationBell, NotificationInbox, NotificationList, NotificationItem
- **Client Hooks:** useNotificationList, useUnreadCount, useNotificationStream
- **Server:** Novu workflows, push providers, database operations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
├─────────────────────────────┬───────────────────────────────┤
│           Web               │           Mobile              │
│   @novu/react (WebSocket)   │     Polling + Expo Push       │
└─────────────┬───────────────┴───────────────┬───────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Server                                 │
│  notify() → Novu workflow → in-app + push + email           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database                                   │
│  notifications, notification_targets, notification_prefs    │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Client-Side (React)

```tsx
import {
  // Components
  NotificationBell,
  NotificationInbox,
  // Hooks
  useNotificationList,
  useUnreadCount,
  useMarkAsRead,
  useNotificationStream,
  // Provider
  NotificationProvider,
} from "@app/notifications";

// Wrap your app
function App() {
  return (
    <NotificationProvider userId={user.id}>
      <YourApp />
    </NotificationProvider>
  );
}

// Display notification bell
function NavBar() {
  const { data } = useUnreadCount();
  const [isOpen, setIsOpen] = useState(false);

  return <NotificationBell unreadCount={data?.count ?? 0} onPress={() => setIsOpen(true)} />;
}

// Show notification inbox
function NotificationsModal() {
  const { data, isLoading, refetch } = useNotificationList();
  const { mutate: markAsRead } = useMarkAsRead();

  return (
    <NotificationInbox
      notifications={data?.notifications ?? []}
      isLoading={isLoading}
      onMarkAsRead={markAsRead}
      onRefresh={refetch}
    />
  );
}

// Real-time updates via SSE
function NotificationListener() {
  useNotificationStream({
    enabled: true,
    onNotification: (notification) => {
      toast(notification.title);
    },
  });
  return null;
}
```

### Server-Side (API)

```typescript
import {
  notify,
  getPushProvider,
  allWorkflows,
  getInbox,
  markAsRead,
} from "@app/notifications/server";

// Send a notification
await notify({
  workflow: "welcome",
  to: { subscriberId: userId },
  payload: { userName: "Alice" },
});

// Get user's inbox
const inbox = await getInbox(userId, { limit: 20 });

// Send push notification
const provider = getPushProvider();
await provider.sendPush({
  userId,
  title: "New message",
  body: "You have a new message",
});
```

## Environment Variables

```bash
# Novu
NOVU_SECRET_KEY=xxx
NOVU_APP_ID=xxx
NEXT_PUBLIC_NOVU_APP_ID=xxx
EXPO_PUBLIC_NOVU_APP_ID=xxx
```

## Exports

### Client Exports (`@app/notifications`)

```typescript
// UI Components
import {
  NotificationBell,
  NotificationItem,
  NotificationList,
  NotificationInbox,
} from "@app/notifications";

// Hooks
import {
  useNotificationList,
  useUnreadCount,
  useSubscriberHash,
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  useNotificationStream,
} from "@app/notifications";

// Provider
import { NotificationProvider } from "@app/notifications";

// Types
import type {
  AppNotification,
  NotificationBellProps,
  NotificationListProps,
} from "@app/notifications";
```

### Server Exports (`@app/notifications/server`)

```typescript
// Core API
import { notify, notifyMany } from "@app/notifications/server";

// Database operations
import {
  getInbox,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getPreferences,
  upsertPreferences,
} from "@app/notifications/server";

// Push providers
import {
  getPushProvider,
  initializePushProvider,
  createTenantTopic,
  notifyTenant,
} from "@app/notifications/server";

// Novu workflows
import {
  allWorkflows,
  welcomeWorkflow,
  inviteReceivedWorkflow,
  // ... 20+ workflows
} from "@app/notifications/server";

// Fastify integration
import { createNovuBridgePlugin } from "@app/notifications/server";
```

## Novu Workflows

20 pre-built workflows for common notification scenarios:

| Category      | Workflows                                          |
| ------------- | -------------------------------------------------- |
| Generic       | `push-notification`, `in-app-notification`         |
| Onboarding    | `welcome`                                          |
| Social        | `invite-received`, `member-joined`                 |
| Tasks         | `todo-assigned`, `todo-nudge`, `todo-completed`    |
| Events        | `event-created`, `event-reminder`, `event-changed` |
| Alerts        | `limit-alert`, `achievement`, `survey-created`     |
| Engagement    | `weekly-summary`, `reminder`                       |
| Communication | `direct-message`, `milestone`, `kudos-sent`        |
| System        | `settings-changed`                                 |

### Testing Workflows

```bash
# Start API server
pnpm --filter api dev

# Run Novu Dev Studio
npx novu@latest dev --port 3030 --route /api/novu

# Open http://localhost:2022
```

### Adding a Workflow

1. Define in `src/workflows/definitions.ts`:

```typescript
export const myWorkflow = workflow(
  "my-workflow",
  async ({ step, payload }) => {
    await step.inApp("in-app", async () => ({
      subject: payload.title,
      body: payload.message,
    }));
  },
  { payloadSchema: mySchema }
);
```

2. Export in `src/workflows/index.ts`
3. Add ID to `src/workflows/types.ts`
4. Restart API server

## Related

- [`packages/ui/src/screens/private/notifications/`](../ui/src/screens/private/notifications/) - NotificationsScreen
- [`docs/guides/NOTIFICATIONS.md`](../../docs/guides/NOTIFICATIONS.md) - Full setup guide
