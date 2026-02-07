# Deploying

This guide covers deploying your application to production across all platforms.

## Deployment Overview

| App          | Recommended Host | Alternatives                  |
| ------------ | ---------------- | ----------------------------- |
| **Web**      | Vercel           | Netlify, Railway, AWS Amplify |
| **API**      | Railway          | Render, Fly.io, AWS ECS       |
| **Mobile**   | EAS Build        | Fastlane, App Center          |
| **Database** | Supabase         | Neon, Railway, AWS RDS        |

## Pre-Deployment Checklist

Before deploying, verify:

- [ ] All environment variables set for production
- [ ] `pnpm env:check` passes
- [ ] `pnpm build` succeeds locally
- [ ] `pnpm typecheck` passes
- [ ] Database migrations are up to date
- [ ] Secrets are NOT committed to git

## Environment Variables

### Production Configuration

Copy `config/env.production.example` and set all required values:

```bash
# Generate a secure auth secret
openssl rand -base64 32

# Required for production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RESEND_API_KEY=re_live_xxxxx
EMAIL_FROM_ADDRESS=hello@yourdomain.com
```

### Environment-Specific URLs

| Environment | Web URL                        | API URL                            |
| ----------- | ------------------------------ | ---------------------------------- |
| Development | http://localhost:3000          | http://localhost:3030              |
| Staging     | https://staging.yourdomain.com | https://api-staging.yourdomain.com |
| Production  | https://yourdomain.com         | https://api.yourdomain.com         |

## Database Deployment

### Option A: Supabase (Recommended)

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings > Database
3. Set `DATABASE_URL` with `?sslmode=require`

```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

4. Run migrations:

```bash
DATABASE_URL=<production-url> pnpm db:migrate
```

### Option B: Neon

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string from dashboard
3. Set `DATABASE_URL` with pooled connection

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Migration Strategy

**Never run migrations automatically in production.** Instead:

1. Run migrations manually before deploying code changes
2. Use a CI/CD step that runs migrations in a controlled manner
3. Back up database before running migrations

```bash
# Manual migration
DATABASE_URL=<production-url> pnpm db:migrate

# Or via CI/CD
- name: Run migrations
  run: pnpm db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Web Deployment (Vercel)

### Initial Setup

1. Connect GitHub repo to Vercel
2. Set framework preset to "Next.js"
3. Set root directory to `apps/web`

### Environment Variables

In Vercel dashboard, add:

```bash
# Required
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx

# Optional (if using these services)
NEXT_PUBLIC_REVENUECAT_API_KEY=xxxxx
```

### Build Settings

```
Build Command: cd ../.. && pnpm build --filter=@app/web
Output Directory: .next
Install Command: pnpm install
```

### Custom Domain

1. Go to Settings > Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate

## API Deployment (Railway)

### Initial Setup

1. Create new project at [railway.app](https://railway.app)
2. Connect GitHub repo
3. Set root directory to `apps/api`

### Environment Variables

In Railway dashboard, add all API environment variables:

```bash
DATABASE_URL=<from-database-provider>
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=https://api.yourdomain.com
TRUSTED_ORIGINS=https://yourdomain.com
RESEND_API_KEY=re_xxxxx
EMAIL_FROM_ADDRESS=hello@yourdomain.com
POSTHOG_KEY=phc_xxxxx
PORT=3030
NODE_ENV=production
```

### Build Settings

```
Build Command: pnpm build --filter=@app/api
Start Command: pnpm --filter=@app/api start
```

### Custom Domain

1. Go to Settings > Networking > Custom Domain
2. Add `api.yourdomain.com`
3. Add CNAME record pointing to Railway

## Mobile Deployment (EAS)

### Prerequisites

1. Expo account at [expo.dev](https://expo.dev)
2. Apple Developer account (for iOS)
3. Google Play Console account (for Android)

### Setup EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
cd apps/mobile
eas build:configure
```

### Environment Variables

Create `apps/mobile/eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://192.168.1.100:3030"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.yourdomain.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.yourdomain.com",
        "EXPO_PUBLIC_POSTHOG_KEY": "phc_xxxxx",
        "EXPO_PUBLIC_REVENUECAT_API_KEY_IOS": "appl_xxxxx",
        "EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID": "goog_xxxxx"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build for Stores

```bash
# iOS App Store build
eas build --platform ios --profile production

# Android Play Store build
eas build --platform android --profile production

# Both platforms
eas build --platform all --profile production
```

### Submit to Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

### OTA Updates

For JavaScript-only changes (no native code):

```bash
eas update --branch production --message "Bug fix"
```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test

  migrate:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy-web:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"

  deploy-api:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/railway-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          service: api
```

## Monitoring & Observability

### PostHog Analytics

Analytics is already configured. In production, ensure:

1. Production API key is set (`NEXT_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`, `POSTHOG_KEY`)
2. Verify events are being captured in PostHog dashboard
3. Set up dashboards for key metrics

### Error Tracking

The `ErrorBoundary` components automatically capture React errors. Consider adding:

```typescript
// In API error handlers
import { posthog } from "./plugins/posthog-analytics";

posthog.capture("api_error", {
  path: request.url,
  method: request.method,
  error: error.message,
});
```

### Health Checks

The API includes a health endpoint at `/health`:

```bash
curl https://api.yourdomain.com/health
# {"status":"ok","timestamp":"2024-..."}
```

Use this for:

- Load balancer health checks
- Uptime monitoring (UptimeRobot, Pingdom)
- CI/CD deployment verification

## Rollback Procedures

### Web (Vercel)

1. Go to Deployments in Vercel dashboard
2. Find the previous working deployment
3. Click "..." > "Promote to Production"

### API (Railway)

1. Go to Deployments in Railway dashboard
2. Click on previous successful deployment
3. Click "Redeploy"

### Mobile

OTA updates can be rolled back:

```bash
# List recent updates
eas update:list

# Roll back by republishing previous update
eas update:republish --group <previous-update-group-id>
```

For native code issues, submit a new build to stores.

### Database

1. Restore from backup (provider-specific)
2. Or run reverse migration if available

## Security Checklist

- [ ] `BETTER_AUTH_SECRET` is unique and secure (32+ chars)
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] `TRUSTED_ORIGINS` only includes your domains
- [ ] No secrets in client-side environment variables
- [ ] API rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Email sender domain is verified in Resend

## Troubleshooting

### "Invalid origin" errors

Check that `TRUSTED_ORIGINS` includes all your frontend URLs:

```bash
TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

### Database connection issues

1. Verify connection string includes `?sslmode=require`
2. Check if IP needs to be allowlisted
3. Verify credentials are correct

### Mobile app not connecting

1. Ensure `EXPO_PUBLIC_API_URL` is set in EAS build profile
2. Verify the API is accessible from mobile network
3. Check for certificate issues with HTTPS

### Emails not sending

1. Verify `RESEND_API_KEY` is the live key (not test)
2. Check sender domain is verified in Resend
3. Look for errors in Resend dashboard

## Next Steps

- **[guides/ANALYTICS.md](./guides/ANALYTICS.md)** - Set up production dashboards
- **[guides/MONITORING.md](./guides/MONITORING.md)** - Advanced observability
- **[guides/SECURITY.md](./guides/SECURITY.md)** - Security hardening
