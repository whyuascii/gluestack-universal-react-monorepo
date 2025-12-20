# UI Package

The `ui` package contains shared business logic: screens, hooks, state management, and utilities.

## Overview

This package enables maximum code reuse by keeping all UI logic platform-agnostic.

**Contents:**

- **Screens** - Full screen implementations
- **Hooks** - Custom React hooks
- **Store** - State management (Zustand/etc)
- **Utils** - UI-specific utilities

## Structure

```
packages/ui/
├── src/
│   ├── home/              # Home screen
│   ├── auth/              # Auth screens
│   ├── hooks/             # Custom hooks
│   ├── store/             # State management
│   └── utils/             # UI utilities
└── index.ts               # Package exports
```

## Screens

Screens are complete UI implementations that apps can directly use:

```tsx
// packages/ui/src/home/HomeScreen.tsx
import { Box, Text, Button, ButtonText } from "@app/components";

export function HomeScreen() {
  return (
    <Box className="flex-1 p-4">
      <Text className="text-2xl font-bold">Welcome Home</Text>
      <Button className="bg-primary-500 px-4 py-2 rounded-lg mt-4">
        <ButtonText className="text-white">Get Started</ButtonText>
      </Button>
    </Box>
  );
}
```

**Usage in apps:**

```tsx
// apps/web/src/app/page.tsx
import { HomeScreen } from "@app/ui";
export default function Page() {
  return <HomeScreen />;
}

// apps/mobile/src/app/(tabs)/index.tsx
import { HomeScreen } from "@app/ui";
export default function TabOne() {
  return <HomeScreen />;
}
```

## Hooks

Custom hooks for shared logic:

```typescript
// packages/ui/src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user session
  }, []);

  return { user, loading };
}
```

**Usage:**

```tsx
import { useAuth } from "@app/ui";

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <SignInScreen />;

  return <Dashboard user={user} />;
}
```

## State Management

Shared stores using Zustand or similar:

```typescript
// packages/ui/src/store/userStore.ts
import { create } from "zustand";

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Utilities

UI-specific helpers:

```typescript
// packages/ui/src/utils/formatters.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
```

## Best Practices

1. **Keep it platform-agnostic** - Use React Native components, not web-specific
2. **Export everything** - Make all screens, hooks, utils available
3. **Use components package** - Import from `components`, not directly from libraries
4. **Avoid platform-specific code** - Use `.web.tsx` / `.native.tsx` if absolutely needed

## Related Documentation

- [Components Package](./components.md)
- [Cross-Platform Strategy](../architecture/cross-platform.md)
