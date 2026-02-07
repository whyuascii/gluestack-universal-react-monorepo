# Cross-Platform Boilerplate

A starter for web and mobile apps with **80-90% code sharing**. Skip the setup, start building.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-enabled-blueviolet)](https://claude.ai/code)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/whyuascii)

---

## Tech Stack

| Layer             | Technology                                        |
| ----------------- | ------------------------------------------------- |
| **Monorepo**      | Turborepo + pnpm                                  |
| **Web**           | Next.js 15 (App Router) + React 19                |
| **Mobile**        | Expo 54 + React Native 0.81                       |
| **API**           | Fastify 5 + oRPC (type-safe RPC)                  |
| **Database**      | Drizzle ORM + PostgreSQL                          |
| **Auth**          | Better Auth (email/password, verification, reset) |
| **UI**            | Gluestack UI v3 + NativeWind 4 (Tailwind)         |
| **Forms**         | TanStack Form + Zod                               |
| **Tables**        | TanStack Table                                    |
| **Analytics**     | PostHog + OpenTelemetry logging                   |
| **Email**         | Resend + React Email                              |
| **Subscriptions** | Polar (web) + RevenueCat (mobile)                 |
| **Notifications** | Novu (in-app/email) + Expo Push (mobile)          |
| **Ads**           | Google AdMob (mobile) + AdSense (web)             |
| **i18n**          | i18next (EN + ES)                                 |
| **Admin**         | Internal admin portal (Next.js)                   |

---

## Accounts Needed

| Service            | Required     | Purpose                           | Sign Up                                          |
| ------------------ | ------------ | --------------------------------- | ------------------------------------------------ |
| **Expo**           | Yes (mobile) | Mobile builds, OTA updates        | [expo.dev](https://expo.dev)                     |
| **PostHog**        | Yes          | Analytics, feature flags, logging | [posthog.com](https://posthog.com)               |
| **Resend**         | Yes          | Transactional email               | [resend.com](https://resend.com)                 |
| **Novu**           | Yes          | In-app notifications, workflows   | [novu.co](https://novu.co)                       |
| **Polar**          | Optional     | Web subscriptions/payments        | [polar.sh](https://polar.sh)                     |
| **RevenueCat**     | Optional     | Mobile subscriptions              | [revenuecat.com](https://revenuecat.com)         |
| **Google AdMob**   | Optional     | Mobile ads                        | [admob.google.com](https://admob.google.com)     |
| **Google AdSense** | Optional     | Web ads                           | [adsense.google.com](https://adsense.google.com) |
| **Supabase**       | Optional     | Managed PostgreSQL                | [supabase.com](https://supabase.com)             |

---

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Docker (for local PostgreSQL)

### 1. Create Your Project from Template

**Option A: Use GitHub Template (Recommended)**

Click the "Use this template" button on GitHub to create your own repo with a clean history.

**Option B: Clone and Reinitialize**

```bash
# Clone the template
git clone https://github.com/whyuascii/gluestack-universal-react-monorepo.git my-app
cd my-app

# Remove template git history and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"

# Connect to your own repo
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**Option C: Use degit (no git history)**

```bash
npx degit whyuascii/gluestack-universal-react-monorepo my-app
cd my-app
git init
git add .
git commit -m "Initial commit from template"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys.

### 4. Start Database

```bash
# Option A: Docker (simple)
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app \
  -p 5432:5432 \
  -d postgres:16

# Option B: Supabase local
supabase start
```

### 5. Run Migrations & Start

```bash
pnpm --filter database db:migrate
pnpm dev
```

**Running at:**

- Web: http://localhost:3000
- Mobile: http://localhost:8081
- API: http://localhost:3030
- Admin: http://localhost:3001

### 5. Mobile Setup (Expo)

```bash
cd apps/mobile
npm install -g eas-cli
eas login
eas init  # Create your Expo project
```

Update `apps/mobile/app.config.js`:

- `name` and `slug`: Your app name
- `scheme`: Your deep link scheme
- `bundleIdentifier` (iOS) and `package` (Android): Your app identifiers (e.g., `com.yourorg.yourapp`)
- `owner`: Your Expo username
- `eas.projectId`: Your Expo project ID
- `privacyPolicyUrl` and `termsOfServiceUrl`: Your legal page URLs

After updating, regenerate native projects:

```bash
npx expo prebuild --clean
```

---

## Customize Your App

After cloning, update these files to make it your own:

### Required Changes

| File                        | What to Change                                                                |
| --------------------------- | ----------------------------------------------------------------------------- |
| `apps/mobile/app.config.js` | App name, slug, scheme, bundle identifiers, owner, EAS project ID, legal URLs |
| `.env`                      | All API keys and secrets (copy from `.env.example`)                           |
| `.github/CODEOWNERS`        | Replace `@your-github-username` with your GitHub username                     |
| `package.json` (root)       | Add your name to `author` field                                               |

### Branding

| File                               | What to Change                                                           |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `apps/web/public/icons/`           | Replace with your favicon (generate at [favicon.io](https://favicon.io)) |
| `apps/mobile/assets/images/`       | Replace `icon.png`, `splash-icon.png`, `adaptive-icon.png`               |
| `apps/web/src/app/layout.tsx`      | Update site metadata (title, description, OG image)                      |
| `packages/tailwind-config/themes/` | Create custom theme or modify `sample.js`                                |

### Legal & Links

| File                        | What to Change                           |
| --------------------------- | ---------------------------------------- |
| `apps/web/src/app/privacy/` | Your privacy policy content              |
| `apps/web/src/app/terms/`   | Your terms of service content            |
| `README.md`                 | Update Links section with your repo URLs |

### Optional Cleanup

| File                         | What to Change                                                        |
| ---------------------------- | --------------------------------------------------------------------- |
| `packages/i18n/src/locales/` | Update app-specific translation strings                               |
| `apps/mobile/ios/`           | Auto-generated - run `npx expo prebuild --clean` after config changes |
| `apps/mobile/android/`       | Auto-generated - run `npx expo prebuild --clean` after config changes |

---

## What's Included

### Authentication

- Email/password signup and login
- Email verification (production)
- Password reset flow
- Session management

### Multi-Tenant (Groups)

- Create groups/organizations
- Invite members via email
- Two-tier RBAC (tenant roles + member roles)
- Switch between groups

### Notifications (Novu)

- 20 pre-built workflow templates
- In-app notifications via WebSocket
- Push notifications via Expo
- Email notifications via Resend
- User notification preferences

### Subscriptions

- Polar for web payments
- RevenueCat for mobile in-app purchases
- Unified entitlements system
- Feature gating (free/pro/enterprise)

### Ads (Optional)

- Google AdMob for mobile (banner, interstitial, rewarded)
- Google AdSense for web
- Automatic test ad units in development

### Admin Portal

- User management and search
- Tenant inspection
- System metrics
- Impersonation for debugging

### Screens (Shared Web + Mobile)

- Login, Signup, Reset Password, Verify Email
- Dashboard
- Settings (profile, notifications, billing)
- Group management
- Notifications inbox
- Paywall and subscription management

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           APPS                                   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│   │ apps/web │  │apps/mobile│  │ apps/api │  │apps/admin│       │
│   │ (Next.js)│  │  (Expo)  │  │(Fastify) │  │ (Next.js)│       │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└────────┼─────────────┼─────────────┼─────────────┼──────────────┘
         │             │             │             │
         └──────┬──────┘             │             │
                │                    │             │
┌───────────────┼────────────────────┼─────────────┼──────────────┐
│               ▼                    ▼             ▼              │
│    ┌──────────────────┐    ┌──────────────────────┐            │
│    │   packages/ui    │    │  packages/database   │            │
│    │ screens, hooks,  │    │   Drizzle schemas    │            │
│    │ stores, oRPC     │    │   Zod validators     │            │
│    └──────────────────┘    └──────────────────────┘            │
│                                                                 │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│    │ components  │ │    i18n     │ │    auth     │             │
│    │ (Gluestack) │ │ (i18next)   │ │(BetterAuth) │             │
│    └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                 │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│    │  analytics  │ │notifications│ │subscriptions│             │
│    │ (PostHog)   │ │   (Novu)    │ │(Polar/RC)   │             │
│    └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                 │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│    │   mailer    │ │    ads      │ │   config    │             │
│    │  (Resend)   │ │(AdMob/Sense)│ │ (RBAC, etc) │             │
│    └─────────────┘ └─────────────┘ └─────────────┘             │
│                        PACKAGES                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Common Commands

```bash
# Development
pnpm dev                          # Start all apps
pnpm --filter web dev             # Web only
pnpm --filter mobile dev          # Mobile only
pnpm --filter api dev             # API only
pnpm --filter admin dev           # Admin portal only

# Database
pnpm --filter database db:migrate # Run migrations
pnpm --filter database db:studio  # Open Drizzle Studio
pnpm --filter database generate   # Generate migration

# Novu Workflows
# Workflows sync automatically via /api/novu bridge endpoint
# Test locally: Start API, Novu Studio connects at http://localhost:3030/api/novu

# Quality
pnpm typecheck                    # Type check all
pnpm lint                         # Lint all
pnpm test                         # Run tests
pnpm build                        # Production build
```

---

## Novu Notifications Setup

### 1. Get Novu Credentials

Sign up at [novu.co](https://novu.co) and get:

- `NOVU_SECRET_KEY` (API key)
- `NOVU_APP_ID` (Application identifier)

### 2. Configure Environment

```bash
# .env
NOVU_SECRET_KEY=your-secret-key
NOVU_APP_ID=your-app-id
NEXT_PUBLIC_NOVU_APP_ID=your-app-id
EXPO_PUBLIC_NOVU_APP_ID=your-app-id
```

### 3. Sync & Test Workflows

Workflows are defined in `packages/notifications/src/workflows/`. Use Novu Dev Studio to test:

```bash
# Terminal 1: Start API server (exposes Novu bridge)
pnpm --filter api dev

# Terminal 2: Run Novu Dev Studio
npx novu@latest dev --port 3030 --route /api/novu

# Open http://localhost:2022 to see/test workflows
```

### 4. Available Workflows (20 Total)

| Category      | Workflows                                          |
| ------------- | -------------------------------------------------- |
| Generic       | `push-notification`, `in-app-notification`         |
| Onboarding    | `welcome`                                          |
| Social        | `invite-received`, `member-joined`                 |
| Tasks         | `todo-assigned`, `todo-nudge`, `todo-completed`    |
| Events        | `event-created`, `event-reminder`, `event-changed` |
| Alerts        | `limit-alert`, `achievement`, `survey-created`     |
| Engagement    | `weekly-summary`, `reminder`                       |
| Communication | `direct-message`, `milestone`, `kudos-sent`        |
| System        | `settings-changed`                                 |

---

## Subscription Providers Setup

### Polar (Web Payments)

```bash
# .env
POLAR_ACCESS_TOKEN=your-access-token
POLAR_WEBHOOK_SECRET=whsec_xxx
```

1. Create products/plans in [Polar dashboard](https://polar.sh)
2. Set up webhook endpoint: `https://your-api.com/webhooks/subscriptions/polar`
3. Configure webhook events: `subscription.created`, `subscription.updated`, `subscription.canceled`

### RevenueCat (Mobile In-App Purchases)

```bash
# .env
REVENUECAT_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_REVENUECAT_API_KEY=xxx
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=xxx
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=xxx
```

1. Create app in [RevenueCat dashboard](https://app.revenuecat.com)
2. Set up webhook endpoint: `https://your-api.com/webhooks/subscriptions/revenuecat`
3. Configure products in App Store Connect / Google Play Console

### Entitlements System

The subscription system provides unified entitlements across both providers:

```typescript
// Server-side: Check tenant access
import { getTenantEntitlements } from "@app/subscriptions/server";

const entitlements = await getTenantEntitlements(tenantId);
// entitlements.tier: "free" | "pro" | "enterprise"
// entitlements.features.adsEnabled, .exportLimit, .maxMembers, etc.
```

**Tier Features:**
| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Ads | Yes | No | No |
| Members | 5 | Unlimited | Unlimited |
| Export limit | 10/month | Unlimited | Unlimited |
| Priority support | No | Yes | Yes |

---

## Using Claude Code

This project works great with [Claude Code](https://claude.ai/code):

```bash
npm install -g @anthropic-ai/claude-code
claude
```

Ask Claude to build features:

```
"Build a user profiles feature with avatar uploads"
"Add a settings screen for notification preferences"
"Implement push notifications for group invites"
```

Claude reads `CLAUDE.md` for full architecture context.

---

## Documentation

| Guide                                                    | Description                               |
| -------------------------------------------------------- | ----------------------------------------- |
| [CLAUDE.md](./CLAUDE.md)                                 | Architecture, patterns, workflows         |
| [docs/GETTING-STARTED.md](./docs/GETTING-STARTED.md)     | Environment setup                         |
| [docs/BUILDING-FEATURES.md](./docs/BUILDING-FEATURES.md) | Adding features                           |
| [docs/guides/](./docs/guides/)                           | Topic guides (auth, database, API, email) |

---

## Tools & Resources

| Tool                     | Purpose                                                  | Link                                                                  |
| ------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------- |
| **Favicon.io**           | Generate favicons from text, image, or emoji             | [favicon.io/favicon-generator](https://favicon.io/favicon-generator/) |
| **RealFaviconGenerator** | Generate all favicon sizes and manifest                  | [realfavicongenerator.net](https://realfavicongenerator.net/)         |
| **RevenueCat**           | Mobile subscription management with App Store/Play Store | [revenuecat.com](https://www.revenuecat.com/)                         |
| **Polar**                | Web payments, subscriptions, and monetization            | [polar.sh](https://polar.sh/)                                         |
| **PostHog**              | Product analytics, feature flags, and session replay     | [posthog.com](https://posthog.com/)                                   |
| **Claude Code**          | AI coding assistant for building features                | [claude.ai/code](https://claude.ai/code)                              |

### Favicon Setup

1. Generate your favicon at [favicon.io](https://favicon.io/favicon-generator/)
2. Download and extract to `apps/web/public/icons/`
3. The manifest.json and seo.ts are pre-configured for `/icons/` path

### RevenueCat + PostHog Integration

RevenueCat can automatically send subscription events to PostHog for unified analytics:

1. Set the `$posthogUserId` attribute in RevenueCat to match your PostHog user identity
2. In RevenueCat dashboard, navigate to **Integrations > PostHog**
3. Add your PostHog Project API key
4. Configure which events to track (trials, renewals, cancellations, etc.)

**Tracked Events:**

- `rc_initial_purchase_event` - New subscription purchased
- `rc_trial_started_event` / `rc_trial_converted_event` - Trial lifecycle
- `rc_renewal_event` - Subscription renewed
- `rc_cancellation_event` - Subscription cancelled
- `rc_expiration_event` - Subscription expired

See [RevenueCat PostHog docs](https://www.revenuecat.com/docs/integrations/posthog) for full setup.

---

## Links

- **Documentation**: [/docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/whyuascii/gluestack-universal-react-monorepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/whyuascii/gluestack-universal-react-monorepo/discussions)
- **Support**: [Buy Me a Coffee](https://buymeacoffee.com/whyuascii)

---

<p align="center">
  Built with Turborepo • Next.js • Expo • Drizzle • Gluestack • NativeWind • PostHog • Novu • Polar • RevenueCat • i18next • Fastify
</p>

<p align="center">
  <sub>Built with experience from real-world production apps</sub>
</p>
