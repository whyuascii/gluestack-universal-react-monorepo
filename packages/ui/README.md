# @app/ui - Business Logic Layer

Cross-platform business logic for web and mobile applications. Contains screens, hooks, stores, forms, tables, and API integration.

> **Key Rule:** All screens live here, not in apps. Apps only contain thin routing wrappers.

## Package Exports

```typescript
import { orpc, useAuthStore, LoginScreen } from "@app/ui";          // Main
import { ... } from "@app/ui/web";                                   // Web-specific
import { ... } from "@app/ui/screens";                               // Screens only
import { ... } from "@app/ui/analytics-web";                         // Web analytics
import { ... } from "@app/ui/analytics-native";                      // Mobile analytics
import { ... } from "@app/ui/notifications-web";                     // Web notifications (Novu)
import { ... } from "@app/ui/notifications-native";                  // Mobile notifications (Novu)
import { ... } from "@app/ui/subscriptions";                         // Subscription components
```

## Architecture

```
src/
├── api/              # oRPC client (orpc-client.ts)
├── analytics/        # Platform-specific analytics wrappers
├── components/       # Business-specific UI components
├── constants/        # Routes, config, storage keys, cache settings
├── forms/            # TanStack Form with Zod validation
├── hooks/
│   ├── auth/         # useSession, useLogout, usePostLoginRouter, useInactivityLogout
│   ├── queries/      # TanStack Query data fetching (useMe, useDashboard, useTodos, etc.)
│   └── mutations/    # TanStack Query mutations (useTenants, useInvites, useTodos, etc.)
├── navigation/       # Cross-platform navigation context and hooks
├── notifications/    # Novu notification components (web/native)
├── screens/
│   ├── auth/         # Login, Signup, ResetPassword, VerifyEmail
│   ├── private/      # Authenticated screens (dashboard, settings, todos, etc.)
│   └── public/       # Public screens (home/landing)
├── stores/           # Zustand stores (auth, tenant, preferences, ui)
├── subscriptions/    # RevenueCat/Polar subscription components
├── tables/           # TanStack Table with sorting, filtering, pagination
└── types/            # Shared TypeScript types
```

## Screens

### Auth Screens

- `LoginScreen` - Email/password login with social auth
- `SignupScreen` - Registration with email verification
- `ResetPasswordScreen` - Password reset flow
- `VerifyEmailScreen` - Email verification
- `PostLoginRouter` - Routes user after authentication

### Private Screens (Authenticated)

- `DashboardScreen` - Main dashboard
- `SettingsScreen` - Account, notifications, billing, privacy settings
- `ProfileScreen` - User profile management
- `TodosScreen` - Todo list management
- `NotificationsScreen` - Notification inbox
- `GroupScreen` - Group/tenant management
- `CreateGroupScreen` - Onboarding: create first group
- `InviteMembersScreen` - Onboarding: invite team members
- `InviteAcceptScreen` - Accept group invitation

### Public Screens

- `HomeScreen` - Landing page (web) / home screen (mobile)

### Platform-Specific Screens

Use `.web.tsx` or `.native.tsx` suffix:

```
screens/public/
├── HomeScreen.tsx      # Shared or mobile-first
└── HomeScreen.web.tsx  # Web-specific (auto-selected on web)
```

## State Management

### Server State (TanStack Query via oRPC)

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { orpc } from "@app/ui";

// Queries
const { data: user } = useQuery(orpc.me.get.queryOptions());
const { data: todos } = useQuery(orpc.todos.list.queryOptions({ limit: 20 }));

// Mutations
const createTodo = useMutation(orpc.todos.create.mutationOptions());
await createTodo.mutateAsync({ title: "New todo" });
```

### Global State (Zustand)

| Store              | Purpose                    | Key Selectors                            |
| ------------------ | -------------------------- | ---------------------------------------- |
| `authStore`        | Session, user, auth state  | `useAuthStore()`, `useIsAuthenticated()` |
| `tenantStore`      | Active tenant, memberships | `useTenantStore()`, `useActiveTenant()`  |
| `preferencesStore` | Theme, locale, settings    | `usePreferencesStore()`, `useTheme()`    |
| `uiStore`          | Modals, toasts, sidebar    | `useUIStore()`                           |

```tsx
import { useAuthStore, useActiveTenant, useTheme } from "@app/ui";

const { user, isAuthenticated } = useAuthStore();
const tenant = useActiveTenant();
const theme = useTheme();
```

## Forms (TanStack Form)

```tsx
import { useAppForm } from "@app/ui";
import { createTodoSchema } from "@app/core-contract";

function CreateTodoForm() {
  const form = useAppForm({
    defaultValues: { title: "", description: "" },
    validators: { onChange: createTodoSchema },
    onSubmit: async ({ value }) => {
      await createTodo.mutateAsync(value);
    },
  });

  return (
    <form.Provider>
      <form.Field name="title">
        {(field) => <Input value={field.state.value} onChangeText={field.handleChange} />}
      </form.Field>
    </form.Provider>
  );
}
```

## Tables (TanStack Table)

```tsx
import { useDataTable, createColumns } from "@app/ui";

const columns = createColumns<Todo>([
  { accessorKey: "title", header: "Title" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "createdAt", header: "Created", cell: ({ value }) => formatDate(value) },
]);

function TodosTable({ data }: { data: Todo[] }) {
  const table = useDataTable({ data, columns });

  return <DataTable table={table} />;
}
```

## Query Keys

Centralized query key factory for cache management:

```tsx
import { queryKeys } from "@app/ui";

// Invalidate queries
queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
queryClient.invalidateQueries({ queryKey: queryKeys.tenants.detail(tenantId) });

// Prefetch
queryClient.prefetchQuery({ queryKey: queryKeys.dashboard.summary() });
```

## Setup

Wrap your app with providers:

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthSync } from "@app/ui";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Adding Features

### New Screen

1. Create in `screens/{auth|private|public}/{ScreenName}.tsx`
2. Export from `screens/{folder}/index.ts`
3. Add route wrapper in apps:
   - Web: `apps/web/src/app/(private)/screen-name/page.tsx`
   - Mobile: `apps/mobile/src/app/(private)/screen-name.tsx`

### New Query Hook

1. Create `hooks/queries/use{Feature}.ts`
2. Add query keys to `hooks/queries/keys.ts`
3. Export from `hooks/queries/index.ts`

### New Mutation Hook

1. Create `hooks/mutations/use{Feature}.ts`
2. Include cache invalidation in `onSuccess`
3. Export from `hooks/mutations/index.ts`

### New Store

1. Create `stores/{name}Store.ts`
2. Export from `stores/index.ts`
3. Follow pattern: state interface, actions, selectors

## Scripts

```bash
pnpm --filter ui build      # Build
pnpm --filter ui dev        # Watch mode
pnpm --filter ui typecheck  # Type check
pnpm --filter ui lint       # Lint
```
