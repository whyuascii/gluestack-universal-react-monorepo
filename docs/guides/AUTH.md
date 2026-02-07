# Authentication Guide

Complete reference for Better Auth integration in this boilerplate.

## Overview

Authentication is powered by [Better Auth](https://better-auth.com), providing:

- Email/password authentication
- OAuth providers (Google, GitHub)
- Session management
- Email verification
- Password reset
- Cross-platform support (web + mobile)

## Architecture

```
packages/auth/
├── src/
│   ├── config.ts        # Server configuration (used by API)
│   ├── client/
│   │   ├── index.ts     # Web client (React)
│   │   └── native.ts    # Mobile client (React Native)
│   ├── hooks.ts         # Shared auth hooks
│   └── utils.ts         # Auth utilities
```

### How It Works

1. **API Server** mounts Better Auth at `/api/auth/*`
2. **Web Client** uses `@better-auth/react` with fetch
3. **Mobile Client** uses custom fetch with secure storage
4. **Database** stores sessions via Drizzle adapter

## Configuration

### Environment Variables

```bash
# Required
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
BETTER_AUTH_URL=http://localhost:3030

# OAuth (optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GITHUB_CLIENT_ID=Iv1.xxx
GITHUB_CLIENT_SECRET=xxx
```

### Server Configuration

**File:** `packages/auth/src/config.ts`

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@app/database";
import * as schema from "@app/database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
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
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
});
```

## Web Usage

### Setup Provider

**File:** `apps/web/src/app/providers.tsx`

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Authentication Hooks

```tsx
import { useSession, useSignIn, useSignUp, useSignOut } from "@app/auth/client";

// Check session
function AuthStatus() {
  const { data: session, isLoading } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello, {session.user.email}</div>;
}

// Sign in
function LoginForm() {
  const signIn = useSignIn();

  const handleSubmit = async (email: string, password: string) => {
    await signIn.mutateAsync({
      email,
      password,
    });
  };

  return (/* form */);
}

// Sign up
function SignUpForm() {
  const signUp = useSignUp();

  const handleSubmit = async (data: { email: string; password: string; name: string }) => {
    await signUp.mutateAsync({
      email: data.email,
      password: data.password,
      name: data.name,
    });
    // User will receive verification email
  };

  return (/* form */);
}

// Sign out
function LogoutButton() {
  const signOut = useSignOut();

  return (
    <button onClick={() => signOut.mutate()}>
      Sign Out
    </button>
  );
}
```

### OAuth Login

```tsx
import { signIn } from "@app/auth/client";

function SocialLogin() {
  const handleGoogleLogin = () => {
    signIn.social({ provider: "google" });
  };

  const handleGitHubLogin = () => {
    signIn.social({ provider: "github" });
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Continue with Google</button>
      <button onClick={handleGitHubLogin}>Continue with GitHub</button>
    </div>
  );
}
```

### Protected Routes

```tsx
// apps/web/src/app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@app/auth";
import { headers } from "next/headers";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
```

## Mobile Usage

### Setup

The mobile app uses a custom client that stores tokens securely:

```tsx
// apps/mobile/src/app/_layout.tsx
import { AuthProvider } from "@app/auth/client/native";

export default function RootLayout() {
  return <AuthProvider>{/* ... */}</AuthProvider>;
}
```

### Authentication Hooks (Mobile)

```tsx
import { useSession, useSignIn, useSignOut } from "@app/auth/client/native";

function MobileAuth() {
  const { session, isLoading } = useSession();
  const signIn = useSignIn();
  const signOut = useSignOut();

  if (isLoading) return <ActivityIndicator />;

  if (!session) {
    return <Button onPress={() => signIn({ email, password })}>Login</Button>;
  }

  return <Button onPress={() => signOut()}>Logout</Button>;
}
```

### Protected Screens (Mobile)

```tsx
// apps/mobile/src/app/(app)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useSession } from "@app/auth/client/native";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return <Stack />;
}
```

## Email Verification

### Flow

1. User signs up with email/password
2. Better Auth sends verification email (via Resend)
3. User clicks verification link
4. User is marked as verified in database

### Configuration

Email templates are in `packages/mailer/src/templates/`. Better Auth uses these automatically.

### Check Verification Status

```tsx
const { data: session } = useSession();

if (session && !session.user.emailVerified) {
  return <VerifyEmailPrompt />;
}
```

## Password Reset

### Request Reset

```tsx
import { useForgetPassword } from "@app/auth/client";

function ForgotPasswordForm() {
  const forgetPassword = useForgetPassword();

  const handleSubmit = async (email: string) => {
    await forgetPassword.mutateAsync({ email });
    // User receives reset email
  };

  return (/* form */);
}
```

### Reset Password

```tsx
import { useResetPassword } from "@app/auth/client";

function ResetPasswordForm({ token }: { token: string }) {
  const resetPassword = useResetPassword();

  const handleSubmit = async (newPassword: string) => {
    await resetPassword.mutateAsync({
      token,
      newPassword,
    });
  };

  return (/* form */);
}
```

## Database Schema

Better Auth manages these tables automatically:

```
packages/database/src/schema/auth/
├── user.ts          # users table
├── session.ts       # sessions table
├── account.ts       # OAuth accounts
└── verification.ts  # Email verification tokens
```

**Important:** Don't modify these schemas directly. Better Auth expects specific column names.

## API Protection

### Fastify Plugin

```typescript
// apps/api/src/plugins/auth.ts
import { FastifyPluginAsync } from "fastify";
import { auth } from "@app/auth";

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("auth", auth);

  fastify.decorateRequest("user", null);

  fastify.addHook("preHandler", async (request) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    request.user = session?.user || null;
  });
};
```

### Protected Routes

```typescript
fastify.get("/protected", async (request, reply) => {
  if (!request.user) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  return { user: request.user };
});
```

## Adding OAuth Providers

### 1. Get Credentials

- **Google:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **GitHub:** [GitHub Developer Settings](https://github.com/settings/developers)

### 2. Configure Redirect URIs

Add these callback URLs to your OAuth app:

```
# Development
http://localhost:3030/api/auth/callback/google
http://localhost:3030/api/auth/callback/github

# Production
https://api.yourdomain.com/api/auth/callback/google
https://api.yourdomain.com/api/auth/callback/github
```

### 3. Update Config

```typescript
// packages/auth/src/config.ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  // Add more providers...
  apple: {
    clientId: process.env.APPLE_CLIENT_ID!,
    clientSecret: process.env.APPLE_CLIENT_SECRET!,
  },
},
```

## Troubleshooting

### "Invalid origin" error

Add your frontend URL to `TRUSTED_ORIGINS`:

```bash
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081
```

### Session not persisting (mobile)

Check secure storage is working:

```tsx
import * as SecureStore from "expo-secure-store";

// Debug
const token = await SecureStore.getItemAsync("auth_token");
console.log("Stored token:", token);
```

### OAuth callback failing

1. Verify callback URLs match exactly in provider settings
2. Check `BETTER_AUTH_URL` matches your API URL
3. Ensure HTTPS in production

### Email verification not working

1. Check Resend API key is valid
2. Verify sender domain in Resend
3. Check spam folder
4. Review Resend dashboard for errors

## Security Best Practices

1. **Use HTTPS in production** - Required for secure cookies
2. **Set strong `BETTER_AUTH_SECRET`** - Use `openssl rand -base64 32`
3. **Validate `TRUSTED_ORIGINS`** - Only include your domains
4. **Enable rate limiting** - Configured in `apps/api/src/plugins/rate-limit.ts`
5. **Require email verification** - Set `requireEmailVerification: true`

## Next Steps

- **[EMAIL.md](./EMAIL.md)** - Customize auth email templates
- **[API.md](./API.md)** - Add more protected endpoints
- **[../DEPLOYING.md](../DEPLOYING.md)** - Production auth setup
