# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a cross-platform monorepo template for building web and mobile applications with maximum code sharing (~80-90%). It's a production-ready foundation with authentication, database, analytics, subscriptions, and internationalization already configured.

**Tech Stack:**

- **Monorepo:** Turborepo + pnpm workspaces
- **Web:** Next.js 15 (App Router) + React 19
- **Mobile:** Expo 54 + React Native 0.81
- **API:** Fastify 5 with Zod validation
- **Database:** Drizzle ORM + PostgreSQL
- **Auth:** Better Auth (email/password + OAuth)
- **Styling:** Tailwind CSS + NativeWind 4 + Gluestack UI v3
- **Analytics:** PostHog (web, mobile, API)
- **Subscriptions:** RevenueCat
- **i18n:** i18next (English + Spanish)

## Essential Commands

### Development

```bash
# Start all apps (web, mobile, api)
pnpm dev

# Start specific app
pnpm --filter web dev      # Web at http://localhost:3000
pnpm --filter mobile dev   # Mobile at http://localhost:8081
pnpm --filter api dev      # API at http://localhost:3030

# Mobile platform-specific
cd apps/mobile
pnpm ios                   # iOS simulator
pnpm android               # Android emulator
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter api test
pnpm --filter components test

# Run with coverage
pnpm --filter api coverage

# Test-specific commands
pnpm --filter api test:unit
```

### Database

```bash
# Run migrations
pnpm --filter database db:migrate

# Open Drizzle Studio (database GUI)
pnpm --filter database db:studio

# Generate new migration from schema changes
pnpm --filter database generate

# Seed database
pnpm --filter database db:seed
```

### Type Checking & Linting

```bash
# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Lint specific package
pnpm --filter web lint
pnpm --filter api lint:fix
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
pnpm --filter api build
pnpm --filter mobile build  # expo export

# Clean build artifacts
pnpm clean
```

### API-Specific

```bash
# Generate Swagger/OpenAPI docs
pnpm --filter api swagger
```

## High-Level Architecture

### Monorepo Structure

The repository follows a **strict separation of concerns** with three types of top-level directories:

1. **`apps/`** - Deployable applications (web, mobile, api)
2. **`packages/`** - Shared libraries used by apps
3. **`docs/`** - Comprehensive documentation

### Package Dependency Philosophy

Packages are organized in **layers** to prevent circular dependencies:

```
Layer 1 (Foundation):
  - typescript-config, eslint-config, tailwind-config
  - errors, service-contracts, utils

Layer 2 (Infrastructure):
  - database (depends on: nothing from this repo)
  - auth (depends on: database)

Layer 3 (Features):
  - components (depends on: tailwind-config)
  - i18n (depends on: nothing from this repo)
  - analytics (depends on: nothing from this repo)

Layer 4 (Business Logic):
  - ui (depends on: components, i18n, analytics, service-contracts)

Layer 5 (Applications):
  - web, mobile, api (can depend on any package)
```

### Key Packages

- **`auth`** - Better Auth configuration with separate clients for web (`auth/client/react`) and mobile (`auth/client/native`)
- **`components`** - 50+ cross-platform UI primitives from Gluestack UI v3 + custom components
- **`ui`** - Business logic layer containing screens, hooks, state management, and RevenueCat subscription logic
- **`database`** - Drizzle ORM schemas in `src/schema/`, with auto-generated Zod validators
- **`i18n`** - Platform-specific configs (`i18n/web`, `i18n/mobile`) with translations in `src/locales/{en,es}/`
- **`analytics`** - PostHog integration with platform-specific configs (`analytics/web`, `@app/analytics/mobile`) and ErrorBoundary components
- **`service-contracts`** - Shared TypeScript types and interfaces used across all apps

### How Code is Shared

The monorepo achieves 80-90% code sharing through:

1. **Shared UI Components** - `packages/components` works identically on web (React Native Web) and mobile (React Native)
2. **Unified Styling** - Tailwind classes via NativeWind work on both platforms
3. **Business Logic in `ui` package** - Screens, hooks, and logic are platform-agnostic
4. **Type Safety Everywhere** - `service-contracts` ensures API contracts match between frontend and backend

**Platform-specific code only needed for:**

- Navigation (Next.js App Router vs Expo Router)
- Platform APIs (camera, notifications, etc.)
- Auth clients (different fetch implementations)
- Analytics initialization (web vs mobile SDKs)

## Critical Patterns

### Database Schema-First Development

**All database changes follow this workflow:**

1. Modify schema in `packages/database/src/schema/*.ts`
2. Generate migration: `pnpm --filter database generate`
3. Review migration in `packages/database/drizzle/`
4. Apply migration: `pnpm --filter database db:migrate`

**Important:** Drizzle auto-generates Zod validators from schemas. After schema changes, TypeScript types and validators are automatically in sync.

Example pattern in schemas:

```typescript
// Define table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
});

// Auto-generate validators
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
});

// Derive types
export type User = z.infer<typeof selectUserSchema>;
```

### Authentication Architecture

Better Auth provides a **unified auth solution** with database integration:

- **Server config:** `packages/auth/src/config.ts` (uses Drizzle adapter)
- **Web client:** Import from `auth/client/react`
- **Mobile client:** Import from `auth/client/native`
- **Database tables:** Managed by Better Auth, schemas in `packages/database/src/schema/auth/`

**Auth is integrated at the API level** - apps/api mounts Better Auth routes, while web and mobile apps use respective clients.

### Environment Variables

**Critical variables** (defined in `turbo.json` globalEnv):

```bash
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3030
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3030
EXPO_PUBLIC_API_URL=http://localhost:3030

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_KEY=  # For API server
POSTHOG_HOST=

# RevenueCat (Optional)
NEXT_PUBLIC_REVENUECAT_API_KEY=
EXPO_PUBLIC_REVENUECAT_API_KEY=
```

**Note:** Web uses `NEXT_PUBLIC_*` prefix, Mobile uses `EXPO_PUBLIC_*` prefix.

### Analytics & Error Tracking

PostHog is initialized **differently per platform**:

- **Web:** `analytics/web` uses posthog-js
- **Mobile:** `@app/analytics/mobile` uses posthog-react-native
- **API:** Direct PostHog Node SDK in `apps/api/src/plugins/posthog-analytics.ts`

**ErrorBoundary usage:** Always wrap apps with `<ErrorBoundary>` from the appropriate platform package to automatically capture and report React errors.

### Subscription Management (RevenueCat)

RevenueCat logic lives in **`packages/ui/src/subscriptions/`**:

- `RevenueCatProvider` - Wrap app root
- `useSubscription()` - Check subscription status
- `usePaywall()` - Show/hide paywall
- `PremiumGate` - Component for gating premium features
- `PaywallScreen` - Full paywall UI
- `SubscriptionScreen` - Manage subscriptions

**Platform differences:** Mobile uses native SDKs (`react-native-purchases`), web uses JavaScript SDK (`@revenuecat/purchases-js`).

### Internationalization (i18n)

Translations organized by domain in `packages/i18n/src/locales/`:

```
locales/
├── en/
│   ├── common.json       # UI strings
│   ├── auth.json         # Auth-related
│   └── validation.json   # Form validation
└── es/
    └── (same structure)
```

**Usage:**

- Web: `import { useTranslation } from '@app/i18n/web'`
- Mobile: `import { useTranslation } from '@app/i18n/mobile'`

Platform configs handle language detection and persistence differently.

## Turborepo Pipeline

**Build pipeline** (defined in `turbo.json`):

- **`dev`** - Persistent task, no caching
- **`build`** - Depends on `^build` (builds dependencies first)
- **`typecheck`, `lint`, `test`** - Depend on dependencies being checked/linted/tested first

**Caching:** Turborepo caches build outputs (`.next/`, `dist/`) based on file hashes. Clean with `pnpm clean`.

## Testing Strategy

**Test runner:** Vitest (configured in each package)

**Coverage:** Run `pnpm --filter <package> coverage` to generate coverage reports

**API testing:** Uses real PostgreSQL database for integration tests (see `apps/api/src/__tests__/`)

**Component testing:** React Testing Library for UI components

**Important:** Apps (web, mobile) have placeholder tests. Packages (database, utils, errors, api) have comprehensive test suites.

## Common Development Workflows

### Adding a New API Endpoint

1. Create route file in `apps/api/src/routes/<domain>/`
2. Define Zod schema for request/response in route file or `service-contracts`
3. Implement handler with Fastify TypeScript types
4. Register route in `apps/api/src/index.ts` or route index
5. Add tests in `apps/api/src/routes/<domain>/__tests__/`

### Adding a New Screen

1. Create screen component in `packages/ui/src/screens/`
2. Use components from `packages/components`
3. Add routing in `apps/web/src/app/` (Next.js) and `apps/mobile/src/app/` (Expo Router)
4. Screens automatically work on both platforms

### Adding a Database Table

1. Create schema in `packages/database/src/schema/<domain>.ts`
2. Export from `packages/database/src/schema/index.ts`
3. Run `pnpm --filter database generate`
4. Review generated migration
5. Run `pnpm --filter database db:migrate`
6. Types and validators are now available in all packages

### Running Single Test File

```bash
# API test
pnpm --filter api test src/routes/health/__tests__/health.test.ts

# Any package test
pnpm --filter <package-name> test <path-to-test-file>
```

## Project-Specific Notes

- **React 19 & Next.js 15:** Using latest versions with App Router
- **NativeWind 4:** Tailwind works identically on web and mobile
- **Multitenant:** Database has `tenants` table for SaaS use cases
- **Expo Router:** Mobile app uses file-based routing like Next.js
- **Type Safety:** Zod schemas at API boundaries ensure runtime validation
- **Monorepo References:** Packages reference each other via `workspace:*` in package.json

## Documentation

Full documentation in `docs/`:

- `docs/guides/` - How-to guides (authentication, database migrations, testing, etc.)
- `docs/packages/` - Package-specific documentation
- `docs/adr/` - Architecture Decision Records
- `docs/api/` - API documentation

Always check existing docs before making architectural changes.
