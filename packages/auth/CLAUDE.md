# packages/auth — Better Auth Integration

Authentication with three client entry points, session management, and platform-aware logout.

## Structure

```
src/
├── client/
│   ├── index.ts       # Auto-detecting client (checks EXPO_PUBLIC_ or NEXT_PUBLIC_)
│   ├── react.ts       # Web/Next.js explicit client
│   └── native.ts      # Mobile/Expo explicit client
├── hooks/
│   ├── useSession.ts          # Get typed auth session
│   ├── useLogout.ts           # Platform-aware logout with cache clearing
│   └── useInactivityLogout.ts # Web-only auto-logout (15 min default)
├── config.ts          # Better Auth server config (session, JWT, rate limits)
├── server.ts          # Server-only exports
├── errors.ts          # AuthError, BadRequestError, UnauthorizedError, etc.
├── types.ts           # Session, BetterAuthUser, BetterAuthSession types
└── utils.ts           # Client-side auth utilities
```

## Client Entry Points

```typescript
// Auto-detect (works for both platforms)
import { useSession, signIn, signOut } from "@app/auth/client";

// Web explicit
import { useSession, signIn, signOut } from "@app/auth/client/react";

// Mobile explicit
import { useSession, signIn, signOut } from "@app/auth/client/native";

// Server-only
import { createAuthConfig, SESSION_CONFIG } from "@app/auth/server";
```

## Mobile Auth Pattern

Mobile MUST pass native `signOut` to shared screens:

```typescript
import { signOut } from "@app/auth/client/native";
<SettingsScreen onLogout={async () => { await signOut(); router.replace(ROUTES.LOGIN.mobile); }} />
```

## useLogout Hook

Platform-aware cleanup:

```typescript
const { logout } = useLogout({
  onSuccess: () => router.replace(ROUTES.LOGIN),
  signOut, // Pass native signOut for mobile
});
```

- Clears React Query cache on both platforms
- Clears localStorage/sessionStorage on web only

## Session Config

| Setting          | Value   |
| ---------------- | ------- |
| Session expiry   | 7 days  |
| Session rotation | 1 day   |
| Fresh age        | 10 min  |
| JWT expiration   | 15 min  |
| Rate limit       | 100/min |
| Auth rate limit  | 10/min  |

## Error Classes

```typescript
import { BadRequestError, UnauthorizedError, ForbiddenError } from "@app/auth";
throw new UnauthorizedError("Token expired", {
  message: "Your session has expired. Please log in again.",
});
```

All errors have `statusCode`, `userResponse` (safe for client), and optional `debug` (internal only).

## Rules

- Never import auth client directly in shared screens (packages/ui)
- Pass `signOut` as a prop from app layer to shared screens
- Use `@app/auth/client/react` in web, `@app/auth/client/native` in mobile
- Use `useSession()` hook for session state, not direct API calls
- Error `userResponse` is safe for clients; `message` and `debug` are internal only
