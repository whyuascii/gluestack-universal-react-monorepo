# Authentication Guide

Complete guide to implementing authentication with Better Auth across web, mobile, and API.

## Overview

The monorepo uses **Better Auth** for authentication with:

- Email/password authentication
- OAuth providers (Google, GitHub)
- Cross-platform support (web + mobile)
- Type-safe API

## Setup

### 1. Environment Variables

```bash
# API Server (.env)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3030
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 2. Run Migrations

```bash
# Better Auth tables are already in the database schema
pnpm --filter database db:migrate
```

## Web App (Next.js)

### Auth Client Setup

```typescript
// apps/web/src/lib/auth.ts
import { createAuthClient } from "auth/client/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030",
});
```

### Sign Up Form

```tsx
// apps/web/src/components/SignUpForm.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      await authClient.signUp.email({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-error-500">{error}</p>}
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
```

### Sign In Form

```tsx
// apps/web/src/components/SignInForm.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      await authClient.signIn.email({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-error-500">{error}</p>}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

### Protected Routes

```tsx
// apps/web/src/app/dashboard/layout.tsx
import { authClient } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await authClient.getSession();

  if (!session) {
    redirect("/signin");
  }

  return <>{children}</>;
}
```

## Mobile App (Expo)

### Auth Client Setup

```typescript
// apps/mobile/src/lib/auth.ts
import { createAuthClient } from "auth/client/native";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3030",
});
```

### Sign Up Screen

```tsx
// apps/mobile/src/app/signup.tsx
import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await authClient.signUp.email({ name, email, password });
      router.replace("/(tabs)");
    } catch (err) {
      setError("Sign up failed");
    }
  };

  return (
    <View className="flex-1 p-4">
      {error ? <Text className="text-error-500">{error}</Text> : null}
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
```

## API Server

### Verify Authentication Middleware

The `verifyAuth` middleware is already configured:

```typescript
// apps/api/src/plugins/auth.ts
app.decorate("verifyAuth", async (request, reply) => {
  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const session = await app.betterAuth.api.getSession({
    headers: { authorization: `Bearer ${token}` },
  });

  if (!session) {
    return reply.status(401).send({ message: "Invalid session" });
  }

  request.user = session.user;
  request.session = session.session;
});
```

### Protect Routes

```typescript
// apps/api/src/routes/protected.ts
app.route({
  method: "GET",
  url: "/api/v1/protected",
  preHandler: [app.verifyAuth],
  handler: async (request, reply) => {
    // request.user is available
    return {
      message: "Protected data",
      user: request.user,
    };
  },
});
```

## OAuth Authentication

### Google OAuth

```typescript
// Web
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/auth/callback",
});

// Mobile (requires expo-auth-session)
import * as AuthSession from "expo-auth-session";

const result = await AuthSession.startAsync({
  authUrl: `${API_URL}/auth/google`,
});
```

## Session Management

### Get Current Session

```typescript
const session = await authClient.getSession();

if (session) {
  console.log("User:", session.user);
  console.log("Expires:", session.session.expiresAt);
}
```

### Sign Out

```typescript
await authClient.signOut();
// Redirect to sign in page
```

## Best Practices

1. **Store tokens securely**
   - Web: httpOnly cookies (handled by Better Auth)
   - Mobile: Secure storage (Expo SecureStore)

2. **Validate on server**
   - Never trust client-side authentication
   - Always verify tokens on API

3. **Handle token expiration**
   - Check session.expiresAt
   - Refresh tokens before expiration

4. **Use HTTPS in production**
   - Required for secure token transmission

5. **Implement rate limiting**
   - Prevent brute force attacks on auth endpoints

## Troubleshooting

### "Unauthorized" errors

- Check `BETTER_AUTH_SECRET` is set
- Verify `Authorization` header format: `Bearer <token>`
- Ensure session hasn't expired

### OAuth redirect issues

- Verify callback URLs in OAuth provider settings
- Check `BETTER_AUTH_URL` matches your API URL

## Related Documentation

- [Auth Package](../packages/auth.md)
- [API Authentication Routes](../api/routes.md#authentication-routes)
- [Better Auth Documentation](https://www.better-auth.com)
