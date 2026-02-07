# Zustand Stores

All global state is managed through Zustand stores.

## Available Stores

| Store              | Purpose                      | Key Hooks                                                  |
| ------------------ | ---------------------------- | ---------------------------------------------------------- |
| `authStore`        | Auth session & user          | `useIsAuthenticated`, `useUser`, `useAuthLoading`          |
| `tenantStore`      | Active tenant & memberships  | `useActiveTenant`, `useHasTenants`, `useTenantMemberships` |
| `preferencesStore` | Theme, locale, notifications | `useTheme`, `useLocale`, `useNotificationPreferences`      |
| `uiStore`          | Ephemeral UI state           | `useUIStore`                                               |

## Setup

Add `<AuthSync />` at your app root to sync Better Auth with Zustand:

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

## Usage Examples

### Check if user is authenticated

```tsx
import { useIsAuthenticated, useUser } from "@app/ui";

function ProfileButton() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  if (!isAuthenticated) return <LoginButton />;
  return <Avatar name={user?.name} />;
}
```

### Get active tenant

```tsx
import { useActiveTenant, useTenantStore } from "@app/ui";

function GroupSwitcher() {
  const activeTenant = useActiveTenant();
  const { memberships, setActiveTenant } = useTenantStore();

  return (
    <Select value={activeTenant?.tenantId} onChange={(id) => setActiveTenant(id)}>
      {memberships.map((m) => (
        <Option key={m.tenantId} value={m.tenantId}>
          {m.tenantName}
        </Option>
      ))}
    </Select>
  );
}
```

### Theme preferences

```tsx
import { useTheme, usePreferencesStore } from "@app/ui";

function ThemeToggle() {
  const theme = useTheme();
  const setTheme = usePreferencesStore((s) => s.setTheme);

  return (
    <Button onPress={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}
```

## When to Use What

| State Type                  | Solution                               |
| --------------------------- | -------------------------------------- |
| Server data (API responses) | TanStack Query (`hooks/queries/`)      |
| Auth session                | `useAuthStore` / `useIsAuthenticated`  |
| Active tenant               | `useTenantStore` / `useActiveTenant`   |
| User preferences            | `usePreferencesStore` / `useTheme`     |
| UI state (modals, toasts)   | `useUIStore`                           |
| Form state                  | React `useState` or Zustand if complex |

## Creating a New Store

1. Create `stores/myStore.ts`
2. Define state and actions interfaces
3. Create store with `create()`
4. Add selector hooks for common patterns
5. Export from `stores/index.ts`

```typescript
import { create } from "zustand";

export interface MyState {
  count: number;
}

export interface MyActions {
  increment: () => void;
}

type MyStore = MyState & MyActions;

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

// Selector hook
export const useCount = () => useMyStore((s) => s.count);
```
