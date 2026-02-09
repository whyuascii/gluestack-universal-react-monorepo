# Cross-Platform Boilerplate

A starter for web and mobile apps with **80-90% code sharing**. Skip the setup, start building.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-enabled-blueviolet)](https://claude.ai/code)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/whyuascii)

**[Quick Start](#quick-start)** | **[What's Included](#whats-included)** | **[Architecture](#architecture)** | **[Using Claude Code](#using-claude-code)** | **[Docs](#documentation)**

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/whyuascii/gluestack-universal-react-monorepo.git my-app
cd my-app

# 2. Install
pnpm install

# 3. Configure
cp .env.example .env          # Edit with your API keys

# 4. Database
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app \
  -p 5432:5432 -d postgres:16
pnpm --filter database db:migrate

# 5. Run
pnpm dev
```

| App    | URL                   |
| ------ | --------------------- |
| Web    | http://localhost:3000 |
| API    | http://localhost:3030 |
| Mobile | http://localhost:8081 |
| Admin  | http://localhost:3001 |

> **Other clone options:** Use the GitHub "Use this template" button for a clean history, or `npx degit whyuascii/gluestack-universal-react-monorepo my-app` for no git history.

---

## What's Included

| Feature            | Details                                                            |
| ------------------ | ------------------------------------------------------------------ |
| **Auth**           | Email/password, verification, password reset, sessions             |
| **Multi-Tenant**   | Groups/orgs, invitations, two-tier RBAC                            |
| **Notifications**  | 20 Novu workflows, in-app, push, email                             |
| **Subscriptions**  | Polar (web) + RevenueCat (mobile), unified entitlements            |
| **Ads**            | AdMob (mobile) + AdSense (web), tier-gated                         |
| **Admin Portal**   | User/tenant management, impersonation, metrics                     |
| **Shared Screens** | Login, signup, dashboard, settings, groups, notifications, paywall |
| **i18n**           | English + Spanish, ready for more                                  |
| **Analytics**      | PostHog events + feature flags, OpenTelemetry logging              |
| **Email**          | Resend + React Email templates                                     |

---

## Tech Stack

| Layer             | Technology                                |
| ----------------- | ----------------------------------------- |
| **Monorepo**      | Turborepo + pnpm                          |
| **Web**           | Next.js 15 (App Router) + React 19        |
| **Mobile**        | Expo 54 + React Native 0.81               |
| **API**           | Fastify 5 + oRPC (type-safe RPC)          |
| **Database**      | Drizzle ORM + PostgreSQL                  |
| **Auth**          | Better Auth                               |
| **UI**            | Gluestack UI v3 + NativeWind 4 (Tailwind) |
| **Forms/Tables**  | TanStack Form + TanStack Table + Zod      |
| **Analytics**     | PostHog + OpenTelemetry                   |
| **Email**         | Resend + React Email                      |
| **Subscriptions** | Polar (web) + RevenueCat (mobile)         |
| **Notifications** | Novu (in-app/email) + Expo Push           |
| **Ads**           | Google AdMob + AdSense                    |
| **i18n**          | i18next (EN + ES)                         |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                            APPS                                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │ apps/web │  │apps/mobile│  │ apps/api │  │apps/admin│     │
│   │ (Next.js)│  │  (Expo)  │  │(Fastify) │  │ (Next.js)│     │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
└────────┼─────────────┼─────────────┼─────────────┼────────────┘
         │             │             │             │
         └──────┬──────┘             │             │
                │                    │             │
┌───────────────┼────────────────────┼─────────────┼────────────┐
│               ▼                    ▼             ▼            │
│    ┌──────────────────┐    ┌──────────────────────┐           │
│    │   packages/ui    │    │  packages/database   │           │
│    │ screens, hooks,  │    │   Drizzle schemas    │           │
│    │ stores, oRPC     │    │   Zod validators     │           │
│    └──────────────────┘    └──────────────────────┘           │
│                                                                │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│    │ components  │ │    i18n     │ │    auth     │            │
│    │ (Gluestack) │ │ (i18next)   │ │(BetterAuth) │            │
│    └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                                │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│    │  analytics  │ │notifications│ │subscriptions│            │
│    │ (PostHog)   │ │   (Novu)    │ │(Polar/RC)   │            │
│    └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                                │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│    │   mailer    │ │    ads      │ │   config    │            │
│    │  (Resend)   │ │(AdMob/Sense)│ │ (RBAC, etc) │            │
│    └─────────────┘ └─────────────┘ └─────────────┘            │
│                        PACKAGES                                │
└────────────────────────────────────────────────────────────────┘
```

**Layer rules** — lower layers cannot import from higher layers:

```
L1 (Foundation):  typescript-config, eslint-config, tailwind-config, config
L2 (Infra):       database, auth, mailer
L3 (Features):    components, i18n, analytics, notifications, subscriptions
L4 (Business):    ui (screens, hooks, stores)
L5 (Apps):        web, mobile, api, admin
```

---

## Common Commands

```bash
# Development
pnpm dev                          # All apps
pnpm --filter web dev             # Web only
pnpm --filter api dev             # API only
pnpm --filter mobile dev          # Mobile only
pnpm --filter admin dev           # Admin only

# Database
pnpm --filter database db:migrate # Run migrations
pnpm --filter database db:studio  # Open Drizzle Studio
pnpm --filter database generate   # Generate migration from schema

# Quality
pnpm typecheck                    # Type check all packages
pnpm lint                         # Lint all packages
pnpm test                         # Run all tests
pnpm build                        # Production build
```

---

## Using Claude Code

This repo is fully configured for AI-assisted development with [Claude Code](https://claude.ai/code). Claude understands the architecture, enforces patterns, and can build complete features across all layers.

```bash
npm install -g @anthropic-ai/claude-code
claude
```

### What You Can Do

```
"Build me a task management feature with CRUD and a list screen"
"Create a settings screen for notification preferences"
"Add an API endpoint for file uploads with S3"
"Review the auth module for security issues"
"Add Spanish translations for the dashboard"
```

### How It Works

Claude reads a hierarchy of `CLAUDE.md` files that describe every package, plus rules that enforce the architecture. It uses **12 specialized skills** that activate based on your request:

| Skill               | Trigger                                                     |
| ------------------- | ----------------------------------------------------------- |
| `build-feature`     | "Build me a [feature]" — orchestrates everything end-to-end |
| `screen-builder`    | "Create a new [name] screen" — UI + routes + translations   |
| `backend-developer` | "Create an API for [feature]" — contracts, routes, actions  |
| `web-developer`     | "Build the web frontend" — Next.js pages and hooks          |
| `mobile-developer`  | "Build the mobile screen" — Expo routes and native code     |
| `code-reviewer`     | "Review this code" — patterns, performance, accessibility   |
| `security-reviewer` | "Security review" — OWASP top 10 audit                      |
| `test-engineer`     | "Write tests" — API, component, and E2E tests               |

### Multi-Agent Workflows

For large features, Claude dispatches multiple agents that work in parallel:

```
You: "Build me a project management feature"
 → Design (specs, layout)
 → Backend (schema, contracts, routes)
 → Web + Mobile (parallel — shared screens, platform routes)
 → Tests → Code Review → Security Review
```

### Advanced: Build a Product from a PRD

Use git worktrees to develop features in isolation across parallel Claude sessions, then merge them together. This enables building an entire product from a PRD in days, not weeks.

**Full guide: [docs/WORKING-WITH-CLAUDE.md](./docs/WORKING-WITH-CLAUDE.md)** — covers skills, workflows, multi-agent development, context management, and the complete worktree-based product development workflow.

---

## Customize Your App

<details>
<summary><strong>Required changes after cloning</strong></summary>

| File                        | What to Change                                      |
| --------------------------- | --------------------------------------------------- |
| `.env`                      | All API keys and secrets (copy from `.env.example`) |
| `apps/mobile/app.config.js` | App name, slug, scheme, bundle IDs, EAS project ID  |
| `.github/CODEOWNERS`        | Your GitHub username                                |
| `package.json` (root)       | Author field                                        |

</details>

<details>
<summary><strong>Branding</strong></summary>

| File                               | What to Change                                         |
| ---------------------------------- | ------------------------------------------------------ |
| `apps/web/public/icons/`           | Favicon (generate at [favicon.io](https://favicon.io)) |
| `apps/mobile/assets/images/`       | `icon.png`, `splash-icon.png`, `adaptive-icon.png`     |
| `apps/web/src/app/layout.tsx`      | Site metadata (title, description, OG image)           |
| `packages/tailwind-config/themes/` | Create custom theme or modify `sample.js`              |
| `apps/web/src/app/privacy/`        | Privacy policy content                                 |
| `apps/web/src/app/terms/`          | Terms of service content                               |

</details>

<details>
<summary><strong>Mobile setup (Expo)</strong></summary>

```bash
cd apps/mobile
npm install -g eas-cli
eas login
eas init
```

Update `apps/mobile/app.config.js` with your app name, slug, scheme, bundle identifiers, owner, EAS project ID, and legal URLs. Then regenerate native projects:

```bash
npx expo prebuild --clean
```

</details>

---

## Service Setup

<details>
<summary><strong>Novu (Notifications)</strong></summary>

1. Sign up at [novu.co](https://novu.co) and get your `NOVU_SECRET_KEY` and `NOVU_APP_ID`

2. Add to `.env`:

```bash
NOVU_SECRET_KEY=your-secret-key
NOVU_APP_ID=your-app-id
NEXT_PUBLIC_NOVU_APP_ID=your-app-id
EXPO_PUBLIC_NOVU_APP_ID=your-app-id
```

3. Test workflows locally:

```bash
# Terminal 1
pnpm --filter api dev

# Terminal 2
npx novu@latest dev --port 3030 --route /api/novu
# Open http://localhost:2022
```

**20 pre-built workflows:** welcome, invite-received, member-joined, todo-assigned, todo-nudge, todo-completed, event-created, event-reminder, event-changed, limit-alert, achievement, survey-created, weekly-summary, reminder, direct-message, milestone, kudos-sent, settings-changed, push-notification, in-app-notification.

</details>

<details>
<summary><strong>Polar (Web Subscriptions)</strong></summary>

```bash
POLAR_ACCESS_TOKEN=your-access-token
POLAR_WEBHOOK_SECRET=whsec_xxx
```

1. Create products/plans in [Polar dashboard](https://polar.sh)
2. Set up webhook: `https://your-api.com/webhooks/subscriptions/polar`
3. Events: `subscription.created`, `subscription.updated`, `subscription.canceled`

</details>

<details>
<summary><strong>RevenueCat (Mobile Subscriptions)</strong></summary>

```bash
REVENUECAT_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_REVENUECAT_API_KEY=xxx
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=xxx
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=xxx
```

1. Create app in [RevenueCat dashboard](https://app.revenuecat.com)
2. Set up webhook: `https://your-api.com/webhooks/subscriptions/revenuecat`
3. Configure products in App Store Connect / Google Play Console

</details>

<details>
<summary><strong>Subscription Tiers & Entitlements</strong></summary>

Unified across Polar and RevenueCat:

```typescript
const entitlements = await getTenantEntitlements(tenantId);
// entitlements.tier: "free" | "pro" | "enterprise"
```

| Feature          | Free     | Pro       | Enterprise |
| ---------------- | -------- | --------- | ---------- |
| Ads              | Yes      | No        | No         |
| Members          | 5        | Unlimited | Unlimited  |
| Export limit     | 10/month | Unlimited | Unlimited  |
| Priority support | No       | Yes       | Yes        |

</details>

<details>
<summary><strong>PostHog + RevenueCat Integration</strong></summary>

RevenueCat can send subscription events to PostHog for unified analytics:

1. Set `$posthogUserId` attribute in RevenueCat to match PostHog identity
2. In RevenueCat dashboard: **Integrations > PostHog** > add your Project API key
3. Events tracked: `rc_initial_purchase_event`, `rc_trial_started_event`, `rc_renewal_event`, `rc_cancellation_event`, `rc_expiration_event`

See [RevenueCat PostHog docs](https://www.revenuecat.com/docs/integrations/posthog) for full setup.

</details>

---

## Accounts Needed

| Service            | Required     | Purpose                    | Link                                             |
| ------------------ | ------------ | -------------------------- | ------------------------------------------------ |
| **Expo**           | Yes (mobile) | Mobile builds, OTA updates | [expo.dev](https://expo.dev)                     |
| **PostHog**        | Yes          | Analytics, feature flags   | [posthog.com](https://posthog.com)               |
| **Resend**         | Yes          | Transactional email        | [resend.com](https://resend.com)                 |
| **Novu**           | Yes          | In-app notifications       | [novu.co](https://novu.co)                       |
| **Polar**          | Optional     | Web subscriptions          | [polar.sh](https://polar.sh)                     |
| **RevenueCat**     | Optional     | Mobile subscriptions       | [revenuecat.com](https://revenuecat.com)         |
| **Google AdMob**   | Optional     | Mobile ads                 | [admob.google.com](https://admob.google.com)     |
| **Google AdSense** | Optional     | Web ads                    | [adsense.google.com](https://adsense.google.com) |
| **Supabase**       | Optional     | Managed PostgreSQL         | [supabase.com](https://supabase.com)             |

---

## Documentation

| Guide                                                        | Description                                     |
| ------------------------------------------------------------ | ----------------------------------------------- |
| [CLAUDE.md](./CLAUDE.md)                                     | Architecture and patterns (for Claude Code)     |
| [docs/WORKING-WITH-CLAUDE.md](./docs/WORKING-WITH-CLAUDE.md) | Building products with Claude Code              |
| [docs/getting-started.md](./docs/getting-started.md)         | Detailed environment setup                      |
| [docs/BUILDING-FEATURES.md](./docs/BUILDING-FEATURES.md)     | Where to add your code                          |
| [docs/CUSTOMIZING-BRAND.md](./docs/CUSTOMIZING-BRAND.md)     | Themes, logos, copy                             |
| [docs/DEPLOYING.md](./docs/DEPLOYING.md)                     | Production deployment                           |
| [docs/guides/](./docs/guides/)                               | Topic guides (auth, database, API, email, etc.) |

---

## Links

- **Documentation**: [/docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/whyuascii/gluestack-universal-react-monorepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/whyuascii/gluestack-universal-react-monorepo/discussions)
- **Support**: [Buy Me a Coffee](https://buymeacoffee.com/whyuascii)

---

<p align="center">
  Built with Turborepo, Next.js, Expo, Drizzle, Gluestack, NativeWind, PostHog, Novu, Polar, RevenueCat, i18next, and Fastify
</p>

<p align="center">
  <sub>Built with experience from real-world production apps</sub>
</p>
