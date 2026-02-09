---
name: screen-builder
description: Use when creating new screens - orchestrates shared screen creation in packages/ui with hooks, translations, design system tokens, and thin route wrappers in apps/web and apps/mobile
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Screen Builder

Create cross-platform screens with shared code in `packages/ui`, styled with `packages/tailwind-config` design tokens, using `@app/components` primitives, connected to `@app/core-contract` via hooks, with full i18n from `packages/i18n`.

> **Shared rules apply:** See README for type safety, i18n, error states, responsive design, and mobile auth requirements.

## Workflow

```
1. Define → 2. Contracts & Hooks → 3. Design → 4. Shared Screen → 5. i18n → 6. Web Route → 7. Mobile Route → 8. Verify
```

## Step 1: Define Screen Requirements

Before writing code, answer:

- **Screen type:** auth, private, or public?
- **Data needed:** What API calls? What contracts exist?
- **User interactions:** Forms, lists, actions, navigation?
- **Platform callbacks:** Does mobile need `signOut` or other native APIs?

## Step 2: Contracts & Hooks

**Check existing contracts** in `packages/core-contract/src/contracts/`. If new data is needed:

```typescript
// packages/core-contract/src/contracts/private/features.ts
export const newFeatureContract = {
  list: oc
    .route({ method: "GET", path: "/private/features/items" })
    .output(z.object({ items: z.array(ItemSchema) }))
    .errors({ UNAUTHORIZED: {} }),
};
```

**Create hooks** in `packages/ui/src/hooks/`:

```typescript
// packages/ui/src/hooks/queries/useItems.ts
export function useItems(session: Session | null) {
  return useQuery({
    ...orpc.private.features.items.list.queryOptions(),
    enabled: !!session,
  });
}
```

Reference: `packages/ui/src/hooks/queries/useDashboard.ts`, `packages/ui/src/hooks/mutations/useTodos.ts`

## Step 3: Design with Design System

Use tokens from `packages/tailwind-config/DESIGN-SYSTEM.md`:

**Surfaces:** `bg-surface`, `bg-surface-canvas`, `bg-surface-elevated`
**Content:** `text-content`, `text-content-emphasis`, `text-content-muted`
**Brand:** `primary-500`, `secondary-500`, `accent-500`
**States:** `success-*`, `warning-*`, `error-*`, `info-*`
**Radius:** `rounded-lg` (8px), `rounded-xl` (16px), `rounded-2xl` (24px)
**Shadows:** `shadow-sm`, `shadow-md`, `shadow-lg`
**Animation:** `animate-fade-in`, `animate-slide-up`, `duration-normal`

## Step 4: Build Shared Screen

Create in `packages/ui/src/screens/{auth|private|public}/`:

```typescript
// packages/ui/src/screens/private/items/ItemsScreen.tsx
import { useTranslation } from "react-i18next";
import { VStack, HStack, Text, Heading, Spinner } from "@app/components";
import { GeneralError, EmptyList } from "@app/components";
import { useItems } from "../../../hooks/queries/useItems";
import type { Session } from "@app/auth";

interface ItemsScreenProps {
  session: Session | null;
  signOut?: () => void;  // Mobile passes native signOut
}

export const ItemsScreen: React.FC<ItemsScreenProps> = ({ session, signOut }) => {
  const { t } = useTranslation("items");
  const { data, isLoading, error } = useItems(session);

  if (isLoading) return <Spinner />;
  if (error) return <GeneralError error={error} />;
  if (!data?.items.length) return <EmptyList message={t("empty.message")} />;

  return (
    <VStack className="flex-1 bg-surface-canvas p-4">
      <Heading className="text-content-emphasis text-heading-xl">{t("title")}</Heading>
      {/* Screen content using @app/components + design tokens */}
    </VStack>
  );
};
```

**Export chain:**

1. `packages/ui/src/screens/private/items/index.ts` → `export { ItemsScreen } from "./ItemsScreen";`
2. `packages/ui/src/screens/private/index.ts` → add `export * from "./items";`
3. Already exported via `packages/ui/src/screens/index.ts`

**Screen checklist:**

- Uses `@app/components` primitives (not raw `<div>`, `<View>`)
- Uses design system tokens (not hardcoded colors/sizes)
- Uses `useTranslation()` for ALL text
- Handles loading, error, and empty states
- Responsive via `useWindowDimensions` for layout breakpoints
- Accepts `signOut` prop if screen has sign-out action

## Step 5: Translations (i18n)

Add to ALL languages simultaneously:

```json
// packages/i18n/src/locales/en/items.json
{
  "title": "My Items",
  "empty": { "message": "No items yet. Create your first one!" },
  "actions": { "create": "Create Item", "edit": "Edit", "delete": "Delete" }
}

// packages/i18n/src/locales/es/items.json
{
  "title": "Mis Elementos",
  "empty": { "message": "Sin elementos. Crea tu primero!" },
  "actions": { "create": "Crear Elemento", "edit": "Editar", "delete": "Eliminar" }
}
```

If new namespace: register in `packages/i18n/src/languages.json` and both `i18n.web.ts` / `i18n.mobile.ts`.

## Step 6: Web Route

```typescript
// apps/web/src/app/(private)/items/page.tsx
"use client";
import { ItemsScreen } from "@app/ui/screens";
import { useSession } from "@app/auth";

export default function ItemsPage() {
  const { data: session } = useSession();
  return <ItemsScreen session={session} />;
}
```

Reference: `apps/web/src/app/(private)/dashboard/page.tsx`

## Step 7: Mobile Route

```typescript
// apps/mobile/src/app/(private)/items.tsx
import { ItemsScreen } from "@app/ui/screens";
import { useSession, signOut } from "@app/auth/client/native";

export default function Items() {
  const { data: session } = useSession();
  return <ItemsScreen session={session} signOut={signOut} />;
}
```

**Critical:** Mobile MUST pass `signOut` from `@app/auth/client/native`. Web and mobile auth are separate Better Auth instances.

Reference: `apps/mobile/src/app/(private)/` for existing patterns

## Step 8: Verify

```bash
pnpm typecheck          # No any, no @ts-nocheck
pnpm lint               # Code style
pnpm test               # All tests pass
```

## Agent Coordination

For complex screens, delegate to specialized skills:

| Need                        | Delegate To         |
| --------------------------- | ------------------- |
| Component specs & layout    | `frontend-designer` |
| New API contracts & actions | `backend-developer` |
| Web-specific patterns       | `web-developer`     |
| Mobile-specific patterns    | `mobile-developer`  |
| Translation management      | `i18n-manager`      |
| Tests for new screen        | `test-engineer`     |

## Checklist

- [ ] Screen in `packages/ui/src/screens/` (NOT in apps)
- [ ] Uses `@app/components` primitives
- [ ] Uses design system tokens from `packages/tailwind-config`
- [ ] Contracts defined in `packages/core-contract` (if API needed)
- [ ] Hooks in `packages/ui/src/hooks/` (queries and/or mutations)
- [ ] ALL text uses `useTranslation()` with keys in `packages/i18n`
- [ ] Translations in ALL languages (en + es)
- [ ] Loading, error, and empty states handled
- [ ] Responsive on all device sizes
- [ ] Web route in `apps/web/src/app/`
- [ ] Mobile route in `apps/mobile/src/app/`
- [ ] Mobile passes native `signOut` to shared screen
- [ ] Exported from screen barrel files (index.ts chain)
- [ ] `pnpm typecheck` passes
