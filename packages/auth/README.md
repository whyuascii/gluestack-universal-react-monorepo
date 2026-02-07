# @app/auth

Cross-platform authentication using [Better Auth](https://www.better-auth.com/) with email/password, email verification, and password reset support for Next.js and Expo.

## Installation

```bash
pnpm add @app/auth
```

## Features

- Email/password authentication with verification
- Password reset flow
- Cross-platform client (Next.js web + Expo mobile)
- Session management with JWT
- React hooks for auth state
- Inactivity timeout (web)
- Type-safe with TypeScript

## Directory Structure

```
src/
├── index.ts              # Main exports (client-safe)
├── server.ts             # Server-only exports (Better Auth config)
├── config.ts             # Better Auth configuration
├── utils.ts              # Auth utilities (authClient, helpers)
├── types.ts              # Type definitions
├── errors.ts             # Auth error classes
├── hooks/
│   ├── index.ts          # Hook exports
│   ├── useSession.ts     # Session state hook
│   ├── useLogout.ts      # Logout with cache clearing
│   └── useInactivityLogout.ts  # Auto-logout on inactivity (web)
└── client/
    ├── index.ts          # Auto-detecting client
    ├── react.ts          # Next.js/web client
    └── native.ts         # Expo/mobile client
```

## Usage

### In API (apps/api)

```typescript
import { createAuthConfig } from "@app/auth/server";

// Create auth instance
const auth = createAuthConfig();

// Mount auth routes
app.all("/api/auth/*", async (req, res) => {
  return auth.handler(req, res);
});
```

### In Web App (apps/web)

```tsx
import { useSession, useLogout, authClient } from "@app/auth";
// Or explicit import:
// import { authClient } from "@app/auth/client/react";

function Profile() {
  const { data: session, isPending } = useSession();
  const { logout, isLoggingOut } = useLogout({
    onSuccess: () => router.push("/login"),
  });

  if (isPending) return <Spinner />;
  if (!session) return <Redirect to="/login" />;

  return (
    <View>
      <Text>Hello {session.user.name}</Text>
      <Button onPress={logout} disabled={isLoggingOut}>
        Sign Out
      </Button>
    </View>
  );
}
```

### In Mobile App (apps/mobile)

```tsx
import { useSession, useLogout } from "@app/auth";
import { signOut } from "@app/auth/client/native";

function Profile() {
  const { data: session } = useSession();
  const { logout, isLoggingOut } = useLogout({
    signOut, // Pass native signOut function
    onSuccess: () => router.replace("/login"),
  });

  return (
    <View>
      <Text>Hello {session?.user.name}</Text>
      <Button onPress={logout}>Sign Out</Button>
    </View>
  );
}
```

## Hooks

### `useSession()`

Get current auth session state.

```typescript
const { data, isPending, error } = useSession();

// data: Session | null
// data.user: { id, name, email, image, ... }
// data.session: { id, expiresAt, ... }
```

### `useLogout(options)`

Handle complete logout process with cache clearing.

```typescript
interface UseLogoutOptions {
  onSuccess?: () => void; // Called after successful logout
  onError?: (error: Error) => void; // Called on logout error
  signOut?: () => Promise<unknown>; // Custom signOut (for native)
}

const { logout, isLoggingOut } = useLogout({
  onSuccess: () => router.push("/login"),
});
```

**What it does:**

1. Signs out via Better Auth (invalidates server session)
2. Clears React Query cache
3. Clears localStorage/sessionStorage (web only)
4. Calls onSuccess callback

### `useInactivityLogout(options)` (Web Only)

Auto-logout after period of inactivity.

```typescript
interface UseInactivityLogoutOptions {
  timeout?: number; // ms (default: 15 min)
  onInactivityLogout: () => void; // Called on timeout
  enabled?: boolean; // Enable/disable
  onWarning?: (secondsRemaining: number) => void; // Warning before logout
  warningThreshold?: number; // Seconds before logout to warn
}

const { logout } = useLogout({ onSuccess: () => router.push("/login") });

useInactivityLogout({
  timeout: 10 * 60 * 1000, // 10 minutes
  onInactivityLogout: logout,
  enabled: !!session,
  onWarning: (seconds) => toast.warning(`Logging out in ${seconds}s`),
  warningThreshold: 60,
});
```

**Tracked events:** mouse, keyboard, touch, scroll, visibility change

## Auth Client

### Sign In

```typescript
import { authClient } from "@app/auth";

await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});
```

### Sign Up

```typescript
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});
```

### Sign Out

```typescript
await authClient.signOut();
```

### Password Reset

```typescript
// Request reset email
await authClient.forgetPassword({
  email: "user@example.com",
  redirectTo: "/reset-password",
});

// Reset with token
await authClient.resetPassword({
  token: "reset-token",
  newPassword: "newpassword123",
});
```

### Email Verification

```typescript
// Resend verification email
await authClient.sendVerificationEmail({
  email: "user@example.com",
  callbackURL: "/verify-email",
});

// Verify with token
await authClient.verifyEmail({
  token: "verification-token",
});
```

## Error Handling

```typescript
import {
  AuthError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@app/auth";

try {
  await authClient.signIn.email({ email, password });
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Invalid credentials
  } else if (error instanceof ConflictError) {
    // Email already exists
  }
}
```

## Types

```typescript
import type {
  Session,
  BetterAuthUser,
  BetterAuthSession,
  SignInCredentials,
  SignUpCredentials,
} from "@app/auth";

// From Better Auth library
import type { User, Account } from "@app/auth";
```

## Environment Variables

### API App

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3030
DATABASE_URL=postgresql://...
```

### Web App

```env
NEXT_PUBLIC_API_URL=http://localhost:3030
```

### Mobile App

```env
EXPO_PUBLIC_API_URL=http://localhost:3030
```

## API Routes

Better Auth creates these routes automatically:

| Route                               | Method | Description                  |
| ----------------------------------- | ------ | ---------------------------- |
| `/api/auth/sign-up/email`           | POST   | Register with email/password |
| `/api/auth/sign-in/email`           | POST   | Sign in with email/password  |
| `/api/auth/sign-out`                | POST   | Sign out                     |
| `/api/auth/session`                 | GET    | Get current session          |
| `/api/auth/forget-password`         | POST   | Request password reset       |
| `/api/auth/reset-password`          | POST   | Reset password with token    |
| `/api/auth/verify-email`            | POST   | Verify email with token      |
| `/api/auth/send-verification-email` | POST   | Resend verification email    |

## Session Configuration

```typescript
// Default session config in config.ts
session: {
  expiresIn: 60 * 60 * 24 * 7,    // 7 days
  updateAge: 60 * 60 * 24,         // Refresh after 1 day
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5,                // 5 minute cache
  },
}
```

## Adding OAuth Providers

Update `config.ts` with social providers:

```typescript
import { betterAuth } from "better-auth";

export const createAuthConfig = () =>
  betterAuth({
    // ... existing config
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
  });
```

## Architecture

```
apps/api
  └── Creates Better Auth instance with createAuthConfig()
  └── Mounts /api/auth/* routes

packages/auth
  └── Exports client, hooks, types, errors
  └── Platform-agnostic (web + mobile)

apps/web, apps/mobile
  └── Import useSession, useLogout, authClient
  └── Use for auth UI and session management

packages/ui
  └── Auth screens (Login, Signup, etc.)
  └── Re-exports hooks from @app/auth
```

**Dependency flow:** `@app/auth` → `@app/database` (no circular dependencies)

## Related Packages

| Package         | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `@app/database` | Auth schemas (user, session, account, verification)      |
| `@app/ui`       | Auth screens (Login, Signup, VerifyEmail, ResetPassword) |
| `@app/mailer`   | Email sending for verification/reset                     |
