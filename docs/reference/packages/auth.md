# Auth Package

The `auth` package provides authentication using **Better Auth** with support for email/password and OAuth providers (Google, GitHub).

## Overview

Better Auth is a type-safe, full-featured authentication library that integrates with Drizzle ORM and works across web and mobile platforms.

**Key Features:**

- Email/password authentication with verification
- OAuth providers (Google, GitHub)
- Session management
- Type-safe client APIs
- Platform-specific clients (React & React Native)
- Drizzle ORM integration

## Installation

The auth package is already installed as a workspace dependency:

```json
{
  "dependencies": {
    "auth": "workspace:*"
  }
}
```

## Configuration

### Server-Side Setup (API)

```typescript
// apps/api/src/plugins/auth.ts
import { createAuthConfig } from "auth";

const auth = createAuthConfig();

// Register with Fastify
app.decorate("betterAuth", auth);
```

### Environment Variables

Required environment variables:

```bash
# Required
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3030

# Optional - Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional - GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Generating BETTER_AUTH_SECRET:**

```bash
# Generate a secure random secret
openssl rand -base64 32
```

## Database Schema

The auth package uses four tables (created automatically by Better Auth):

```typescript
// packages/database/src/schema/auth/
├── user.ts          # User accounts
├── session.ts       # Active sessions
├── account.ts       # OAuth accounts
└── verification.ts  # Email verification tokens
```

Run migrations to create these tables:

```bash
pnpm --filter database generate
pnpm --filter database db:migrate
```

## Client Usage

### Web (React)

```typescript
// apps/web/src/lib/auth.ts
import { createAuthClient } from "auth/client/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3030",
});
```

```tsx
// apps/web/src/components/SignIn.tsx
import { authClient } from "../lib/auth";

function SignInForm() {
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const result = await authClient.signIn.email({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      console.log("Signed in:", result.user);
      // Redirect to dashboard
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Mobile (React Native)

```typescript
// apps/mobile/src/lib/auth.ts
import { createAuthClient } from "auth/client/native";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3030",
});
```

```tsx
// apps/mobile/src/screens/SignInScreen.tsx
import { authClient } from "../lib/auth";
import { useState } from "react";
import { View, TextInput, Button } from "react-native";

function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      console.log("Signed in:", result.user);
      // Navigate to home screen
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
}
```

## API Methods

### Sign Up

Create a new user account:

```typescript
const result = await authClient.signUp.email({
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePassword123!",
});

// Returns:
{
  user: {
    id: "...",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: false
  },
  session: {
    token: "...",
    expiresAt: Date
  }
}
```

### Sign In

Sign in with email and password:

```typescript
const result = await authClient.signIn.email({
  email: "john@example.com",
  password: "SecurePassword123!",
});

// Returns same structure as signUp
```

### Sign Out

Sign out and invalidate session:

```typescript
await authClient.signOut();
```

### Get Current Session

```typescript
const session = await authClient.getSession();

if (session) {
  console.log("Logged in as:", session.user.email);
} else {
  console.log("Not logged in");
}
```

### OAuth Sign In

```typescript
// Google
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/auth/callback",
});

// GitHub
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/auth/callback",
});
```

## Server-Side Usage (API Routes)

### Verify Authentication

```typescript
// apps/api/src/routes/protected.ts
import type { FastifyInstance } from "fastify";

export default (app: FastifyInstance) => {
  app.route({
    method: "GET",
    url: "/api/v1/protected",
    preHandler: [app.verifyAuth], // Authentication required
    handler: async (request, reply) => {
      // request.user is available here
      return {
        message: "Protected data",
        user: request.user,
      };
    },
  });
};
```

### Manual Token Verification

```typescript
import { auth } from "auth";

const token = request.headers.authorization?.replace("Bearer ", "");

if (!token) {
  return reply.status(401).send({ message: "Unauthorized" });
}

const session = await auth.api.getSession({
  headers: { authorization: `Bearer ${token}` },
});

if (!session) {
  return reply.status(401).send({ message: "Invalid session" });
}
```

## TypeScript Types

The auth package exports types for use across the application:

```typescript
import type { User, Session } from "auth/types";

interface UserProfile extends User {
  customField: string;
}

function getUserProfile(user: User): UserProfile {
  return {
    ...user,
    customField: "value",
  };
}
```

## Email Verification

Email verification is enabled by default. Users must verify their email before accessing protected resources.

**Workflow:**

1. User signs up
2. Verification email sent (configure email provider)
3. User clicks verification link
4. `emailVerified` set to `true`

**Configure Email Provider:**

```typescript
// packages/auth/src/config.ts
import { createAuthConfig } from "better-auth";
import { sendEmail } from "./email-service";

export const auth = createAuthConfig({
  // ... other config
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `<a href="${url}/verify?token=${token}">Verify Email</a>`,
      });
    },
  },
});
```

## Security Best Practices

### 1. Secure Secret Key

```bash
# Use a strong, random secret (min 32 characters)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```

### 2. HTTPS in Production

```bash
# Always use HTTPS in production
BETTER_AUTH_URL=https://api.yourapp.com
```

### 3. Password Requirements

Enforce strong passwords:

```typescript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[0-9]/, "Password must contain number")
  .regex(/[^A-Za-z0-9]/, "Password must contain special character");
```

### 4. Rate Limiting

Implement rate limiting on auth routes:

```typescript
import rateLimit from "@fastify/rate-limit";

app.register(rateLimit, {
  max: 5,
  timeWindow: "15 minutes",
});
```

## Troubleshooting

### "BETTER_AUTH_SECRET is required"

Set the environment variable:

```bash
export BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```

### "Database connection failed"

Ensure `DATABASE_URL` is set and database is running:

```bash
docker run -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16
```

### OAuth redirect issues

Ensure callback URLs are registered with OAuth providers:

- Google: https://console.cloud.google.com
- GitHub: https://github.com/settings/developers

## Related Documentation

- [API Authentication Routes](../api/routes.md#authentication-routes)
- [Authentication Guide](../guides/authentication.md)
- [Database Package](./database.md)
- [Better Auth Documentation](https://www.better-auth.com)
