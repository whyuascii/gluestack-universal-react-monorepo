# Auth Package

Shared authentication package using [Better Auth](https://www.better-auth.com/) with email/password and OAuth support.

## Features

- Email/password authentication with verification
- OAuth providers (Google, GitHub)
- Cross-platform client support (Next.js web + Expo mobile)
- Drizzle ORM integration with PostgreSQL
- Type-safe with TypeScript

## Architecture

- **Database package**: Contains all database schemas including auth schemas (`database/schema/auth`)
- **Auth package**: Imports from database, exports Better Auth config and client hooks
- **API app**: Creates Better Auth instance and mounts routes
- **Web/Mobile apps**: Use client hooks from `auth/client/react` or `auth/client/native`
- **UI package**: Imports client hooks to create shared auth screens

**Dependency flow:** `auth` → `database` (no circular dependencies!)

## Environment Variables

### Required for API app:

```env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3001

# Optional OAuth providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Required for Web app:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Required for Mobile app:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Usage

### In API app (apps/api)

```typescript
import { createAuthConfig } from "auth";

// Create auth instance
const auth = createAuthConfig();

// Mount auth routes in Fastify
app.all("/api/auth/*", async (req, res) => {
  return auth.handler(req, res);
});
```

### In Web app (apps/web)

```tsx
import { useSession, signIn, signOut } from "auth/client/react";

function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Hello {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### In Mobile app (apps/mobile)

```tsx
import { useSession, signIn, signOut } from "auth/client/native";

function MyScreen() {
  const { data: session, isPending } = useSession();

  if (isPending) return <ActivityIndicator />;
  if (!session) return <LoginScreen />;

  return (
    <View>
      <Text>Hello {session.user.name}</Text>
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
}
```

### In UI package (packages/ui)

```tsx
// Create shared auth screens/components using client hooks
import { useSession, signIn, signOut } from "auth/client/react";
import { useSession as useSessionNative } from "auth/client/native";

// Use Platform to determine which client to use
import { Platform } from "react-native";

const useAuth = Platform.OS === "web" ? useSession : useSessionNative;

export function AuthenticatedScreen() {
  const { data: session } = useAuth();
  // Shared screen logic...
}
```

## Database Migrations

After setting up the auth package, generate and run migrations:

```bash
# Generate migration
pnpm --filter database generate

# Run migration
pnpm --filter database db:migrate
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`
6. Copy client ID and secret to `.env`

### GitHub OAuth

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth app
3. Set authorization callback URL: `http://localhost:3001/api/auth/callback/github`
4. Copy client ID and secret to `.env`

## API Routes

Better Auth automatically creates these routes:

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in/email` - Sign in with email/password
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/callback/github` - GitHub OAuth callback

See [Better Auth docs](https://www.better-auth.com/docs) for full API reference.
