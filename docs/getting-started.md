# Getting Started

Get your development environment running in under 10 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([download](https://nodejs.org/))
- **pnpm** 9+ (`npm install -g pnpm`)
- **PostgreSQL** via one of:
  - [Supabase CLI](https://supabase.com/docs/guides/cli) (recommended for local dev)
  - [Docker](https://www.docker.com/products/docker-desktop/)
  - Cloud provider (Neon, Supabase, etc.)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url> my-app
cd my-app

# Install dependencies
pnpm install
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Validate your configuration
pnpm env:check
```

Edit `.env` and set the required values. At minimum you need:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long

# Email (get from resend.com)
RESEND_API_KEY=re_your_api_key
```

### 3. Start Database

**Option A: Supabase (Recommended)**

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Start local Supabase (includes Postgres, Auth UI, Storage, etc.)
npx supabase start

# Your DATABASE_URL is: postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

**Option B: Docker**

```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Your DATABASE_URL is: postgresql://postgres:postgres@localhost:5432/postgres
```

### 4. Run Migrations

```bash
# Apply database migrations
pnpm db:migrate

# (Optional) View database in browser
pnpm db:studio
```

### 5. Start Development

```bash
# Start all apps (web + mobile + api)
pnpm dev

# Or start specific apps
pnpm dev:web      # Web only (http://localhost:3000)
pnpm dev:api      # API only (http://localhost:3030)
pnpm dev:mobile   # Mobile only (Expo)
```

## What's Running?

| App                | URL                   | Description                 |
| ------------------ | --------------------- | --------------------------- |
| **Web**            | http://localhost:3000 | Next.js 15 web application  |
| **API**            | http://localhost:3030 | Fastify API server          |
| **Mobile**         | Expo Go app           | React Native via Expo       |
| **Drizzle Studio** | http://localhost:4983 | Database GUI (when running) |

## Verify Everything Works

### Test the API

```bash
curl http://localhost:3030/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test the Web App

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account with email/password
4. Check your email (or Resend dashboard) for verification

### Test Mobile

1. Install "Expo Go" on your phone
2. Scan the QR code from the terminal
3. The app should load with the same login screen

## Project Structure Overview

```
my-app/
├── apps/
│   ├── web/          # Next.js web app
│   ├── mobile/       # Expo mobile app
│   └── api/          # Fastify API server
│
├── packages/
│   ├── ui/           # Shared screens & hooks (YOUR CODE)
│   ├── components/   # Shared UI components
│   ├── i18n/         # Translations (YOUR CODE)
│   ├── tailwind-config/ # Theme & styling (YOUR CODE)
│   │
│   ├── auth/         # Better Auth (configured)
│   ├── database/     # Drizzle ORM (extend schemas)
│   ├── analytics/    # PostHog (configured)
│   ├── subscriptions/ # RevenueCat (configured)
│   ├── notifications/ # Novu + Expo Push (configured)
│   ├── mailer/       # Resend emails (configured)
│   │
│   ├── config/       # RBAC, constants
│   └── core-contract/ # oRPC contracts (API types)
│
├── docs/             # Documentation
├── config/           # Environment templates
└── .env.example      # Environment variables
```

**Key insight:** Most of your code will live in:

- `packages/ui/` - Screens, hooks, business logic
- `packages/i18n/` - Translations
- `packages/tailwind-config/` - Theme customization
- `apps/*/src/app/` - Routing and pages

## Common Commands

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:web          # Start web only
pnpm dev:api          # Start API only
pnpm dev:mobile       # Start mobile only

# Database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open database GUI
pnpm db:generate      # Generate migration from schema changes

# Quality
pnpm lint             # Run linter
pnpm typecheck        # Run TypeScript checks
pnpm test             # Run tests
pnpm format           # Format code

# Environment
pnpm env:check        # Validate environment variables
```

## Troubleshooting

### "Connection refused" to database

Make sure your database is running:

```bash
# For Supabase
npx supabase status

# For Docker
docker ps
```

### "Invalid origin" error on login

Add your development URLs to `.env`:

```bash
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19006
```

### Mobile app not connecting to API

On mobile, `localhost` refers to the phone itself. Use your computer's IP:

```bash
# Find your IP
ipconfig getifaddr en0  # macOS
hostname -I             # Linux

# Update .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3030
```

### Email not sending

1. Check your Resend API key is valid
2. In development, emails may go to the Resend dashboard instead of actual delivery
3. Verify your sender domain is configured in Resend

## Next Steps

- **[Building Features](./BUILDING-FEATURES.md)** - Where to add your code
- **[Customizing Brand](./CUSTOMIZING-BRAND.md)** - Themes, logos, copy
- **[UI Components](./guides/UI-COMPONENTS.md)** - Error states, animations, permissions
- **[Deploying](./DEPLOYING.md)** - Production deployment guide

## Need Help?

- Check the [guides/](./guides/) folder for detailed integration docs (API, Auth, Database, Notifications, etc.)
- Review [CLAUDE.md](../CLAUDE.md) for AI-assisted development tips
- Open an issue if you find a bug
