---
name: backend-developer
description: Use when implementing API endpoints - creates oRPC contracts, route handlers, actions, and database schema changes
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Backend Developer

Implement type-safe APIs using oRPC contracts and Fastify.

> **Shared rules apply:** See README for type safety, i18n, and error state requirements.

## Architecture

```
packages/core-contract/     → oRPC API contracts (input/output schemas)
packages/config/            → RBAC config, constants (NOT API schemas)
packages/auth/              → Better Auth config, clients, types, error classes
apps/api/src/
├── orpc-routes/           → Routes organized by ACCESS LEVEL
│   ├── _implementer.ts    → Shared oRPC implementer (import `os` from here)
│   ├── public/            → No auth required (health, waitlist)
│   ├── private/           → Auth required (me, settings, todos, etc.)
│   ├── admin/             → Auth + admin role required
│   └── index.ts           → Combines public/private/admin routers
├── actions/               → Business logic classes
├── middleware/            → Auth, Tenant, RBAC, Feature Flag middleware
├── lib/                   → Core utilities (errors, openapi, events)
└── handler.ts             → oRPC OpenAPIHandler with error interceptor
packages/database/src/
└── schema/tables/         → Drizzle schemas in tables/ subdirectory
```

## Implementation Order

1. Database Schema → 2. oRPC Contracts → 3. Action Classes → 4. Route Handlers → 5. Register Routes

## Step 1: Database Schema (if needed)

Location: `packages/database/src/schema/tables/`

```typescript
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  emailNotifications: boolean("email_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

Then: export from `tables/index.ts` → re-export from `schema/index.ts` → `pnpm --filter database generate` → `pnpm --filter database db:migrate`

## Step 2: oRPC Contracts

Location: `packages/core-contract/src/contracts/`

```typescript
export const settingsContract = {
  getNotifications: oc
    .route({ method: "GET", path: "/settings/notifications" })
    .input(z.void())
    .output(NotificationSettingsSchema)
    .errors({ UNAUTHORIZED: {} }),
};
```

Add to main contract in `packages/core-contract/src/router.ts`.

## Step 3: Action Classes

Location: `apps/api/src/actions/`

- Use `throwError` from `lib/errors.ts` for all errors with i18n keys
- Type all database query results explicitly
- Use `catch (err: unknown)` not `catch (err: any)`

```typescript
export class SettingsActions {
  static async getNotifications(context: AuthContext): Promise<NotificationSettings> {
    const result = await db
      .select({ emailNotifications: userSettings.emailNotifications })
      .from(userSettings)
      .where(eq(userSettings.userId, context.user.id))
      .limit(1);

    if (!result[0]) {
      return { emailNotifications: true }; // defaults
    }
    return result[0];
  }
}
```

## Step 4: Route Handlers

Routes organized by **ACCESS LEVEL** (public/private/admin), not by feature.

Location: `apps/api/src/orpc-routes/{public,private,admin}/index.ts`

- Import `os` from `../_implementer` (NEVER from @orpc/server)
- Only use `authMiddleware` — no sentryMiddleware (errors captured at handler level)

```typescript
// apps/api/src/orpc-routes/private/index.ts
import { os } from "../_implementer";
import { authMiddleware } from "../../middleware";
import { SettingsActions } from "../../actions/settings";

const settingsGetNotifications = os.private.user.settings.getNotifications
  .use(authMiddleware)
  .handler(async ({ context }) => SettingsActions.getNotifications(context));
```

## Step 5: Router Structure

Main router in `apps/api/src/orpc-routes/index.ts` combines access levels:

```typescript
export const router = os.router({
  public: publicRoutes,
  private: privateRoutes,
  admin: adminRoutes,
});
```

## Error Handling

ALL errors captured automatically by `handler.ts` onError interceptor. Use `throwError` from `lib/errors.ts`:

```typescript
// User-facing errors MUST use i18n keys
throwError("NOT_FOUND", "errors.notFound.resource");
throwError("FORBIDDEN", "errors.forbidden.noPermission");

// Internal logging stays English
console.log(`[Auth] Permission denied for user ${userId}`);
```

Error flow: Action throws → handler.ts onError → lib/errors.ts handleError() → JSON log + PostHog + formatted response

## Middleware Stack

| Middleware                           | Purpose                 | When to Use                 |
| ------------------------------------ | ----------------------- | --------------------------- |
| `authMiddleware`                     | Validates session       | All protected routes        |
| `tenantMiddleware`                   | Validates tenant access | Tenant-scoped resources     |
| `createRBACMiddleware(res, action)`  | Checks role permissions | Role-based operations       |
| `requireRole(role)` / `requireAdmin` | Minimum role check      | Admin-only operations       |
| `requireFeature(feature)`            | Gates premium features  | Subscription-based features |

Order matters: `authMiddleware` → `tenantMiddleware` → `createRBACMiddleware` → `requireFeature`

## Auth Context

```typescript
// With authMiddleware: context.user, context.session
// With tenantMiddleware: + context.membership, context.tenant
```

## Event System

Location: `apps/api/src/lib/events.ts` — typed event emitter for notifications/analytics.

```typescript
emit("tenant.created", { tenantId, tenantName, ownerUserId: context.user.id });
```

Available events: `user.signed_up`, `user.verified`, `invite.sent`, `invite.accepted`, `tenant.created`, `tenant.member_joined`

Add new events: type in `AppEvents` → `emit()` in action → handler in `notification-handlers.ts`

## Email Sending

```typescript
import { sendTemplateEmail } from "@app/mailer";
await sendTemplateEmail("authVerifyEmail", {
  to: user.email,
  locale: user.preferredLanguage || "en",
  data: { name: user.name, verificationLink },
});
```

Templates: `authVerifyEmail`, `authResetPassword`, `authWelcome`, `inviteToTenant`, `waitlistWelcome`

## Checklist

- [ ] Database schema + migration generated and applied
- [ ] Contract defines inputs/outputs, exported from `router.ts`
- [ ] Action uses `throwError` with i18n keys, no `any` types
- [ ] Route handlers are thin, use `os` from `_implementer`
- [ ] Correct middleware stack (auth → tenant → RBAC → feature)
- [ ] Events emitted for notification-worthy actions
- [ ] `pnpm --filter api typecheck` passes
