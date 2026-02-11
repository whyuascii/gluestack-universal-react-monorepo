# CLAUDE.md

Cross-platform monorepo (web + mobile) with ~80-90% code sharing.

## Tech Stack

Turborepo + pnpm | Next.js 15 + React 19 | Expo 54 + React Native | Fastify 5 + oRPC | Drizzle ORM + PostgreSQL | Better Auth | Tailwind + NativeWind + Gluestack UI | i18next (en + es) | Polar (web) + RevenueCat (mobile) | Novu | PostHog | Resend | AdMob + AdSense

## Essential Commands

```bash
pnpm dev                          # All apps
pnpm --filter api dev             # API :3030
pnpm --filter web dev             # Web :3000
pnpm --filter mobile dev          # Mobile :8081
pnpm --filter admin dev           # Admin :3001
pnpm typecheck                    # Type check all
pnpm lint                         # Lint all
pnpm test                         # Test all
pnpm --filter <pkg> test          # Test single package
pnpm --filter database generate   # Generate migration
pnpm --filter database db:migrate # Apply migrations
```

## Architecture

```
apps/
├── api/          # Fastify (oRPC routes)
├── web/          # Next.js (thin wrappers only)
├── mobile/       # Expo (thin wrappers only)
└── admin/        # Internal portal (:3001)

packages/
├── ui/           # ALL screens, hooks, stores (shared)
├── components/   # UI primitives (cross-platform)
├── core-contract/# oRPC API contracts
├── database/     # Drizzle schemas
├── auth/         # Better Auth config + clients
├── i18n/         # Translations
├── config/       # RBAC, subscription tiers, constants
├── analytics/    # PostHog + OTEL
├── mailer/       # Resend emails
├── notifications/# Novu workflows + push
├── subscriptions/# Polar + RevenueCat
└── ads/          # AdMob + AdSense
```

### Layer Rules (lower cannot import higher)

```
L1 (Foundation):  typescript-config, eslint-config, tailwind-config, config
L2 (Infra):       database, auth, mailer
L3 (Features):    components, i18n, analytics, notifications, subscriptions
L4 (Business):    ui (screens, hooks, stores)
L5 (Apps):        web, mobile, api, admin
```

## Core Rules

1. **Screens in `packages/ui` only** - apps contain thin routing wrappers
2. **i18n for ALL user-facing text** - logs/analytics stay English
3. **Mobile auth**: pass native `signOut` to shared screens
4. **Platform files**: `.web.tsx`, `.native.tsx`, `.ios.tsx`, `.android.tsx`

## Where Code Goes

| What            | Where                                   |
| --------------- | --------------------------------------- |
| Database tables | `packages/database/src/schema/tables/`  |
| API contracts   | `packages/core-contract/src/contracts/` |
| API routes      | `apps/api/src/orpc-routes/`             |
| Business logic  | `apps/api/src/actions/`                 |
| Query hooks     | `packages/ui/src/hooks/queries/`        |
| Mutation hooks  | `packages/ui/src/hooks/mutations/`      |
| Screens         | `packages/ui/src/screens/`              |
| Translations    | `packages/i18n/src/locales/{en,es}/`    |
| Novu workflows  | `packages/notifications/src/workflows/` |
| Subscriptions   | `packages/subscriptions/src/providers/` |

## Feature Development Order

Database schema → Contract → Action → Route → Hooks → Screen → i18n → App routes

## Middleware Stack (API)

`authMiddleware` → `tenantMiddleware` → `createRBACMiddleware(resource, action)` → `requireFeature(feature)`

## Key Domain Patterns

- **RBAC**: Two-tier (`owner/admin/member` + `editor/viewer/contributor/moderator`). Use `canAccess()` and `createRBACMiddleware()`.
- **Subscriptions**: Polar (web) + RevenueCat (mobile), unified via `getTenantEntitlements()`. Tiers: free/pro/enterprise.
- **Notifications**: Novu with in-app, push, email channels. Use `notify()` server-side.
- **Admin**: Internal dashboard with `read_only/support_rw/super_admin` roles.

See package-level CLAUDE.md files for detailed patterns (loaded lazily when working in those directories).

## Workflow Practices

- Start complex tasks with plan mode before writing code
- Commit frequently after completing each subtask
- Perform `/compact` at ~50% context usage
- Break work into subtasks completable within 50% of context budget
- Use feature-specific skills for domain knowledge (progressive disclosure)
- **After every change**, provide a recommended commit message and PR title:
  - Commit: lowercase conventional commit (`fix: resolve auth token expiry`)
  - PR title: uppercase conventional type (`FIX(auth): Resolve Auth Token Expiry`)

## Skills

| Skill               | Use When                           |
| ------------------- | ---------------------------------- |
| `building-features` | Adding screens, endpoints, tables  |
| `screen-builder`    | Creating new screens (ui + routes) |
| `backend-developer` | API contracts, routes, actions     |
| `web-developer`     | Next.js pages, web hooks           |
| `mobile-developer`  | Expo screens, native integrations  |
| `frontend-designer` | UI/UX specs, component hierarchy   |
| `orchestrator`      | Multi-agent feature delivery       |
| `code-reviewer`     | Before merging                     |
| `security-reviewer` | Auth/security features             |
| `i18n-manager`      | Translations                       |
| `feature-flags`     | A/B tests, experiments             |
| `test-engineer`     | Writing tests                      |

## Documentation

- `docs/GETTING-STARTED.md` - Setup
- `docs/BUILDING-FEATURES.md` - Development guide
- `.claude/skills/` - Detailed implementation patterns per domain
