---
name: building-features
description: Use when adding new features, screens, API endpoints, or database tables. Guides package selection, layer placement, and architecture patterns.
---

# Building Features

Guide for building features in the cross-platform monorepo. For full feature builds with agent coordination, use `build-feature` instead.

> **Shared rules apply:** See README for type safety, i18n, screens, error states, responsive design, and mobile auth requirements.

## Package Selection

| Need                         | Package              |
| ---------------------------- | -------------------- |
| API route contracts (oRPC)   | `@app/core-contract` |
| RBAC (roles, permissions)    | `@app/config`        |
| Constants, rate limits       | `@app/config`        |
| Auth types and error classes | `@app/auth`          |
| Screens, hooks, stores       | `@app/ui`            |
| Email sending                | `@app/mailer`        |
| Notifications                | `@app/notifications` |
| Subscriptions                | `@app/subscriptions` |
| Analytics, feature flags     | `@app/analytics`     |

**Rule:** Code goes in the LOWEST layer that makes sense. Lower layers cannot import higher layers.

## Where Code Goes

| What                    | Location                                    |
| ----------------------- | ------------------------------------------- |
| Reusable button/input   | `packages/components/src/`                  |
| oRPC contract           | `packages/core-contract/src/contracts/`     |
| API route (private)     | `apps/api/src/orpc-routes/private/index.ts` |
| API route (public)      | `apps/api/src/orpc-routes/public/index.ts`  |
| Action (business logic) | `apps/api/src/actions/`                     |
| Database table          | `packages/database/src/schema/tables/`      |
| RBAC config             | `packages/config/src/rbac/`                 |
| Application event       | `apps/api/src/lib/events.ts`                |
| Notification handler    | `apps/api/src/lib/notification-handlers.ts` |
| React query hook        | `packages/ui/src/hooks/queries/`            |
| React mutation hook     | `packages/ui/src/hooks/mutations/`          |
| Authenticated screen    | `packages/ui/src/screens/private/`          |
| Auth screen             | `packages/ui/src/screens/auth/`             |
| Translation strings     | `packages/i18n/src/locales/{en,es}/`        |
| Web route (private)     | `apps/web/src/app/(private)/`               |
| Mobile route (private)  | `apps/mobile/src/app/(private)/`            |

## Building Step-by-Step

### 1. Database (if needed)

Create schema in `packages/database/src/schema/tables/` → export from `tables/index.ts` → re-export from `schema/index.ts` → `pnpm --filter database generate` → `pnpm --filter database db:migrate`

### 2. oRPC Contract

```typescript
// packages/core-contract/src/contracts/settings.ts
export const settingsContract = {
  get: oc
    .route({ method: "GET", path: "/settings" })
    .input(z.void())
    .output(z.object({ emailNotifications: z.boolean() }))
    .errors({ UNAUTHORIZED: {} }),
};
// Export from packages/core-contract/src/router.ts
```

### 3. Action Class

```typescript
// apps/api/src/actions/settings.ts — use throwError() for errors
export class SettingsActions {
  static async get(context: AuthContext) {
    if (!context.user) throwError("UNAUTHORIZED", "errors.unauthorized");
    return { emailNotifications: true };
  }
}
```

### 4. Route Handler

Add to appropriate access level file (`private/index.ts` for most routes):

```typescript
import { os } from "../_implementer";
const settingsGet = os.private.user.settings.get
  .use(authMiddleware)
  .handler(async ({ context }) => SettingsActions.get(context));
```

### 5. UI Hooks

```typescript
// packages/ui/src/hooks/queries/useSettings.ts
export function useSettings() {
  return useQuery(orpc.settings.get.queryOptions());
}
```

### 6. Screen

Create in `packages/ui/src/screens/private/` — use shared hooks, error states from `@app/components`, and `useTranslation()` for all text.

### 7. Platform Routes

```typescript
// apps/web/src/app/(private)/settings/page.tsx
"use client";
import { SettingsScreen } from "@app/ui/screens";
export default function SettingsPage() { return <SettingsScreen />; }

// apps/mobile/src/app/(private)/settings.tsx
import { SettingsScreen } from "@app/ui/screens";
import { signOut } from "@app/auth/client/native";
export default function Settings() { return <SettingsScreen signOut={signOut} />; }
```

## Middleware Reference

```typescript
// Route protection levels:
.use(authMiddleware)                                    // Auth only
.use(authMiddleware).use(tenantMiddleware)               // Auth + Tenant
.use(authMiddleware).use(tenantMiddleware).use(createRBACMiddleware("task", "create"))  // + RBAC
.use(authMiddleware).use(tenantMiddleware).use(requireAdmin)  // Admin only
```

## Common Mistakes

| Mistake                       | Correct Approach                                |
| ----------------------------- | ----------------------------------------------- |
| Screen in `apps/web/mobile`   | `packages/ui/src/screens/`                      |
| Hardcoded user-facing text    | `t("key")` from `useTranslation()`              |
| `typeof window` for platform  | `Platform.OS === "web"`                         |
| Mobile missing signOut prop   | Pass `signOut` from `@app/auth/client/native`   |
| Use old apiClient             | Use oRPC client from `@app/ui`                  |
| Skip core-contract            | Always define contracts first                   |
| Business logic in routes      | Put in `apps/api/src/actions/`                  |
| Import `os` from @orpc/server | Import from `./_implementer`                    |
| Throw raw Error in actions    | Use `throwError()` from `lib/errors.ts`         |
| Use sentryMiddleware          | Removed — errors captured by handler.ts onError |

## Existing Code Reference

When in doubt, check these files for patterns:

- Actions: `apps/api/src/actions/me.ts`
- Routes: `apps/api/src/orpc-routes/private/index.ts`
- Screens: `packages/ui/src/screens/private/settings/`
- Hooks: `packages/ui/src/hooks/mutations/useSettings.ts`

## Verification Checklist

- [ ] `pnpm typecheck` passes (no `any`, no `@ts-nocheck`)
- [ ] Contract in `core-contract`, exported from `router.ts`
- [ ] Action uses `throwError()`, correct middleware stack
- [ ] Screen in `packages/ui/src/screens/`, responsive on all breakpoints
- [ ] Translations in ALL languages (`packages/i18n/src/locales/`)
- [ ] Mobile passes platform-specific auth (signOut)
- [ ] Routes in both `apps/web` and `apps/mobile`
- [ ] `pnpm lint` and `pnpm test` pass
