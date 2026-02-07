# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cross-platform monorepo for web and mobile apps with ~80-90% code sharing.

## Tech Stack

- **Monorepo:** Turborepo + pnpm
- **Web:** Next.js 15 + React 19
- **Mobile:** Expo 54 + React Native
- **API:** Fastify 5 + oRPC
- **Database:** Drizzle ORM + PostgreSQL
- **Auth:** Better Auth
- **Styling:** Tailwind + NativeWind + Gluestack UI
- **Subscriptions:** Polar (web) + RevenueCat (mobile)
- **Notifications:** Novu (in-app/email) + Expo Push
- **Ads:** Google AdMob (mobile) + AdSense (web)
- **i18n:** i18next (en + es)

## Essential Commands

```bash
# Development
pnpm dev                          # Start all apps
pnpm --filter api dev             # API at :3030
pnpm --filter web dev             # Web at :3000
pnpm --filter mobile dev          # Mobile at :8081
pnpm --filter admin dev           # Admin at :3001

# Quality
pnpm typecheck                    # Type check all
pnpm lint                         # Lint all
pnpm test                         # Test all
pnpm --filter <package> test      # Test single package

# Database
pnpm --filter database generate   # Generate migration after schema change
pnpm --filter database db:migrate # Apply migrations
pnpm --filter database db:studio  # Open Drizzle Studio

# Novu Workflows (local testing)
# Terminal 1: pnpm --filter api dev
# Terminal 2: npx novu@latest dev --port 3030 --route /api/novu
# Open http://localhost:2022 to test workflows
```

## Architecture

```
apps/
├── api/          # Fastify API (oRPC routes)
├── web/          # Next.js (thin wrappers only)
├── mobile/       # Expo (thin wrappers only)
└── admin/        # Internal admin portal

packages/
├── ui/           # ALL screens, hooks, stores (shared)
├── components/   # UI primitives (cross-platform)
├── core-contract/# oRPC API contracts
├── database/     # Drizzle schemas
├── auth/         # Better Auth config + clients
├── i18n/         # Translations
├── config/       # RBAC, subscription tiers, constants
├── analytics/    # PostHog + OTEL logging
├── mailer/       # Resend emails
├── notifications/# Novu workflows + push
├── subscriptions/# Polar + RevenueCat providers
└── ads/          # AdMob + AdSense
```

### Package Layers (Dependency Rules)

Lower layers cannot import from higher layers:

```
Layer 1 (Foundation): typescript-config, eslint-config, tailwind-config, config
Layer 2 (Infrastructure): database, auth, mailer
Layer 3 (Features): components, i18n, analytics, notifications, subscriptions
Layer 4 (Business Logic): ui (screens, hooks, stores)
Layer 5 (Applications): web, mobile, api, admin
```

## Core Rules

### 1. Screens in packages/ui ONLY

```typescript
// All screens in packages/ui/src/screens/
// Apps only contain thin routing wrappers
```

### 2. i18n for ALL User-Facing Text

```typescript
// Use translation keys for all user-facing content
<Button>{t("actions.submit")}</Button>
throwError("FORBIDDEN", "errors.forbidden.noPermission");

// Internal logs stay in English
console.log(`[Auth] User ${userId} logged in`);
posthog.capture("user_signup", { method: "email" });
```

### 3. Mobile Auth

```typescript
// Mobile MUST pass native signOut to shared screens
import { signOut } from "@app/auth/client/native";
<DashboardScreen signOut={signOut} />
```

### 4. Platform-Specific Files

```
.web.tsx    # Web-only
.native.tsx # Mobile-only (iOS + Android)
.ios.tsx    # iOS-only
.android.tsx # Android-only
```

## Quick Reference: Where Code Goes

| Building               | Location                                |
| ---------------------- | --------------------------------------- |
| Database tables        | `packages/database/src/schema/tables/`  |
| API contracts          | `packages/core-contract/src/contracts/` |
| API routes             | `apps/api/src/orpc-routes/`             |
| Business logic         | `apps/api/src/actions/`                 |
| Query hooks            | `packages/ui/src/hooks/queries/`        |
| Mutation hooks         | `packages/ui/src/hooks/mutations/`      |
| Screens                | `packages/ui/src/screens/`              |
| Translations           | `packages/i18n/src/locales/{en,es}/`    |
| Novu workflows         | `packages/notifications/src/workflows/` |
| Subscription providers | `packages/subscriptions/src/providers/` |

## Feature Development Order

1. **Database** → `packages/database/src/schema/tables/`
2. **Contract** → `packages/core-contract/src/contracts/`
3. **Action** → `apps/api/src/actions/`
4. **Route** → `apps/api/src/orpc-routes/`
5. **Hooks** → `packages/ui/src/hooks/`
6. **Screen** → `packages/ui/src/screens/`
7. **i18n** → `packages/i18n/src/locales/`
8. **Web/Mobile routes** → `apps/*/src/app/`

---

## API Pattern

```typescript
// 1. Contract (packages/core-contract/src/contracts/example.ts)
export const exampleContract = {
  create: oc
    .route({ method: "POST", path: "/examples" })
    .input(z.object({ name: z.string() }))
    .output(z.object({ id: z.string() })),
};

// 2. Action (apps/api/src/actions/example.ts)
export class ExampleActions {
  static async create(input, context: AuthContext) {
    return db.insert(examples).values(input).returning();
  }
}

// 3. Route (apps/api/src/orpc-routes/example.ts)
const create = os.example.create
  .use(authMiddleware)
  .handler(({ input, context }) => ExampleActions.create(input, context));
```

### Middleware Stack

```typescript
.use(authMiddleware)                         // 1. Auth required
.use(tenantMiddleware)                       // 2. Tenant membership
.use(createRBACMiddleware("task", "create")) // 3. Permission check
.use(requireFeature("bulkExport"))           // 4. Subscription feature gate
```

---

## Subscription Providers

Multi-provider system: Polar (web) + RevenueCat (mobile) with unified entitlements.

```typescript
// Server-side
import { getTenantEntitlements, hasFeatureAccess } from "@app/subscriptions/server";

const entitlements = await getTenantEntitlements(tenantId);
if (entitlements.tier === "pro") {
  /* pro features */
}
if (await hasFeatureAccess(tenantId, "bulkExport")) {
  /* allowed */
}
```

### Status Handling

| Status     | Access           | Notes                          |
| ---------- | ---------------- | ------------------------------ |
| `active`   | Full             | Normal subscription            |
| `trialing` | Full             | Trial period                   |
| `past_due` | Grace period     | 7 days after payment failure   |
| `canceled` | Until period end | If `cancelAtPeriodEnd` is true |
| `expired`  | None             | Reverts to free tier           |

---

## Notifications (Novu)

20 pre-built workflows with in-app, push, and email channels.

```typescript
// Server-side: Send notification
import { notify } from "@app/notifications/server";

await notify({
  workflow: "invite-received",
  to: { subscriberId: userId },
  payload: { inviterName, tenantName, inviteLink },
});

// Client-side: Listen to notifications
import { useNotifications } from "@novu/nextjs"; // or @novu/react-native
const { notifications, markAsRead } = useNotifications();
```

### Adding a Custom Workflow

1. Define in `packages/notifications/src/workflows/definitions.ts`
2. Export in `packages/notifications/src/workflows/index.ts`
3. Add ID to `packages/notifications/src/workflows/types.ts`
4. Restart API server - workflow syncs automatically

---

## RBAC (packages/config)

Two-tier permission system:

**Tier 1 - Tenant Roles:** `owner`, `admin`, `member`
**Tier 2 - Member Roles:** `editor`, `viewer`, `contributor`, `moderator`

```typescript
import { canAccess, isAdminOrOwner } from "@app/config";

if (canAccess(tenantRole, memberRole, "task", "delete")) { /* allowed */ }
if (isAdminOrOwner(tenantRole)) { /* manage settings */ }

// Middleware
.use(createRBACMiddleware("task", "delete"))
```

**Resources:** `tenant`, `member`, `invite`, `task`, `project`, `comment`, `file`, `settings`, `billing`, `analytics`, `audit_log`
**Actions:** `create`, `read`, `update`, `delete`, `manage`

---

## Subscription Tiers (packages/config)

| Feature       | Free     | Pro       | Enterprise |
| ------------- | -------- | --------- | ---------- |
| `adsEnabled`  | true     | false     | false      |
| `maxMembers`  | 5        | unlimited | unlimited  |
| `exportLimit` | 10/month | unlimited | unlimited  |
| `bulkExport`  | false    | true      | true       |
| `sso`         | false    | false     | true       |
| `auditLogs`   | false    | false     | true       |

```typescript
import { requireFeature, getMemberLimit } from "@app/config";

requireFeature(entitlements, "bulkExport"); // Throws if not allowed
const limit = getMemberLimit(entitlements); // -1 = unlimited
```

---

## Admin Portal (apps/admin)

Internal dashboard at `:3001` for support/DevOps.

**Routes:** `/dashboard` (metrics), `/dashboard/users`, `/dashboard/tenants`
**Roles:** `read_only`, `support_rw`, `super_admin`

Features: User/tenant search, impersonation with audit logging, webhook debugging, support flags.

---

## Skills (in .claude/skills/)

| Skill               | Use When                          |
| ------------------- | --------------------------------- |
| `building-features` | Adding screens, endpoints, tables |
| `backend-developer` | API implementation                |
| `web-developer`     | Web frontend                      |
| `mobile-developer`  | Mobile frontend                   |
| `code-reviewer`     | Before merging                    |
| `security-reviewer` | Auth features                     |
| `i18n-manager`      | Translations                      |
| `feature-flags`     | A/B tests                         |

## Documentation

- `docs/GETTING-STARTED.md` - Setup
- `docs/BUILDING-FEATURES.md` - Development guide
- `.claude/skills/` - Agent skills with detailed patterns
