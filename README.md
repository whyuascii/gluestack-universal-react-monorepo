# 🚀 Universal React Monorepo Foundation

A cross-platform monorepo template for building modern web and mobile applications. This is how I structure projects for maximum code sharing, maintainability, and success.

[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

<p align="center">
  <a href="https://buymeacoffee.com/whyuascii">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee" alt="Buy Me A Coffee" />
  </a>
</p>

---

## 🎯 Purpose

This is a **foundation template** for building cross-platform applications with maximum code sharing between web and mobile. It represents years of experience building successful products and represents my preferred project structure.

**Why this template exists:**

- ✅ Proven architecture that scales
- ✅ Maximum code reuse (~80-90% between platforms)
- ✅ Type-safe from database to UI
- ✅ Production-ready from day one
- ✅ Easy to understand and maintain

**Use this template if you:**

- Want to build for web and mobile simultaneously
- Value type safety and developer experience
- Need a solid foundation without the bloat
- Want to ship fast without sacrificing quality

## ✨ What Makes This Special

### 🎨 True Cross-Platform

- **One codebase** for web (Next.js) and mobile (Expo)
- **Shared components** that work identically on all platforms
- **Unified styling** with Tailwind CSS via NativeWind
- **Same developer experience** across platforms

### 🗄️ Flexible Database Layer

I chose **Drizzle ORM** over raw SQL for two key reasons:

1. **Simplicity** - Type-safe queries without the complexity
2. **Flexibility** - Easy to pivot to different databases (PostgreSQL, MySQL, SQLite)

The database package (`packages/database`) provides:

- Auto-generated Zod validators from schemas
- Single source of truth for types
- Easy migrations with Drizzle Kit
- Multitenant architecture built-in

### 🏗️ Monorepo Architecture

This structure has proven successful because:

- **Clear boundaries** - Each package has a single purpose
- **Type safety** - TypeScript across all packages
- **Fast builds** - Turborepo caches everything
- **Easy testing** - Isolated, testable packages

### 📦 Package Philosophy

Every package serves a specific purpose:

- **auth** - Better Auth configuration and clients
- **components** - Shared UI primitives (gluestack + custom)
- **ui** - Screens, hooks, and business logic
- **database** - Drizzle schemas and connection
- **i18n** - Internationalization with i18next (English + Spanish)
- **analytics** - PostHog analytics and error tracking
- **utils** - Date/time, validation, and helper utilities
- **errors** - Structured error handling
- **service-contracts** - Shared types and contracts
- **eslint-config** - Shared linting rules
- **tailwind-config** - Shared Tailwind theme
- **typescript-config** - Shared TypeScript configs

## 🚀 Features

- ✅ **Cross-Platform**: Web (Next.js) + Mobile (Expo) with 80%+ code sharing
- ✅ **Type-Safe**: TypeScript everywhere, from database to UI
- ✅ **Modern Stack**: React 19, Next.js 15, Expo 54
- ✅ **Authentication Ready**: Better Auth with email/password + OAuth support
- ✅ **Database Ready**: Drizzle ORM with PostgreSQL (easy to change)
- ✅ **API Server**: Fastify with Zod validation
- ✅ **Internationalization**: i18next with English and Spanish support
- ✅ **Analytics & Error Tracking**: PostHog integration for web, mobile, and API
- ✅ **Styled**: Tailwind CSS + NativeWind for cross-platform styling
- ✅ **Tested**: Vitest + React Testing Library
- ✅ **CI/CD**: GitHub Actions with smart caching
- ✅ **Documented**: Comprehensive docs + ADRs for architecture decisions
- ✅ **Production Ready**: Error handling, logging, security built-in

## 🛠️ Tech Stack

### Core

| Technology     | Purpose               | Why This Choice                         |
| -------------- | --------------------- | --------------------------------------- |
| **Turborepo**  | Monorepo build system | Fastest builds with smart caching       |
| **pnpm**       | Package manager       | Disk efficient, fast, workspace support |
| **TypeScript** | Type safety           | Catch errors at compile time            |

### Frontend

| Technology          | Purpose           | Why This Choice                       |
| ------------------- | ----------------- | ------------------------------------- |
| **Next.js 15**      | Web framework     | App Router, RSC, best DX              |
| **Expo 54**         | Mobile platform   | Best React Native DX                  |
| **React 19**        | UI library        | Latest features, concurrent rendering |
| **Gluestack UI v3** | Component library | True cross-platform components        |
| **NativeWind 4**    | Styling           | Tailwind for React Native             |

### Backend

| Technology      | Purpose        | Why This Choice                         |
| --------------- | -------------- | --------------------------------------- |
| **Fastify**     | API server     | Fast, low overhead, great DX            |
| **Better Auth** | Authentication | Type-safe, full-featured, email + OAuth |
| **Drizzle ORM** | Database ORM   | Type-safe, flexible, lightweight        |
| **PostgreSQL**  | Database       | Robust, feature-rich (easily swappable) |
| **Zod**         | Validation     | Type-safe schemas, auto-generated       |

### Testing & Quality

| Technology                | Purpose           |
| ------------------------- | ----------------- |
| **Vitest**                | Test runner       |
| **React Testing Library** | Component testing |
| **ESLint**                | Code linting      |
| **Prettier**              | Code formatting   |

## 📁 Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/app/           # App Router pages
│   │   └── tailwind.config.js # Web-specific Tailwind config
│   │
│   ├── mobile/                 # Expo React Native application
│   │   ├── src/app/           # Expo Router pages
│   │   └── tailwind.config.js # Mobile-specific Tailwind config
│   │
│   └── api/                    # Fastify API server
│       ├── src/routes/        # API endpoints
│       ├── src/plugins/       # Fastify plugins
│       └── src/utils/         # API utilities
│
├── packages/
│   ├── auth/                  # Authentication (Better Auth)
│   │   ├── src/config.ts     # Auth configuration
│   │   └── src/client/       # React & React Native clients
│   │
│   ├── components/            # Shared UI components (gluestack + custom)
│   │   └── src/              # 50+ cross-platform components
│   │
│   ├── ui/                    # Shared business logic
│   │   ├── src/screens/      # Screen implementations
│   │   ├── src/hooks/        # Custom React hooks
│   │   ├── src/store/        # State management
│   │   └── src/utils/        # UI utilities
│   │
│   ├── database/              # Database layer (Drizzle ORM)
│   │   ├── src/schema/       # Table schemas + Zod validators
│   │   │   ├── auth/         # Better Auth tables
│   │   │   ├── tenants.ts    # Tenant schema
│   │   │   └── users.ts      # User schema
│   │   ├── drizzle/          # Migrations
│   │   └── scripts/          # Seed/migration scripts
│   │
│   ├── i18n/                  # Internationalization (i18next)
│   │   ├── src/locales/      # Translation files
│   │   │   ├── en/           # English translations
│   │   │   └── es/           # Spanish translations
│   │   ├── src/i18n.web.ts   # Web i18n configuration
│   │   └── src/i18n.mobile.ts # Mobile i18n configuration
│   │
│   ├── analytics/             # Analytics & Error Tracking (PostHog)
│   │   ├── src/config/       # PostHog configuration
│   │   │   ├── posthog.web.ts    # Web PostHog setup
│   │   │   └── posthog.mobile.ts # Mobile PostHog setup
│   │   ├── src/providers/    # React providers
│   │   └── src/components/   # ErrorBoundary components
│   │
│   ├── utils/                 # Pure utility functions
│   │   └── src/              # Date, validation, lodash helpers
│   │
│   ├── errors/                # Structured error classes
│   ├── service-contracts/     # Shared type definitions
│   ├── eslint-config/         # Shared ESLint configuration
│   ├── tailwind-config/       # Shared Tailwind theme
│   └── typescript-config/     # Shared TypeScript configs
│
├── docs/                      # Comprehensive documentation
│   ├── api/                  # API documentation
│   ├── packages/             # Package-specific docs
│   ├── guides/               # How-to guides
│   └── adr/                  # Architecture Decision Records
│
├── .github/                   # GitHub configuration
│   ├── workflows/            # CI/CD workflows
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   ├── DISCUSSION_TEMPLATE/  # Discussion templates
│   └── CONTRIBUTING.md       # Contribution guidelines
│
├── CLAUDE.md                  # AI assistant instructions
├── turbo.json                 # Turborepo configuration
└── pnpm-workspace.yaml        # pnpm workspace config
```

## 🚦 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0 (LTS recommended)
- **pnpm** >= 10.0.0
- **PostgreSQL** >= 14 (for database development)
- **Docker** (optional, for local PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
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

## 📋 Available Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Start all apps in development mode |
| `pnpm build`     | Build all apps for production      |
| `pnpm lint`      | Lint all packages                  |
| `pnpm typecheck` | Run TypeScript type checking       |
| `pnpm test`      | Run all tests                      |
| `pnpm clean`     | Clean build artifacts              |

### Package-Specific Commands

```bash
# Run command in specific package
pnpm --filter api test
pnpm --filter components build
pnpm --filter database generate  # Generate migrations
pnpm --filter database db:studio # Open Drizzle Studio
```

## 🏗️ Key Architecture Decisions

All major decisions are documented as ADRs (Architecture Decision Records):

- **[ADR-0001: Use Drizzle ORM with PostgreSQL](./docs/adr/0001-use-drizzle-orm-with-postgresql.md)**
  - Why: Type safety, flexibility, Zod integration
  - Easy to pivot to MySQL, SQLite, or other databases

- **[ADR-0002: Adopt Gluestack UI v3](./docs/adr/0002-adopt-gluestack-ui-v3.md)**
  - Why: True cross-platform, Tailwind integration
  - 80%+ code sharing between web and mobile

See [docs/adr/](./docs/adr/) for all architectural decisions.

## 🎨 Styling System

**Unified theme** via `packages/tailwind-config`:

- Shared color palette, typography, spacing
- CSS variables for dynamic theming
- Dark mode support
- Platform-specific overrides when needed

**Usage:**

```tsx
// Works on both web and mobile!
<Button className="bg-primary-500 text-white px-4 py-2 rounded-lg" />
```

## 🗄️ Database Package

**Schema-first development:**

```typescript
// Define table schema once
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
});

// Auto-generate Zod validators
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
});

// Derive TypeScript types
export type User = z.infer<typeof selectUserSchema>;
```

**Benefits:**

- Single source of truth
- Type-safe queries
- Auto-validated inputs
- Easy migrations
- Swap databases anytime

## 🔐 Authentication

**Powered by Better Auth:**

The `auth` package provides a complete authentication solution using [Better Auth](https://www.better-auth.com/):

```typescript
// Server-side configuration (packages/auth/src/config.ts)
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // OAuth providers configured here
});
```

**Client usage:**

```typescript
// Web (React)
import { createAuthClient } from "auth/client/react";
const authClient = createAuthClient();
await authClient.signIn.email({ email, password });

// Mobile (React Native)
import { createAuthClient } from "auth/client/native";
const authClient = createAuthClient();
await authClient.signUp.email({ email, password, name });
```

**Features:**

- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Session management
- Type-safe auth hooks
- Integrated with database package
- Works on web and mobile

See [docs/packages/auth.md](./docs/packages/auth.md) and [docs/guides/authentication.md](./docs/guides/authentication.md) for complete guides.

## 🌍 Internationalization (i18n)

**Powered by i18next:**

The `i18n` package provides a complete internationalization solution with platform-specific configurations:

```typescript
// Web usage (apps/web)
import { useTranslation } from "i18n/web";

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <button onClick={() => i18n.changeLanguage("es")}>
        Español
      </button>
    </div>
  );
}

// Mobile usage (apps/mobile)
import { useTranslation } from "i18n/mobile";

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t("auth.signIn")}</Text>
      <Button onPress={() => i18n.changeLanguage("en")}>
        English
      </Button>
    </View>
  );
}
```

**Features:**

- English and Spanish translations included
- Platform-specific configurations (web vs mobile)
- Automatic language detection
- Persistent language preference
- Organized translation files by domain (common, auth, validation)
- Type-safe translation keys
- Integrated with UI package

**Translation structure:**

```
packages/i18n/src/locales/
├── en/
│   ├── common.json       # Common UI strings
│   ├── auth.json         # Authentication strings
│   └── validation.json   # Validation messages
└── es/
    ├── common.json
    ├── auth.json
    └── validation.json
```

## 📊 Analytics & Error Tracking

**Powered by PostHog:**

The `analytics` package provides unified analytics and error tracking across all platforms:

```typescript
// Tracking events (works on web, mobile, and API)
import { analytics } from "analytics/web"; // or "analytics/mobile"

// Track custom events
analytics.track("button_clicked", {
  button_name: "sign_up",
  page: "landing",
});

// Identify users
analytics.identify(userId, {
  email: user.email,
  plan: "premium",
});

// Reset on logout
analytics.reset();
```

**Error Boundary for React:**

```tsx
// Web or Mobile
import { ErrorBoundary } from "analytics/web"; // or "analytics/mobile"

function App() {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo) => <div>Something went wrong: {error.message}</div>}
      onError={(error, errorInfo) => {
        console.log("Error caught:", error);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

**Features:**

- Unified analytics interface for web, mobile, and API
- Automatic error tracking with exception capture
- React ErrorBoundary components
- Unhandled error and rejection tracking
- Event tracking with custom properties
- User identification and session management
- Privacy-focused (self-hostable)
- Platform-specific optimizations

**Configuration:**

```bash
# Web (.env)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Mobile (.env)
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

See [docs/guides/POSTHOG.md](./docs/guides/POSTHOG.md) for complete setup and usage guide.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm --filter api coverage

# Run specific package tests
pnpm --filter components test
```

**Testing stack:**

- **Vitest** - Fast, modern test runner
- **React Testing Library** - Component testing
- **PostgreSQL** - Integration tests with real database
- **MSW** - API mocking (if needed)

See [docs/guides/testing.md](./docs/guides/testing.md) for the complete guide.

## 🚀 Deployment

### Web (Next.js)

- Deploy to **Vercel**, **Netlify**, or any Node.js host
- Build: `pnpm --filter web build`
- Start: `pnpm --filter web start`

### Mobile (Expo)

- Use **EAS Build** for app store deployment
- Preview: `eas build --profile preview`
- Production: `eas build --profile production`

### API (Fastify)

- Deploy to any Node.js host or container platform
- Build: `pnpm --filter api build`
- Start: `node apps/api/dist/index.js`

### Database

- Managed PostgreSQL: **Supabase**, **Neon**, **Railway**
- Migrations: `pnpm --filter database db:migrate`

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for:

- How to contribute
- Coding standards
- Testing requirements
- PR process

## 📚 Documentation

Comprehensive documentation is available in the [docs/](./docs/) directory:

- **[Getting Started](./docs/getting-started.md)** - Detailed setup guide
- **[Architecture](./docs/architecture/)** - Architecture overview
- **[API Documentation](./docs/api/)** - API server docs
- **[Package Docs](./docs/packages/)** - Individual package docs
- **[Guides](./docs/guides/)** - How-to guides and best practices
- **[ADRs](./docs/adr/)** - Architecture Decision Records

## 🌟 Why This Stack?

After building multiple cross-platform applications, this stack consistently delivers:

1. **Speed** - Turborepo + pnpm = fastest builds
2. **Quality** - TypeScript + testing = fewer bugs
3. **Flexibility** - Drizzle ORM = easy database changes
4. **Maintainability** - Clear structure = easy to navigate
5. **Developer Experience** - Hot reload + type safety = happy devs
6. **Code Sharing** - 80%+ shared code = ship faster

## 🔮 What's Next?

This template gives you a solid foundation. From here:

1. **Add features** - Authentication, payments, etc.
2. **Customize styling** - Update the theme in `packages/tailwind-config`
3. **Add routes** - Expand web/mobile/API endpoints
4. **Scale** - Add more packages as your app grows

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
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions)
- **Buy Me a Coffee**: [buymeacoffee.com/whyuascii](https://buymeacoffee.com/whyuascii)

---

<p align="center">
  Built with ❤️ using Turborepo • Next.js • Expo • Drizzle • Gluestack • NativeWind • PostHog • i18next
</p>

<p align="center">
  <sub>Built with experience from real-world production apps</sub>
</p>
