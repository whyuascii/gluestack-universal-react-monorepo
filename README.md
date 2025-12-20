# 🚀 Universal React Monorepo Foundation

A production-ready cross-platform template for building web and mobile applications with 80%+ code sharing. This is a **foundation to build on**, not a bloated starter kit - it includes the essential infrastructure so you can focus on building your product.

[![CI](https://github.com/whyuascii/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/whyuascii/gluestack-universal-react-monorepo/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

## 🛠️ Stack

### Languages

- **TypeScript** - Type safety across the entire stack
- **SQL** - PostgreSQL for reliable data storage

### Tools & Build System

- **Turborepo** - Intelligent monorepo build system with caching
- **pnpm** - Fast, disk-efficient package manager
- **Drizzle Kit** - Database migrations and schema management
- **Vitest** - Modern test runner

### Frontend Frameworks

- **Next.js 15** - Web application (App Router, React Server Components)
- **Expo 54** - Mobile application (iOS, Android)
- **React 19** - Latest React with concurrent features

### Backend & API

- **Fastify** - High-performance API server
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Production database (easily swappable)
- **Zod** - Runtime validation and type inference

### UI & Styling

- **Gluestack UI v3** - Cross-platform component library
- **NativeWind 4** - Tailwind CSS for React Native
- **Tailwind CSS** - Utility-first styling

### Services & Integrations

- **Better Auth** - Authentication (email/password + OAuth)
- **PostHog** - Analytics and error tracking
- **RevenueCat** - Subscription management and in-app purchases
- **i18next** - Internationalization (English + Spanish)

<p align="center">
  <a href="https://buymeacoffee.com/whyuascii">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee" alt="Buy Me A Coffee" />
  </a>
</p>

---

## 🎯 Purpose

This template solves the **"start from scratch every time"** problem when building cross-platform applications. Instead of spending weeks setting up auth, database migrations, analytics, subscriptions, and deployment pipelines, you get a proven foundation that lets you focus on your unique product features.

**This template is for you if:**

- You're building a SaaS product that needs both web and mobile apps
- You want to ship fast without sacrificing code quality or type safety
- You're tired of integration hell between different libraries
- You value developer experience and want hot reload + type safety everywhere
- You need authentication, subscriptions, and analytics out of the box

**What you get:**

✅ **80-90% code sharing** between web and mobile through shared components and business logic
✅ **Type-safe from database to UI** - catch errors at compile time, not in production
✅ **Production-ready infrastructure** - auth, payments, analytics, i18n already configured
✅ **Proven architecture** - clear package boundaries prevent spaghetti code as you scale
✅ **Fast builds** - Turborepo intelligently caches and parallelizes builds

**What this template is NOT:**

❌ A full application with business logic you need to rip out
❌ A framework that locks you into specific patterns
❌ Bloated with features you'll never use

This is a **foundation**, not a finished product. You add your features on top of working infrastructure.

## 🚦 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0 (LTS recommended)
- **pnpm** >= 10.0.0
- **PostgreSQL** >= 14 (for database development)
- **Docker** (optional, for local PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/whyuascii/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env

# Start PostgreSQL (or use your own)
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=dev \
  -p 5432:5432 \
  -d postgres:16

# Run database migrations
pnpm --filter database db:migrate

# Start development servers
pnpm dev
```

This starts:

- 🌐 Web app at `http://localhost:3000`
- 📱 Mobile app at `http://localhost:8081`
- 🔌 API server at `http://localhost:3030`

### Platform-Specific Development

```bash
# Web only
pnpm --filter web dev

# Mobile only
pnpm --filter mobile dev

# API only
pnpm --filter api dev

# Mobile platforms
cd apps/mobile
pnpm ios        # iOS simulator
pnpm android    # Android emulator
pnpm web        # Browser
```

### Common Commands

```bash
# Development
pnpm dev                          # Start all apps
pnpm --filter web dev             # Web only
pnpm --filter mobile dev          # Mobile only
pnpm --filter api dev             # API only

# Database
pnpm --filter database db:migrate # Run migrations
pnpm --filter database db:studio  # Open Drizzle Studio
pnpm --filter database generate   # Generate new migration

# Quality checks
pnpm lint                         # Lint all packages
pnpm typecheck                    # Type check everything
pnpm test                         # Run all tests
pnpm build                        # Build for production
```

---

## 🏗️ Implementation Details

### Architecture Overview

This monorepo achieves **80-90% code sharing** through a layered architecture:

**3 Applications** (in `apps/`):

- **`web/`** - Next.js 15 with App Router
- **`mobile/`** - Expo 54 with Expo Router
- **`api/`** - Fastify API server

**12 Shared Packages** (in `packages/`):

- **Infrastructure:** `database`, `auth`, `analytics`, `i18n`
- **UI Layer:** `components` (primitives), `ui` (screens + business logic)
- **Utilities:** `utils`, `errors`, `service-contracts`
- **Configuration:** `eslint-config`, `tailwind-config`, `typescript-config`

**How Code Sharing Works:**

1. **Shared UI Components** - The `components` package uses React Native primitives that work on both web (via React Native Web) and mobile. Gluestack UI v3 provides 50+ cross-platform components.

2. **Unified Business Logic** - The `ui` package contains screens, hooks, and logic that are platform-agnostic. Apps only handle routing and platform-specific APIs.

3. **Type-Safe Contracts** - The `service-contracts` package defines shared TypeScript interfaces between frontend and backend, ensuring API compatibility.

4. **Tailwind Everywhere** - NativeWind 4 enables Tailwind CSS classes to work identically on web and React Native, with a shared theme in `tailwind-config`.

**What's Platform-Specific:**

- Routing (Next.js App Router vs Expo Router)
- Native modules (camera, notifications, file system)
- Build configuration and bundling
- Auth client initialization (different fetch polyfills)

### Project Structure

```
├── apps/
│   ├── web/                    # Next.js web app
│   │   └── src/app/           # App Router pages
│   ├── mobile/                 # Expo React Native app
│   │   └── src/app/           # Expo Router screens
│   └── api/                    # Fastify API server
│       ├── src/routes/        # API route handlers
│       └── src/plugins/       # Fastify plugins (auth, analytics, etc.)
│
├── packages/
│   ├── auth/                  # Better Auth config + clients
│   │   ├── src/config.ts     # Server configuration
│   │   └── src/client/       # Web & mobile clients
│   ├── database/              # Drizzle ORM + PostgreSQL
│   │   ├── src/schema/       # Table definitions + Zod validators
│   │   └── drizzle/          # Migration files
│   ├── components/            # Cross-platform UI primitives
│   ├── ui/                    # Screens, hooks, business logic
│   │   ├── src/screens/      # Reusable screen components
│   │   ├── src/hooks/        # Custom React hooks
│   │   └── src/subscriptions/ # RevenueCat integration
│   ├── i18n/                  # Internationalization
│   │   └── src/locales/      # en/ and es/ translations
│   ├── analytics/             # PostHog integration
│   │   ├── src/config/       # Platform-specific configs
│   │   └── src/components/   # ErrorBoundary
│   └── ...                    # Utils, errors, contracts, configs
│
└── docs/                      # Comprehensive docs
    ├── guides/                # How-to guides
    ├── packages/              # Package-specific docs
    └── adr/                   # Architecture decisions
```

### Database Layer (Drizzle ORM)

Drizzle ORM provides **schema-first development** with auto-generated types and validators:

```typescript
// 1. Define schema in packages/database/src/schema/users.ts
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
});

// 2. Auto-generate Zod validators
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
});

// 3. Types are automatically inferred
export type User = z.infer<typeof selectUserSchema>;
```

**Migration workflow:**

1. Modify schema in `packages/database/src/schema/*.ts`
2. Run `pnpm --filter database generate` to create migration
3. Review migration SQL in `packages/database/drizzle/`
4. Apply with `pnpm --filter database db:migrate`

**Key benefits:**

- Single source of truth for database schema
- Types and validators stay in sync automatically
- Easy to swap databases (PostgreSQL → MySQL → SQLite)
- Drizzle Studio GUI for database management

### Authentication (Better Auth)

Better Auth provides type-safe authentication integrated with the database:

**Server configuration** (`packages/auth/src/config.ts`):

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  // OAuth providers: Google, GitHub, etc.
});
```

**Client usage** (platform-specific):

```typescript
// Web
import { createAuthClient } from "auth/client/react";
await authClient.signIn.email({ email, password });

// Mobile
import { createAuthClient } from "auth/client/native";
await authClient.signUp.email({ email, password, name });
```

**Features:** Email/password, OAuth (Google, GitHub), session management, type-safe hooks

See [docs/guides/authentication.md](./docs/guides/authentication.md) for full guide.

### Styling & Theming

**Tailwind CSS + NativeWind** provides unified styling across platforms:

```tsx
// Same code works on web and mobile!
<Button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600" />
```

- **Shared theme** in `packages/tailwind-config`
- **CSS variables** for dynamic theming
- **Dark mode** support built-in
- **Platform overrides** when needed

Gluestack UI v3 provides 50+ styled components that respect your Tailwind theme.

### Internationalization (i18n)

i18next provides translation management with **English and Spanish** included:

**Usage** (platform-specific):

```typescript
// Web
import { useTranslation } from "@app/i18n/web";
const { t, i18n } = useTranslation();
<h1>{t("common.welcome")}</h1>

// Mobile
import { useTranslation } from "@app/i18n/mobile";
<Text>{t("auth.signIn")}</Text>
```

**Translation organization** (`packages/i18n/src/locales/`):

```
├── en/
│   ├── common.json       # UI strings
│   ├── auth.json         # Auth-specific
│   └── validation.json   # Form validation
└── es/ (same structure)
```

**Features:** Auto language detection, persistent preferences, type-safe keys

### Analytics & Error Tracking (PostHog)

PostHog provides **unified analytics and error tracking** across web, mobile, and API:

**Event tracking:**

```typescript
import { analytics } from "@app/analytics/web"; // or "@app/analytics/mobile"

analytics.track("button_clicked", { button_name: "sign_up", page: "landing" });
analytics.identify(userId, { email: user.email, plan: "premium" });
analytics.reset(); // On logout
```

**Error boundary:**

```tsx
import { ErrorBoundary } from "@app/analytics/web"; // or "@app/analytics/mobile"

<ErrorBoundary fallback={<ErrorScreen />}>
  <YourApp />
</ErrorBoundary>;
```

**Features:** Automatic error capture, event tracking, user identification, self-hostable

**Environment variables:**

- `NEXT_PUBLIC_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST` / `EXPO_PUBLIC_POSTHOG_HOST`

See [docs/guides/posthog-analytics.md](./docs/guides/posthog-analytics.md) and [docs/guides/error-tracking.md](./docs/guides/error-tracking.md).

### Subscriptions & In-App Purchases (RevenueCat)

RevenueCat handles **subscriptions and in-app purchases** across iOS, Android, and web:

**Setup:**

```typescript
import { RevenueCatProvider, useSubscription, PremiumGate } from "@app/ui";

// Wrap app
<RevenueCatProvider>
  <YourApp />
</RevenueCatProvider>

// Check subscription status
const { isPremium, isActive } = useSubscription();

// Gate premium content
<PremiumGate fallback={<UpgradePrompt />}>
  <PremiumFeature />
</PremiumGate>
```

**Available components:**

- `PaywallScreen` - Full paywall UI
- `SubscriptionScreen` - Manage subscriptions
- `PremiumGate` - Conditional rendering
- `useSubscription()` - Status hook
- `usePaywall()` - Show/hide paywall

**Environment variables:**

- `NEXT_PUBLIC_REVENUECAT_API_KEY` / `EXPO_PUBLIC_REVENUECAT_API_KEY`
- `NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM` / `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM`

See [docs/guides/revenuecat.md](./docs/guides/revenuecat.md).

### Testing

**Test runner:** Vitest with React Testing Library

```bash
pnpm test                         # All tests
pnpm --filter api test            # Package-specific
pnpm --filter api coverage        # With coverage
```

API tests use real PostgreSQL for integration testing. See [docs/guides/testing.md](./docs/guides/testing.md).

### Deployment

**Web (Next.js):**

- Platforms: Vercel, Netlify, or any Node.js host
- Build: `pnpm --filter web build`

**Mobile (Expo):**

- Use EAS Build: `eas build --profile production`
- Platforms: iOS App Store, Google Play Store

**API (Fastify):**

- Deploy to any Node.js host (Fly.io, Railway, Render)
- Build: `pnpm --filter api build`

**Database:**

- Managed PostgreSQL: Supabase, Neon, Railway, or self-hosted
- Run migrations on deploy: `pnpm --filter database db:migrate`

---

## 📚 Documentation

Comprehensive guides in [`docs/`](./docs/):

- **[Getting Started](./docs/getting-started.md)** - Detailed setup
- **[Guides](./docs/guides/)** - Authentication, database, testing, best practices
- **[Package Docs](./docs/packages/)** - Per-package documentation
- **[ADRs](./docs/adr/)** - Architecture decisions and rationale

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for guidelines.

## 🌟 Why This Stack?

After years of building cross-platform apps, this stack consistently delivers:

- **Speed** - Turborepo + pnpm = fastest builds, intelligent caching
- **Quality** - TypeScript end-to-end = catch bugs at compile time
- **Flexibility** - Drizzle ORM = swap databases easily, no vendor lock-in
- **Maintainability** - Clear package boundaries = easy to navigate and scale
- **DX** - Hot reload everywhere, type safety, auto-generated validators
- **Code Sharing** - 80%+ shared code = ship both platforms simultaneously

## 🔮 Next Steps

This foundation handles the infrastructure. Now add your unique features:

1. **Customize the theme** - Edit `packages/tailwind-config` for your brand
2. **Add your screens** - Build in `packages/ui/src/screens`
3. **Create API endpoints** - Add routes in `apps/api/src/routes`
4. **Define your schema** - Add tables in `packages/database/src/schema`
5. **Deploy** - Ship to Vercel, EAS, and your API host

## 📄 License

ISC © [whyuascii](https://github.com/whyuascii)

## 💖 Support

If this template helped you ship faster, consider buying me a coffee!

<a href="https://buymeacoffee.com/whyuascii">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200" />
</a>

---

## 🔗 Links

- **Documentation**: [/docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/whyuascii/gluestack-universal-react-monorepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/whyuascii/gluestack-universal-react-monorepo/discussions)
- **Buy Me a Coffee**: [buymeacoffee.com/whyuascii](https://buymeacoffee.com/whyuascii)

---

<p align="center">
  Built with ❤️ using Turborepo • Next.js • Expo • Drizzle • Gluestack • NativeWind • PostHog • RevenueCat • i18next
</p>

<p align="center">
  <sub>Built with experience from real-world production apps</sub>
</p>
