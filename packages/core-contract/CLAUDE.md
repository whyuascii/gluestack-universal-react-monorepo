# packages/core-contract — oRPC API Contracts

Single source of truth for the entire API surface. Changes here flow to API routes, client SDK, and UI hooks.

## Structure

```
src/
├── router.ts              # Top-level router: { public, private, admin }
├── errors.ts              # Error codes & schemas (UNAUTHORIZED, NOT_FOUND, etc.)
├── index.ts               # Main exports
└── contracts/
    ├── public/            # No auth required (health, waitlist, analytics)
    ├── private/           # Auth required
    │   ├── user.ts        # me, settings, analytics consent
    │   ├── workspace.ts   # tenants, invites
    │   ├── features.ts    # todos, dashboard
    │   ├── notifications.ts
    │   └── billing.ts     # subscription status, checkout
    └── admin/             # Auth + admin role
        ├── metrics.ts     # Platform analytics
        ├── users.ts       # User lookup, impersonation
        ├── tenants.ts     # Tenant search, details
        ├── flags.ts       # Support flags
        └── audit.ts       # Audit log
```

## Contract Definition Pattern

```typescript
import { oc } from "@orpc/contract";
import { z } from "zod";

export const todosContract = {
  create: oc
    .route({ method: "POST", path: "/private/features/todos" })
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
      })
    )
    .output(TodoSchema)
    .errors({ UNAUTHORIZED: {}, BAD_REQUEST: {} }),

  list: oc
    .route({ method: "GET", path: "/private/features/todos" })
    .output(z.object({ todos: z.array(TodoSchema) }))
    .errors({ UNAUTHORIZED: {} }),
};
```

## Router Hierarchy

```typescript
// router.ts
export const contract = {
  public: publicContract, // No auth
  private: privateContract, // Auth required
  admin: adminContract, // Auth + admin role
};
```

Access in API: `os.private.features.todos.create`
Access in UI: `orpc.private.features.todos.create.mutationOptions()`

## Flow: Contract → API → UI

```
Contract (here)           → defines input/output/errors
API route (apps/api)      → implements with middleware + handler
oRPC client (packages/ui) → auto-generates typed client
UI hooks (packages/ui)    → wraps in TanStack Query
```

## Error Codes

```typescript
UNAUTHORIZED; // 401 — Not authenticated
FORBIDDEN; // 403 — Not authorized
NOT_FOUND; // 404 — Resource not found
CONFLICT; // 409 — Resource conflict
BAD_REQUEST; // 400 — Invalid request
RATE_LIMITED; // 429 — Too many requests
```

## Conventions

- **Schemas**: PascalCase + `Schema` suffix (`TodoSchema`, `TenantEntitlementsSchema`)
- **Types**: Inferred via `z.infer<typeof Schema>`
- **Contracts**: camelCase, plural for collections (`todosContract`)
- **Paths**: kebab-case (`/private/workspace/tenants/{id}/invites`)
- **Methods**: GET (read), POST (create/action), PATCH (update), DELETE (remove)
- Define schemas alongside contracts, not in separate files
- Export both schema AND inferred type
- Declare expected `.errors({})` on every route

## Rules

- This package is the API's source of truth — change contracts FIRST
- After modifying, update the API route handler and UI hooks
- Always add `.errors()` to document possible failures
- Use Zod for all input/output validation
- Export from barrel files: contract file → domain index → contracts/index → router
