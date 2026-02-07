# API Guide

Complete reference for the Fastify API server with oRPC in this boilerplate.

## Overview

The API is powered by [Fastify](https://fastify.dev) with [oRPC](https://orpc.unnoq.com/) for type-safe RPC:

- **oRPC** - End-to-end type-safe RPC with automatic OpenAPI generation
- **Fastify** - High-performance HTTP server
- **Better Auth** - Authentication integration
- **Drizzle ORM** - Type-safe database access

## Architecture

```
apps/api/src/
├── index.ts              # Server entry point
├── app.ts                # Fastify app configuration
├── handler.ts            # oRPC OpenAPIHandler with error interceptor
├── orpc-routes/          # Feature-organized route modules
│   ├── _implementer.ts   # Shared oRPC implementer
│   ├── health.ts         # Health check routes
│   ├── me.ts             # Current user routes
│   ├── tenants.ts        # Tenant management routes
│   ├── invites.ts        # Invitation routes
│   ├── waitlist.ts       # Waitlist routes
│   ├── dashboard.ts      # Dashboard routes
│   └── index.ts          # Combines all feature routers
├── actions/              # Business logic classes
├── middleware/           # oRPC middleware (auth, tenant, RBAC)
├── lib/                  # Core utilities
│   ├── errors.ts         # Error handling
│   ├── openapi.ts        # OpenAPI spec generator
│   └── posthog.ts        # Analytics
└── plugins/              # Fastify plugins
    ├── auth.ts           # Better Auth integration
    ├── cors.ts           # CORS configuration
    └── rate-limit.ts     # Rate limiting

packages/core-contract/   # oRPC contract definitions (API types)
packages/config/          # RBAC config, constants, shared types
```

## Configuration

### Environment Variables

```bash
# Server
PORT=3030
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3030

# CORS
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081

# Email
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=hello@yourdomain.com

# Analytics
POSTHOG_KEY=phc_...
POSTHOG_HOST=https://us.i.posthog.com
```

## oRPC Implementation

### 1. Define Contract (Shared Types)

Contracts define the API shape and are shared between frontend and backend:

```typescript
// packages/core-contract/src/contracts/settings.ts
import { oc } from "@orpc/contract";
import { z } from "zod";

export const settingsContract = {
  get: oc
    .route({ method: "GET", path: "/settings" })
    .input(z.void())
    .output(
      z.object({
        emailNotifications: z.boolean(),
        pushNotifications: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  update: oc
    .route({ method: "PUT", path: "/settings" })
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
      })
    )
    .output(
      z.object({
        emailNotifications: z.boolean(),
        pushNotifications: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      BAD_REQUEST: {},
    }),
};

// Export from packages/core-contract/src/router.ts
export const contract = {
  // ...existing
  settings: settingsContract,
};
```

### 2. Create Action Class (Business Logic)

Actions contain all business logic separated from routes:

```typescript
// apps/api/src/actions/settings.ts
import { db, userSettings, eq } from "@app/database";
import { throwError } from "../lib/errors";
import type { AuthContext } from "../middleware/auth";

export class SettingsActions {
  static async get(context: AuthContext) {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, context.user.id))
      .limit(1);

    if (!settings) {
      return { emailNotifications: true, pushNotifications: true };
    }

    return {
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
    };
  }

  static async update(
    input: { emailNotifications?: boolean; pushNotifications?: boolean },
    context: AuthContext
  ) {
    // Business logic here...
  }
}
```

### 3. Create Route Handler

Route handlers are thin wrappers that apply middleware and delegate to actions:

```typescript
// apps/api/src/orpc-routes/settings.ts
/**
 * Settings Routes
 *
 * Routes for user notification settings.
 * All routes require authentication.
 */
import { SettingsActions } from "../actions/settings";
import { authMiddleware } from "../middleware";
import { os } from "./_implementer"; // Always import os from _implementer

// GET /rpc/settings/get
const get = os.settings.get.use(authMiddleware).handler(async ({ context }) => {
  return SettingsActions.get(context);
});

// PUT /rpc/settings/update
const update = os.settings.update.use(authMiddleware).handler(async ({ input, context }) => {
  return SettingsActions.update(input, context);
});

export const settingsRoutes = {
  get,
  update,
};
```

### 4. Register Routes

Add new routes to the main router:

```typescript
// apps/api/src/orpc-routes/index.ts
import { os } from "./_implementer";
import { healthRoutes } from "./health";
import { meRoutes } from "./me";
import { settingsRoutes } from "./settings";
// ... other imports

export const router = os.router({
  health: healthRoutes,
  me: meRoutes,
  settings: settingsRoutes,
  // ... other routes
});

export type Router = typeof router;
```

## Middleware

### Available Middleware

| Middleware                               | Purpose                                 | When to Use                 |
| ---------------------------------------- | --------------------------------------- | --------------------------- |
| `authMiddleware`                         | Validates session, adds user to context | All protected routes        |
| `tenantMiddleware`                       | Validates user belongs to active tenant | Tenant-scoped resources     |
| `createRBACMiddleware(resource, action)` | Checks role permissions                 | Role-based operations       |
| `requireRole(role)`                      | Minimum role check                      | Admin-only operations       |
| `requireFeature(feature)`                | Gates premium features                  | Subscription-based features |
| `requireTier(tier)`                      | Requires subscription tier              | Pro/Enterprise features     |

### Middleware Chaining

Order matters - always chain in this order:

```typescript
import {
  authMiddleware,
  tenantMiddleware,
  createRBACMiddleware,
  requireFeature,
} from "../middleware";
import { os } from "./_implementer";

// 1. Auth only
const get = os.settings.get
  .use(authMiddleware)
  .handler(...);

// 2. Auth + Tenant
const list = os.tasks.list
  .use(authMiddleware)
  .use(tenantMiddleware)
  .handler(...);

// 3. Auth + Tenant + RBAC
const create = os.tasks.create
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(createRBACMiddleware("task", "create"))
  .handler(...);

// 4. Auth + Tenant + Feature Flag
const analytics = os.dashboard.analytics
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(requireFeature("analytics_dashboard"))
  .handler(...);
```

### Context Types

```typescript
// After authMiddleware
interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    activeTenantId?: string | null;
  };
  session: { id: string; expiresAt: Date /* ... */ };
}

// After tenantMiddleware (extends AuthContext)
interface TenantContext extends AuthContext {
  membership: {
    id: string;
    role: Role; // "owner" | "admin" | "member"
    tenantId: string;
    joinedAt: Date;
  };
  tenant: {
    id: string;
    name: string;
    type: string;
  };
}
```

## Error Handling

### Using throwError

All errors should use `throwError` from `lib/errors.ts`:

```typescript
import { throwError } from "../lib/errors";

// Simple errors
throwError("NOT_FOUND", "Resource not found");
throwError("FORBIDDEN", "Not authorized");
throwError("BAD_REQUEST", "Invalid input");
throwError("CONFLICT", "Already exists");
throwError("INTERNAL_ERROR", "Something went wrong");

// With additional data
throwError("VALIDATION_ERROR", "Invalid email format", { field: "email" });
```

### Error Flow

```
Action throws error
       ↓
handler.ts onError interceptor
       ↓
lib/errors.ts handleError()
       ↓
┌──────┼──────┬──────────────┐
↓      ↓      ↓              ↓
JSON   PostHog  Formatted    Log
log    capture  response     (dev)
```

**DO NOT:**

- Import `ORPCError` directly (use `throwError` wrapper)
- Create custom error middleware (handler.ts handles all errors)

## OpenAPI / Swagger

oRPC automatically generates OpenAPI specs. Access at:

- **Spec:** `GET /openapi.json`

```typescript
// The spec is generated from contracts automatically
import { generateOpenAPISpec } from "./lib/openapi";

const spec = await generateOpenAPISpec();
```

## RBAC Configuration

RBAC (Role-Based Access Control) uses a **two-tier system** defined in `packages/config/src/rbac/`:

### Two-Tier Role System

1. **Tenant Roles** (Management) - Stored in `tenant_members.role`:
   - `owner`: Subscription purchaser, full control
   - `admin`: Co-administrators, full feature access
   - `member`: Access controlled by Member Role

2. **Member Roles** (Functional) - Stored in `tenant_members.member_role`:
   - `editor`: Full content CRUD
   - `viewer`: Read-only
   - `contributor`: Create and read (default)
   - `moderator`: Can moderate others' content

**Key:** Owners and Admins have **full access**. Member roles only apply when `tenantRole="member"`.

```typescript
import { canAccess, isAdminOrOwner, TENANT_ROLES, MEMBER_ROLES } from "@app/config";

// Primary function - checks both roles
canAccess("admin", null, "task", "delete"); // true (admin has full access)
canAccess("member", "editor", "task", "delete"); // true (editor can delete)
canAccess("member", "viewer", "task", "delete"); // false (viewer is read-only)

// Quick admin check
isAdminOrOwner("admin"); // true
isAdminOrOwner("member"); // false
```

### Permission Matrix (Members Only)

| Member Role     | task | project | comment | file | invite |
| --------------- | ---- | ------- | ------- | ---- | ------ |
| **editor**      | CRUD | CRU     | CRUD    | CRUD | -      |
| **viewer**      | R    | R       | R       | R    | -      |
| **contributor** | CRU  | R       | CRU     | CR   | -      |
| **moderator**   | RUD  | RU      | RUD     | RD   | CR     |

_Owners and Admins have `manage` (full access) on all resources._

### To Update RBAC

Edit `packages/config/src/rbac/index.ts` - the file contains detailed documentation.

## Plugins

### Auth Plugin

Better Auth is mounted for handling authentication:

```typescript
// apps/api/src/plugins/auth.ts
// Mounts Better Auth at /api/auth/*
```

### CORS Plugin

```typescript
// apps/api/src/plugins/cors.ts
// Configure TRUSTED_ORIGINS env variable
```

### Rate Limiting

```typescript
// apps/api/src/plugins/rate-limit.ts
// Default: 100 requests per minute
// Auth routes: 5 requests per minute
```

## Health Check

```bash
# Check API health
curl http://localhost:3030/rpc/health/check
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 3600
}
```

## Testing

### Route Tests

```typescript
// apps/api/src/__tests__/settings.test.ts
import { describe, it, expect } from "vitest";
import { app } from "./setup";

describe("GET /rpc/settings/get", () => {
  it("returns settings for authenticated user", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/rpc/settings/get",
      headers: {
        cookie: `better-auth.session=${testSessionToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toMatchObject({
      emailNotifications: true,
    });
  });

  it("returns 401 without auth", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/rpc/settings/get",
    });

    expect(response.statusCode).toBe(401);
  });
});
```

## Common Patterns

### CRUD Operations

| Operation | Method | Path Pattern           | Example                 |
| --------- | ------ | ---------------------- | ----------------------- |
| List      | GET    | /rpc/{resource}/list   | `/rpc/tasks/list`       |
| Get       | GET    | /rpc/{resource}/get    | `/rpc/tasks/get?id=xxx` |
| Create    | POST   | /rpc/{resource}/create | `/rpc/tasks/create`     |
| Update    | PUT    | /rpc/{resource}/update | `/rpc/tasks/update`     |
| Delete    | DELETE | /rpc/{resource}/delete | `/rpc/tasks/delete`     |

### Database Transactions

```typescript
import { db } from "@app/database";

await db.transaction(async (tx) => {
  await tx.insert(tableA).values(dataA);
  await tx.insert(tableB).values(dataB);
});
```

## Troubleshooting

### CORS Errors

1. Check `TRUSTED_ORIGINS` includes your frontend URL
2. Verify credentials: true is set
3. Check for preflight OPTIONS handling

### 401 Unauthorized

1. Verify auth token is being sent in cookies
2. Check `BETTER_AUTH_SECRET` matches
3. Verify session exists in database

### Type Errors

1. Rebuild core-contract: `pnpm --filter @app/core-contract build`
2. Restart TypeScript server
3. Check contract is exported from router.ts

## Best Practices

1. **Define contracts first** - Start with the contract, then implement
2. **Keep routes thin** - Business logic goes in actions
3. **Use middleware appropriately** - Auth → Tenant → RBAC → Features
4. **Handle errors with throwError** - Consistent error handling
5. **Test critical paths** - Auth, payments, tenant operations
6. **Use TypeScript strictly** - Let the types guide you

## Next Steps

- **[DATABASE.md](./DATABASE.md)** - Database patterns
- **[AUTH.md](./AUTH.md)** - Authentication details
- **[../DEPLOYING.md](../DEPLOYING.md)** - Production deployment
- **[oRPC Docs](https://orpc.unnoq.com/)** - Official oRPC documentation
- **[Fastify Docs](https://fastify.dev/docs)** - Official Fastify documentation
