# Getting Started - Detailed Setup Guide

This guide provides in-depth setup instructions, environment configuration details, and troubleshooting for the Universal React Monorepo.

> **Quick Start**: See the [README](../README.md) for a 5-minute setup. Come back here when you need more details or run into issues.

---

## Table of Contents

- [Detailed Installation](#detailed-installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Mobile Development Setup](#mobile-development-setup)
- [Common Pitfalls](#common-pitfalls)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## Detailed Installation

### Prerequisites Setup

**Node.js >= 20.0.0**

```bash
# Check version
node --version

# Using nvm (recommended)
nvm install 20
nvm use 20

# Using Homebrew (macOS)
brew install node@20
```

**pnpm >= 10.0.0**

```bash
# Install pnpm
npm install -g pnpm

# Or via Homebrew
brew install pnpm

# Verify
pnpm --version
```

**PostgreSQL >= 14**

Option 1: Docker (recommended for development)

```bash
docker run --name postgres-dev \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=dev \
  -p 5432:5432 \
  -d postgres:16

# Verify it's running
docker ps | grep postgres
```

Option 2: Homebrew (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb dev
```

Option 3: Managed service (production-like)

- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Simple deployment

### First-Time Setup

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd gluestack-universal-react-monorepo
   pnpm install
   ```

2. **Environment files**

   ```bash
   # API environment
   cp apps/api/.env.example apps/api/.env

   # Database environment
   cp packages/database/.env.example packages/database/.env
   ```

3. **Initialize database**

   ```bash
   # Run migrations
   pnpm --filter database db:migrate

   # (Optional) Seed with sample data
   pnpm --filter database db:seed
   ```

4. **Verify setup**
   ```bash
   # This should start all apps without errors
   pnpm dev
   ```

---

## Environment Variables

### Required Variables

#### Database (`packages/database/.env`)

```bash
DATABASE_URL="postgresql://dev:dev@localhost:5432/dev"
```

**Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`

- `user` - Database username
- `password` - Database password
- `host` - Database server (localhost for local dev)
- `port` - PostgreSQL port (default: 5432)
- `database` - Database name

#### API Server (`apps/api/.env`)

```bash
# Server
PORT=3030
NODE_ENV=local  # local | development | production

# Database (should match packages/database/.env)
DATABASE_URL="postgresql://dev:dev@localhost:5432/dev"

# Better Auth
BETTER_AUTH_SECRET="your-32-char-secret-here"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3030"        # Your API URL

# OAuth (optional - for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# PostHog (API analytics)
POSTHOG_KEY="your-posthog-project-key"
POSTHOG_HOST="https://us.i.posthog.com"
```

#### Web App (`apps/web/.env.local`)

```bash
# API endpoint
NEXT_PUBLIC_API_URL="http://localhost:3030"

# PostHog (web analytics)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-project-key"
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"

# RevenueCat (subscriptions)
NEXT_PUBLIC_REVENUECAT_API_KEY="your-revenuecat-web-key"
NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM="premium"
NEXT_PUBLIC_REVENUECAT_PRODUCT_MONTHLY="monthly_subscription"
NEXT_PUBLIC_REVENUECAT_PRODUCT_YEARLY="yearly_subscription"
```

#### Mobile App (`apps/mobile/.env`)

```bash
# API endpoint
EXPO_PUBLIC_API_URL="http://localhost:3030"

# PostHog (mobile analytics)
EXPO_PUBLIC_POSTHOG_KEY="your-posthog-project-key"
EXPO_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"

# RevenueCat (subscriptions)
EXPO_PUBLIC_REVENUECAT_API_KEY="your-revenuecat-mobile-key"
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM="premium"
EXPO_PUBLIC_REVENUECAT_PRODUCT_MONTHLY="monthly_subscription"
EXPO_PUBLIC_REVENUECAT_PRODUCT_YEARLY="yearly_subscription"
```

### Environment Variable Prefixes

- **`NEXT_PUBLIC_*`** - Exposed to browser in Next.js web app
- **`EXPO_PUBLIC_*`** - Exposed to Expo mobile app
- **No prefix** - Server-side only (API, database scripts)

⚠️ **Never put secrets in `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*` variables** - they're visible to users!

---

## Database Setup

### Understanding Drizzle Migrations

This project uses **Drizzle ORM** with a schema-first approach:

1. **Define schemas** in `packages/database/src/schema/*.ts`
2. **Generate migration** with `pnpm --filter database generate`
3. **Review SQL** in `packages/database/drizzle/`
4. **Apply migration** with `pnpm --filter database db:migrate`

### Creating Your First Migration

```bash
# 1. Modify a schema file
# Edit packages/database/src/schema/users.ts

# 2. Generate migration
pnpm --filter database generate

# 3. Review the generated SQL
cat packages/database/drizzle/0001_your_migration.sql

# 4. Apply migration
pnpm --filter database db:migrate
```

### Database GUI

**Drizzle Studio** provides a web GUI for your database:

```bash
pnpm --filter database db:studio
# Opens at http://localhost:4983
```

### Resetting Database

```bash
# Drop and recreate (DESTRUCTIVE!)
docker exec -it postgres-dev psql -U dev -c "DROP DATABASE dev;"
docker exec -it postgres-dev psql -U dev -c "CREATE DATABASE dev;"

# Re-run migrations
pnpm --filter database db:migrate

# Seed data
pnpm --filter database db:seed
```

---

## Mobile Development Setup

### iOS Development (macOS only)

**Install Xcode**:

```bash
# Install from App Store or:
xcode-select --install
```

**Install CocoaPods**:

```bash
sudo gem install cocoapods
```

**Run on simulator**:

```bash
cd apps/mobile
pnpm ios
```

### Android Development

**Install Android Studio** from [developer.android.com](https://developer.android.com/studio)

**Set environment variables** in `~/.zshrc` or `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Create virtual device**:

1. Open Android Studio
2. Tools → Device Manager
3. Create Virtual Device
4. Select a device (e.g., Pixel 6)
5. Download system image (e.g., API 34)

**Run on emulator**:

```bash
cd apps/mobile
pnpm android
```

### Expo Go (Quickest Setup)

**For quick testing without full SDK setup**:

1. Install Expo Go on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Run `pnpm dev` in `apps/mobile`
3. Scan QR code with Expo Go

⚠️ **Limitations**: Expo Go doesn't support custom native modules (RevenueCat won't work in Expo Go)

---

## Common Pitfalls

### 1. Wrong Node Version

**Problem**: `pnpm install` fails or apps won't start

**Solution**:

```bash
node --version  # Must be >= 20.0.0
nvm use 20      # Or install Node 20
```

### 2. Wrong pnpm Version

**Problem**: "Lockfile version mismatch" or install errors

**Solution**:

```bash
pnpm --version  # Must be >= 9.0.0
npm install -g pnpm@latest
```

### 3. Database Not Running

**Problem**: "Connection refused" when running migrations or starting API

**Solution**:

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not, start it
docker start postgres-dev

# Or create new container
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=dev \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Port Already in Use

**Problem**: "EADDRINUSE: address already in use :::3000"

**Solution**:

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env files
```

### 5. Missing Environment Variables

**Problem**: Apps start but features don't work (auth, analytics, etc.)

**Solution**:

```bash
# Check .env.example files for required variables
diff apps/api/.env.example apps/api/.env

# Copy missing variables
```

### 6. Stale Build Cache

**Problem**: Changes not appearing, type errors that don't make sense

**Solution**:

```bash
# Clear everything
pnpm clean

# Reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install

# Rebuild
pnpm build
```

### 7. Mobile App Won't Connect to API

**Problem**: Mobile app can't reach `http://localhost:3030`

**Solution**:

```bash
# localhost doesn't work on physical devices or emulators
# Use your machine's IP address

# Find your IP
ipconfig getifaddr en0  # macOS
ip addr show            # Linux

# Update apps/mobile/.env
EXPO_PUBLIC_API_URL="http://192.168.1.XXX:3030"
```

---

## Troubleshooting

### Port Conflicts

**Symptoms**:

- "EADDRINUSE: address already in use :::3000"
- "Port 3030 is already in use"

**Solutions**:

Find and kill process using port:

```bash
# macOS/Linux
lsof -i :3030
kill -9 <PID>

# Windows
netstat -ano | findstr :3030
taskkill /PID <PID> /F
```

Or change ports in environment files:

```bash
# apps/api/.env
PORT=3031

# apps/web/.env.local (Next.js will use next available port automatically)

# Mobile automatically finds available port
```

### Database Connection Errors

**Symptoms**:

- "Connection refused"
- "FATAL: password authentication failed"
- "database does not exist"

**Solutions**:

1. **Check PostgreSQL is running**:

   ```bash
   # Docker
   docker ps | grep postgres
   docker start postgres-dev

   # Native PostgreSQL
   brew services list
   brew services start postgresql@16
   ```

2. **Verify DATABASE_URL format**:

   ```bash
   # Should be: postgresql://user:password@host:port/database
   echo $DATABASE_URL
   ```

3. **Test connection**:

   ```bash
   # Using psql
   psql "postgresql://dev:dev@localhost:5432/dev"

   # Using docker
   docker exec -it postgres-dev psql -U dev -d dev
   ```

4. **Create database if missing**:
   ```bash
   docker exec -it postgres-dev psql -U dev -c "CREATE DATABASE dev;"
   ```

### Module Resolution Errors

**Symptoms**:

- "Cannot find module 'components'"
- "Module not found: Can't resolve 'database'"
- Type errors for workspace packages

**Solutions**:

1. **Clear node_modules and reinstall**:

   ```bash
   rm -rf node_modules apps/*/node_modules packages/*/node_modules
   pnpm install
   ```

2. **Clear Turborepo cache**:

   ```bash
   pnpm clean
   rm -rf .turbo
   ```

3. **Rebuild packages**:

   ```bash
   pnpm build
   ```

4. **Check workspace references**:
   ```bash
   # Verify packages are linked correctly
   ls -la node_modules/components
   # Should be a symlink to packages/components
   ```

### TypeScript Errors

**Symptoms**:

- Type errors that don't make sense
- "Cannot find name" errors for packages
- Outdated type definitions

**Solutions**:

1. **Rebuild TypeScript packages**:

   ```bash
   pnpm --filter database build
   pnpm --filter service-contracts build
   pnpm typecheck
   ```

2. **Restart TypeScript server** (in VS Code):
   - `Cmd+Shift+P` → "TypeScript: Restart TS Server"

3. **Check tsconfig.json references**:

   ```bash
   # Each app should reference packages it uses
   cat apps/web/tsconfig.json
   ```

4. **Clear TypeScript cache**:
   ```bash
   # Delete all tsconfig.tsbuildinfo files
   find . -name "tsconfig.tsbuildinfo" -delete
   ```

### Build Failures

**Symptoms**:

- "Build failed" errors
- "Out of memory" errors
- Stale build outputs

**Solutions**:

1. **Increase Node memory**:

   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   pnpm build
   ```

2. **Build sequentially instead of parallel**:

   ```bash
   pnpm --filter database build
   pnpm --filter components build
   pnpm --filter ui build
   pnpm --filter web build
   ```

3. **Clear all build artifacts**:
   ```bash
   pnpm clean
   rm -rf apps/*/.next apps/*/dist packages/*/dist
   ```

### Mobile App Issues

**Symptoms**:

- "Unable to resolve module"
- "Metro bundler error"
- Native module errors

**Solutions**:

1. **Clear Metro bundler cache**:

   ```bash
   cd apps/mobile
   pnpm start --clear
   ```

2. **Reset iOS build** (macOS only):

   ```bash
   cd apps/mobile
   rm -rf ios/Pods ios/build
   npx pod-install
   ```

3. **Reset Android build**:

   ```bash
   cd apps/mobile/android
   ./gradlew clean
   ```

4. **Reinstall node_modules**:
   ```bash
   cd apps/mobile
   rm -rf node_modules
   pnpm install
   ```

### Authentication Not Working

**Symptoms**:

- Login/signup fails silently
- "Invalid credentials" for correct password
- OAuth redirects don't work

**Solutions**:

1. **Check BETTER_AUTH_SECRET is set**:

   ```bash
   # Must be at least 32 characters
   grep BETTER_AUTH_SECRET apps/api/.env

   # Generate new secret if needed
   openssl rand -base64 32
   ```

2. **Verify BETTER_AUTH_URL matches your API**:

   ```bash
   # apps/api/.env
   BETTER_AUTH_URL="http://localhost:3030"  # Must match actual API URL
   ```

3. **Check database has auth tables**:

   ```bash
   pnpm --filter database db:studio
   # Look for: user, session, account tables
   ```

4. **Run migrations**:
   ```bash
   pnpm --filter database db:migrate
   ```

### Hot Reload Not Working

**Symptoms**:

- Changes don't appear in browser/app
- Have to manually refresh
- Turborepo not detecting changes

**Solutions**:

1. **Increase file watcher limit** (macOS/Linux):

   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   ulimit -n 10240

   # Or use watchman
   brew install watchman
   ```

2. **Restart dev servers**:

   ```bash
   # Kill all node processes
   pkill -f node

   # Restart
   pnpm dev
   ```

3. **Check Turborepo is watching**:
   ```bash
   # Should see "watching for changes..."
   pnpm dev
   ```

---

## Additional Resources

### Official Documentation

- **Core Tools**:
  - [pnpm Workspaces](https://pnpm.io/workspaces)
  - [Turborepo](https://turbo.build/repo/docs)
  - [TypeScript](https://www.typescriptlang.org/docs/)

- **Frontend**:
  - [Next.js 15](https://nextjs.org/docs)
  - [Expo](https://docs.expo.dev/)
  - [React 19](https://react.dev/)
  - [Gluestack UI](https://ui.gluestack.io/)
  - [NativeWind](https://www.nativewind.dev/)
  - [Tailwind CSS](https://tailwindcss.com/docs)

- **Backend**:
  - [Fastify](https://fastify.dev/)
  - [Drizzle ORM](https://orm.drizzle.team/)
  - [Better Auth](https://www.better-auth.com/)
  - [Zod](https://zod.dev/)

- **Services**:
  - [PostHog](https://posthog.com/docs)
  - [RevenueCat](https://www.revenuecat.com/docs)
  - [i18next](https://www.i18next.com/)

### Internal Documentation

- **Guides**:
  - [Authentication](./guides/authentication.md)
  - [Database Migrations](./guides/database-migrations.md)
  - [Testing](./guides/testing.md)
  - [Adding Components](./guides/adding-components.md)
  - [Creating Routes](./guides/creating-routes.md)
  - [Monorepo Best Practices](./guides/monorepo-best-practices.md)

- **Package Docs**:
  - [Auth Package](./packages/auth.md)
  - [Database Package](./packages/database.md)
  - [Components Package](./packages/components.md)
  - [UI Package](./packages/ui.md)

- **Architecture**:
  - [ADR: Using Drizzle ORM](./adr/0001-use-drizzle-orm-with-postgresql.md)
  - [ADR: Adopting Gluestack UI v3](./adr/0002-adopt-gluestack-ui-v3.md)

### Community & Support

- **Issues**: Report bugs at [GitHub Issues](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)
- **Discussions**: Ask questions at [GitHub Discussions](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions)
- **Contributing**: See [CONTRIBUTING.md](../.github/CONTRIBUTING.md)

---

## Next Steps

Once you have everything running:

1. **Explore the codebase**:
   - Check out example screens in `packages/ui/src/screens/`
   - Review API routes in `apps/api/src/routes/`
   - See database schemas in `packages/database/src/schema/`

2. **Read the guides**:
   - [Creating your first API route](./guides/creating-routes.md)
   - [Adding a new screen](./guides/adding-components.md)
   - [Database migrations workflow](./guides/database-migrations.md)

3. **Customize for your project**:
   - Update theme in `packages/tailwind-config/`
   - Add your database tables
   - Configure OAuth providers
   - Set up analytics and subscriptions

4. **Deploy**:
   - See deployment guides for [Vercel](https://vercel.com/docs), [EAS](https://docs.expo.dev/eas/), and your API host
