# apps/web — Next.js 15 Web App

Thin routing wrappers only. All business logic lives in `packages/ui`.

## Route Groups

```
src/app/
├── (auth)/              # Login, signup, password reset (public)
├── (private)/           # Dashboard, todos, settings (auth guard)
├── (public)/            # Landing page (no guard)
├── cookies/             # Cookie policy
├── privacy/             # Privacy policy
├── terms/               # Terms of service
└── og/route.tsx         # Dynamic OG image generator (Edge runtime)
```

## Page Pattern (Thin Wrapper)

```typescript
"use client";
import { DashboardScreen } from "@app/ui";
import { useSession } from "@app/auth";

export default function DashboardPage() {
  const { data: session } = useSession();
  return <DashboardScreen session={session} />;
}
```

Every page follows this pattern: import screen from `@app/ui`, pass session/callbacks.

## Auth Guard

Client-side in `(private)/layout.tsx`:

```typescript
// useSession() → redirect to login if !session
// Shows spinner while checking
// Wraps in InactivityLogoutProvider (15 min timeout)
// Wraps in PrivateSidebar with navigation
```

No middleware.ts — auth is client-side.

## Provider Stack (`providers.tsx`)

```
AnalyticsProvider (PostHog)
  → I18nextProvider (i18n web)
    → QueryClientProvider (React Query)
      → GluestackUIProvider (UI theme)
        → SafeAreaProvider
```

## Key Files

| File                   | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `providers.tsx`        | All client context providers             |
| `registry.tsx`         | Styled-JSX + React Native Web styling    |
| `(private)/layout.tsx` | Auth guard + sidebar + inactivity logout |
| `config/seo.ts`        | Centralized SEO metadata                 |
| `og/route.tsx`         | Dynamic OG image generation              |
| `instrumentation.ts`   | OpenTelemetry logging to PostHog         |

## Webpack Config (`next.config.ts`)

- Aliases `react-native` → `react-native-web`
- Resolves `.web.tsx` before `.tsx`
- Transpiles all `@app/*` packages
- Single React Query instance (deduplication)
- Wraps with `withGluestackUI` and `withMDX`

## Route Constants

```typescript
import { ROUTES } from "@app/ui";
router.push(ROUTES.DASHBOARD.web);
router.push(ROUTES.LOGIN.web);
```

## Rules

- Pages are `"use client"` thin wrappers — no business logic
- Import screens from `@app/ui`, not build them here
- Use `ROUTES` constants for navigation, not hardcoded paths
- Use `useSession()` from `@app/auth` for auth state
- Legal pages use `LegalPageLayout` component
- `export const dynamic = "force-dynamic"` for pages that need fresh data
