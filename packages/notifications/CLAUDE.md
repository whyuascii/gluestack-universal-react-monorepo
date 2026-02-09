# Notifications (packages/notifications)

Novu-powered system with 20 pre-built workflows across in-app, push, and email channels.

## Server-Side

```typescript
import { notify } from "@app/notifications/server";

await notify({
  workflow: "invite-received",
  to: { subscriberId: userId },
  payload: { inviterName, tenantName, inviteLink },
});
```

## Client-Side

```typescript
import { useNotifications } from "@novu/nextjs"; // or @novu/react-native
const { notifications, markAsRead } = useNotifications();
```

## Adding a Custom Workflow

1. Define in `src/workflows/definitions.ts`
2. Export in `src/workflows/index.ts`
3. Add ID to `src/workflows/types.ts`
4. Restart API server - workflow syncs automatically
