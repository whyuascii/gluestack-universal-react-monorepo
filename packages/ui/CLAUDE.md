# packages/ui — Shared Business Logic Layer

Cross-platform screens, hooks, stores, and oRPC client. This is where 80-90% of app logic lives.

## Structure

```
src/
├── screens/          # All UI screens (auth, private, public)
├── hooks/
│   ├── auth/         # useSession, useLogout, usePostLoginRouter
│   ├── queries/      # TanStack Query data fetching
│   └── mutations/    # TanStack Query mutations (optimistic updates)
├── stores/           # Zustand: authStore, tenantStore, preferencesStore, uiStore
├── api/              # oRPC client + TanStack Query utils
├── navigation/       # Cross-platform nav (sidebar, tabs, navbar)
├── forms/            # TanStack Form + Zod integration
├── tables/           # TanStack Table integration
├── constants/        # Routes, cache times, storage keys
├── analytics/        # Platform-agnostic analytics layer
└── notifications/    # Novu notification components
```

## Key Patterns

### Screen Props

```typescript
export interface DashboardScreenProps {
  session: Session | null;
}
export const DashboardScreen: React.FC<DashboardScreenProps> = ({ session }) => {
  const { data, isLoading } = useDashboard(session);
  // ...
};
```

Mobile screens receive native `signOut` as prop — never import auth client directly in screens.

### Query Hook Pattern

```typescript
export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    ...orpc.private.user.me.get.queryOptions({ input: undefined }),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TIMES.user.staleTime,
    gcTime: CACHE_TIMES.user.gcTime,
  });
}
```

### Mutation Pattern (Optimistic Updates)

```typescript
export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    ...orpc.private.features.todos.create.mutationOptions(),
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey() });
      const previous = queryClient.getQueryData<TodosData>(todosQueryKey());
      // Set optimistic data...
      return { previous };
    },
    onError: (_err, _new, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(todosQueryKey(), ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: todosQueryKey() }),
  });
}
```

### Query Keys Factory (`hooks/queries/keys.ts`)

All keys centralized. Use factory pattern:

```typescript
queryKeys.tenants.detail(tenantId);
queryKeys.invites.pending();
```

### oRPC Client (`api/orpc-client.ts`)

```typescript
import { orpc, client } from "@app/ui";
// Queries: orpc.private.user.me.get.queryOptions()
// Mutations: orpc.private.features.todos.create.mutationOptions()
// Direct: await client.private.workspace.tenants.create({ name })
```

### Zustand Stores

- `authStore` — session, user, isAuthenticated (synced via AuthSync component)
- `tenantStore` — activeTenantId, memberships (persisted to storage)
- `preferencesStore` — theme, locale, notification settings
- `uiStore` — ephemeral UI state (modals, sidebar)

Use selectors: `useIsAuthenticated()`, `useActiveTenant()`, `useTheme()`

### Barrel File Export Chain

```
screens/dashboard/DashboardScreen.tsx
  → screens/dashboard/index.ts (export screen + props type)
  → screens/private/index.ts
  → screens/index.ts
  → src/index.ts
```

Always export both the component and its Props type from barrel files.

## Cache Times (`constants/cache.ts`)

| Domain        | staleTime | gcTime |
| ------------- | --------- | ------ |
| user          | 2 min     | 10 min |
| dashboard     | 1 min     | 5 min  |
| todos         | 30 sec    | 5 min  |
| notifications | 0         | 5 min  |
| invites       | 5 min     | 30 min |
| settings      | 10 min    | 30 min |

## Platform-Specific Files

```
.web.tsx    → Web-only
.native.tsx → Mobile-only
```

## Rules

- ALL screens go here, never in apps/web or apps/mobile
- Use `useTranslation()` for all user-facing text
- Use `@app/components` primitives, not raw HTML/RN elements
- Handle loading, error, and empty states in every screen
- Export from barrel files at each level
