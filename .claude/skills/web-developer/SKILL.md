---
name: web-developer
description: Use when implementing web frontend - creates Next.js pages, shared screens, hooks, and web-specific code
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Web Developer

Implement web frontend using Next.js 15 App Router and shared UI components.

> **Shared rules apply:** See README for type safety, i18n, screens, error states, responsive design, and mobile auth requirements.

## Architecture

```
packages/ui/src/
├── screens/{public,auth,private}/  → ALL screens live here
├── hooks/{queries,mutations,auth}/ → Shared data hooks
└── stores/                         → Zustand stores

apps/web/src/app/
├── (auth)/     → Auth routes (login, signup, verify-email)
├── (public)/   → Public pages (landing, pricing)
├── (private)/  → Protected app routes
├── layout.tsx  → Root layout
└── providers.tsx → Client providers
```

## Implementation Order

1. Shared Hooks → 2. Shared Screen → 3. Web Route → 4. Navigation

### Step 1: Shared Hooks

```typescript
// packages/ui/src/hooks/queries/useSettings.ts
export function useSettings() {
  return useQuery(orpc.settings.get.queryOptions());
}
// Export from packages/ui/src/hooks/queries/index.ts
```

### Step 2: Shared Screen

Create in `packages/ui/src/screens/private/` — use hooks, error states from `@app/components`, `useTranslation()` for all text, `useWindowDimensions` for responsive layout.

### Step 3: Web Route

```typescript
// apps/web/src/app/(private)/settings/page.tsx
"use client";
import { SettingsScreen } from "@app/ui/screens";
export default function SettingsPage() {
  return <SettingsScreen />;
}
```

### Step 4: Navigation

```typescript
<Link href="/settings">Settings</Link>
```

## Web-Specific Patterns

**Client Components:** Add `"use client"` for hooks, state, effects.

**Server Components:** No "use client" — renders on server, can use async/await, cannot use hooks.

**Metadata:**

```typescript
export const metadata: Metadata = {
  title: "Settings | App Name",
  description: "Manage your account settings",
};
```

**Loading/Error States:**

```typescript
// loading.tsx — Next.js loading UI
export default function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}

// error.tsx — Next.js error boundary
"use client";
import { GeneralError } from "@app/components";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <GeneralError title="Something went wrong" message={error.message} onRetry={reset} />;
}
```

**Tailwind Responsive Prefixes:** `sm:` (640px+), `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)

## Checklist

- [ ] `pnpm --filter web typecheck` passes
- [ ] Hooks in `packages/ui/src/hooks/`, exported
- [ ] Screen in `packages/ui/src/screens/` (NOT apps/web)
- [ ] Web route in `apps/web/src/app/` (thin wrapper)
- [ ] All text uses `useTranslation()`, translations in all locales
- [ ] Responsive on all breakpoints (<380, 380-768, ≥768)
- [ ] Loading/error states handled
