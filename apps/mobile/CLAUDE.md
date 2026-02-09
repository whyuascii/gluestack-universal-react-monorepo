# apps/mobile — Expo 54 + React Native

Thin routing wrappers only. All business logic lives in `packages/ui`.

## Route Structure (Expo Router)

```
src/app/
├── _layout.tsx              # Root layout (providers)
├── index.tsx                # Entry: session check → auth or dashboard
├── +not-found.tsx           # 404 handler
├── (auth)/                  # Auth stack (no headers)
│   ├── login.tsx
│   ├── signup.tsx
│   ├── verify-email.tsx
│   └── reset-password.tsx
└── (private)/               # Auth-guarded stack
    ├── (tabs)/              # Bottom tab navigator
    │   ├── _layout.tsx      # Custom tabs + header + notification badge
    │   ├── dashboard.tsx
    │   ├── todos.tsx
    │   ├── group.tsx
    │   └── settings.tsx
    ├── notifications.tsx    # Modal stack
    ├── profile.tsx          # Modal stack
    ├── invite/accept.tsx    # Invite acceptance
    └── onboarding/          # Post-login flow
        ├── index.tsx        # PostLoginRouter (smart redirect)
        ├── create-group.tsx
        └── invite-members.tsx
```

## Screen Pattern (Thin Wrapper)

```typescript
import { DashboardScreen } from "@app/ui";
import { useSession } from "@app/auth/client/native";

export default function Dashboard() {
  const { data: session } = useSession();
  return <DashboardScreen session={session} />;
}
```

## Mobile Auth — CRITICAL

```typescript
// Mobile MUST use native client and pass signOut to shared screens
import { signOut } from "@app/auth/client/native";

<SettingsScreen
  onLogout={async () => {
    await signOut();
    router.replace(ROUTES.LOGIN.mobile);
  }}
/>
```

Never import `@app/auth/client/react` in mobile code.

## Auth Guard

In `(private)/_layout.tsx`:

- `useSession()` checks auth state
- Redirects to login if no session
- Shows loading spinner while checking

## Tab Navigator

Custom implementation in `(tabs)/_layout.tsx`:

- Manual tab bar (not default Expo Tabs)
- Header with greeting + notification bell + avatar
- Polls unread notification count every 5 seconds
- Animated badge on notification icon

## Provider Stack (`_layout.tsx`)

```
AnalyticsProvider (PostHog)
  → I18nextProvider (i18n mobile)
    → QueryClientProvider (React Query)
      → GluestackUIProvider
        → SafeAreaProvider
          → Slot (Expo Router)
```

## SafeAreaScreen Component

```typescript
import { SafeAreaScreen } from "@/components";
<SafeAreaScreen edges={["top", "bottom"]}>
  {children}
</SafeAreaScreen>
```

Platform-aware: applies insets on native, plain View on web.

## App Config (`app.config.js`)

- AdMob: conditional based on `EXPO_PUBLIC_ADS_ENABLED`
- Plugins: expo-router, expo-system-ui, expo-build-properties
- iOS: useFrameworks: static
- Android: SDK 35, pan keyboard mode

## Route Constants

```typescript
import { ROUTES } from "@app/ui";
router.push(ROUTES.DASHBOARD.mobile);
router.replace(ROUTES.LOGIN.mobile);
```

## Rules

- Pages are thin wrappers — no business logic
- ALWAYS use `@app/auth/client/native` (not `/client/react`)
- Pass `signOut` as callback to shared screens
- Use `SafeAreaScreen` or `SafeAreaView` for proper inset handling
- Use `KeyboardAvoidingView` for forms
- No `hover:` Tailwind prefixes — mobile has no hover state
- Use `Platform.OS` for platform checks, not `typeof window`
- Use `ROUTES` constants with `.mobile` suffix for navigation
