# @app/core-contract

Type-safe API contract definitions using [oRPC](https://orpc.unnoq.com/) and [Zod](https://zod.dev/). This package serves as the single source of truth for API shape, enabling type-safe communication between the API and all client applications.

## Overview

Contracts define:

- HTTP methods and paths
- Input validation schemas (request body/params)
- Output validation schemas (response body)
- Possible error codes and payloads

## Installation

```bash
pnpm add @app/core-contract
```

## Directory Structure

```
src/
├── index.ts                    # Main exports
├── router.ts                   # Three-tiered contract structure
├── errors.ts                   # Error codes & HTTP mappings
└── contracts/
    ├── public/                 # No auth required
    │   └── index.ts            # health, waitlist, analytics
    ├── private/                # Auth required
    │   ├── user.ts             # me, settings, preferences
    │   ├── workspace.ts        # tenants, invites
    │   ├── features.ts         # todos, dashboard
    │   ├── notifications.ts    # push preferences
    │   └── billing.ts          # subscriptions, entitlements
    └── admin/                  # Admin role required
        ├── metrics.ts          # platform analytics
        ├── users.ts            # user search & details
        ├── tenants.ts          # tenant inspection
        ├── impersonation.ts    # safe impersonation
        ├── flags.ts            # support flags
        ├── debug.ts            # webhook debugging
        └── audit.ts            # audit logs
```

## Usage

### Importing Contracts

```typescript
import {
  // Full router
  contract,

  // Individual contracts
  publicContract,
  privateContract,
  adminContract,

  // Schemas and types
  UserSchema,
  type User,
  TodoSchema,
  type Todo,

  // Error definitions
  ERROR_CODES,
  type ErrorCode,
} from "@app/core-contract";
```

### Contract Structure

Contracts follow a standardized pattern:

```typescript
import { oc } from "@orpc/contract";
import { z } from "zod";

// Input schema
const CreateTodoInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

// Output schema
const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.date(),
});

// Contract definition
export const todosContract = {
  create: oc
    .route({ method: "POST", path: "/private/todos" })
    .input(CreateTodoInput)
    .output(TodoSchema)
    .errors({
      UNAUTHORIZED: {},
      VALIDATION_ERROR: {},
    }),

  list: oc.route({ method: "GET", path: "/private/todos" }).output(z.array(TodoSchema)).errors({
    UNAUTHORIZED: {},
  }),
};
```

## Access Tiers

| Tier        | Path Prefix | Auth Required    | Description                                  |
| ----------- | ----------- | ---------------- | -------------------------------------------- |
| **Public**  | `/public/`  | No               | Health checks, waitlist, anonymous analytics |
| **Private** | `/private/` | Yes              | User features, workspaces, billing           |
| **Admin**   | `/admin/`   | Yes + Admin Role | Platform management, impersonation           |

## Error Codes

Standard error codes with HTTP status mappings:

| Code                  | HTTP Status | Description                     |
| --------------------- | ----------- | ------------------------------- |
| `UNAUTHORIZED`        | 401         | Authentication required         |
| `FORBIDDEN`           | 403         | Insufficient permissions        |
| `NOT_FOUND`           | 404         | Resource not found              |
| `BAD_REQUEST`         | 400         | Invalid request                 |
| `VALIDATION_ERROR`    | 422         | Schema validation failed        |
| `CONFLICT`            | 409         | Resource conflict               |
| `RATE_LIMITED`        | 429         | Too many requests               |
| `INTERNAL_ERROR`      | 500         | Server error                    |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable |

### Error Payloads

```typescript
// Validation errors include field details
type ValidationErrorData = {
  fields: Record<string, string[]>;
};

// Rate limit errors include retry timing
type RateLimitedErrorData = {
  retryAfter: number;
};
```

## Public Contracts

No authentication required.

### Health

```typescript
GET / public / health;
// Response: { status: "ok", timestamp: Date }
```

### Waitlist

```typescript
POST / public / waitlist;
// Input: { email: string }
// Response: { success: boolean }
```

### Analytics

```typescript
POST / public / analytics / track;
// Input: { event: string, properties?: object }
// Response: { success: boolean }
```

## Private Contracts

Requires authenticated user session.

### User (`/private/user/*`)

| Endpoint               | Method | Path                              | Description                   |
| ---------------------- | ------ | --------------------------------- | ----------------------------- |
| me                     | GET    | `/private/user/me`                | Current user + tenant context |
| updateProfile          | PUT    | `/private/user/profile`           | Update name, image            |
| updateLanguage         | PUT    | `/private/user/settings/language` | Language preference           |
| updateAnalyticsConsent | PUT    | `/private/user/analytics/consent` | Analytics opt-in/out          |

### Workspace (`/private/tenants/*`)

| Endpoint     | Method | Path                                       | Description          |
| ------------ | ------ | ------------------------------------------ | -------------------- |
| list         | GET    | `/private/tenants`                         | User's workspaces    |
| create       | POST   | `/private/tenants`                         | Create workspace     |
| get          | GET    | `/private/tenants/{id}`                    | Workspace details    |
| update       | PUT    | `/private/tenants/{id}`                    | Update workspace     |
| delete       | DELETE | `/private/tenants/{id}`                    | Delete workspace     |
| setActive    | POST   | `/private/tenants/{id}/activate`           | Set active workspace |
| getMembers   | GET    | `/private/tenants/{id}/members`            | List members         |
| updateMember | PUT    | `/private/tenants/{id}/members/{memberId}` | Update role          |
| removeMember | DELETE | `/private/tenants/{id}/members/{memberId}` | Remove member        |

### Invites (`/private/invites/*`)

| Endpoint | Method | Path                              | Description   |
| -------- | ------ | --------------------------------- | ------------- |
| send     | POST   | `/private/tenants/{id}/invites`   | Send invite   |
| list     | GET    | `/private/tenants/{id}/invites`   | List pending  |
| revoke   | DELETE | `/private/invites/{id}`           | Revoke invite |
| accept   | POST   | `/private/invites/{token}/accept` | Accept invite |

### Todos (`/private/todos/*`)

| Endpoint | Method | Path                         | Description       |
| -------- | ------ | ---------------------------- | ----------------- |
| list     | GET    | `/private/todos`             | List todos        |
| create   | POST   | `/private/todos`             | Create todo       |
| get      | GET    | `/private/todos/{id}`        | Get todo          |
| update   | PUT    | `/private/todos/{id}`        | Update todo       |
| delete   | DELETE | `/private/todos/{id}`        | Delete todo       |
| toggle   | POST   | `/private/todos/{id}/toggle` | Toggle completion |

### Billing (`/private/billing/*`)

| Endpoint        | Method | Path                            | Description             |
| --------------- | ------ | ------------------------------- | ----------------------- |
| getEntitlements | GET    | `/private/billing/entitlements` | Current tier + features |
| createCheckout  | POST   | `/private/billing/checkout`     | Start subscription      |
| getPortalUrl    | GET    | `/private/billing/portal`       | Manage subscription     |
| getSubscription | GET    | `/private/billing/subscription` | Subscription details    |

## Admin Contracts

Requires admin authentication and role.

### Metrics (`/admin/metrics/*`)

```typescript
GET / admin / metrics / overview; // ARR, MRR, users, tenants
GET / admin / metrics / engagement; // DAU, MAU, retention
GET / admin / metrics / revenue; // Revenue breakdown
GET / admin / metrics / retention; // Cohort retention
```

### Users (`/admin/users/*`)

```typescript
GET / admin / users; // Search users
GET / admin / users / { id }; // User details
GET / admin / users / { id } / activity; // User activity
POST / admin / users / { id } / notes; // Add support note
```

### Tenants (`/admin/tenants/*`)

```typescript
GET / admin / tenants; // Search tenants
GET / admin / tenants / { id }; // Tenant details
GET / admin / tenants / { id } / members; // Tenant members
POST / admin / tenants / { id } / notes; // Add support note
```

### Impersonation (`/admin/impersonation/*`)

```typescript
POST / admin / impersonation / start; // Start session (with audit)
POST / admin / impersonation / stop; // End session
GET / admin / impersonation / status; // Current session
GET / admin / impersonation / history; // Session history
POST / admin / impersonation / revoke; // Revoke active session
```

### Flags (`/admin/flags/*`)

```typescript
POST / admin / flags; // Create flag (at_risk, vip, etc.)
PUT / admin / flags / { id }; // Update flag
DELETE / admin / flags / { id }; // Remove flag
GET / admin / flags / user / { id }; // User's flags
GET / admin / flags / tenant / { id }; // Tenant's flags
```

### Debug (`/admin/debug/*`)

```typescript
GET / admin / debug / webhooks; // List failed webhooks
POST / admin / debug / webhooks / { id } / replay; // Replay with new ID
GET / admin / debug / system; // System status
```

## Key Schemas

### User

```typescript
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  preferredLanguage: SupportedLanguageSchema.optional(),
});
```

### Tenant Context

```typescript
const TenantContextSchema = z.object({
  activeTenantId: z.string().nullable(),
  memberships: z.array(
    z.object({
      tenantId: z.string(),
      tenantName: z.string(),
      role: z.enum(["owner", "admin", "member"]),
      memberRole: z.enum(["editor", "viewer", "contributor", "moderator"]).nullable(),
    })
  ),
});
```

### Entitlements

```typescript
const TenantEntitlementsSchema = z.object({
  tier: z.enum(["free", "pro", "enterprise"]),
  features: z.object({
    adsEnabled: z.boolean(),
    maxMembers: z.number(),
    exportLimit: z.number(),
    bulkExport: z.boolean(),
    prioritySupport: z.boolean(),
    analytics: z.boolean(),
    sso: z.boolean(),
    auditLogs: z.boolean(),
    apiAccess: z.boolean(),
  }),
  subscription: z
    .object({
      status: SubscriptionStatusSchema,
      provider: z.enum(["polar", "revenuecat"]).nullable(),
      currentPeriodEnd: z.date().nullable(),
      cancelAtPeriodEnd: z.boolean(),
    })
    .nullable(),
});
```

## Adding a New Contract

1. **Create schema file** in appropriate tier directory:

```typescript
// src/contracts/private/myfeature.ts
import { oc } from "@orpc/contract";
import { z } from "zod";

// Define schemas
export const MyItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

export const CreateMyItemInput = z.object({
  name: z.string().min(1, "validation:name.required"),
});

// Define contract
export const myFeatureContract = {
  list: oc
    .route({ method: "GET", path: "/private/myfeature" })
    .output(z.array(MyItemSchema))
    .errors({ UNAUTHORIZED: {} }),

  create: oc
    .route({ method: "POST", path: "/private/myfeature" })
    .input(CreateMyItemInput)
    .output(MyItemSchema)
    .errors({
      UNAUTHORIZED: {},
      VALIDATION_ERROR: {},
    }),
};

// Export types
export type MyItem = z.infer<typeof MyItemSchema>;
export type CreateMyItemInput = z.infer<typeof CreateMyItemInput>;
```

2. **Export from tier index**:

```typescript
// src/contracts/private/index.ts
export * from "./myfeature";

export const privateContract = {
  // ... existing
  myFeature: myFeatureContract,
};
```

3. **Implement route handler** in `apps/api/src/orpc-routes/`

4. **Create query/mutation hooks** in `packages/ui/src/hooks/`

## Best Practices

1. **Use i18n keys for validation messages**: `z.string().min(1, "validation:field.required")`

2. **Declare all possible errors upfront**: Makes error handling explicit

3. **Keep schemas atomic**: Compose complex types from smaller schemas

4. **Export both schemas and types**: Runtime validation + compile-time safety

5. **Group related endpoints**: Use object nesting for logical grouping

6. **Path parameters use braces**: `/users/{id}` not `/users/:id`

## Type Safety Flow

```
Contract (Zod Schema)
    ↓
API Route (Type-checked handler)
    ↓
Generated Client (Auto-typed requests)
    ↓
UI Hooks (Type-safe responses)
```

All layers share the same types from this package, ensuring end-to-end type safety.
