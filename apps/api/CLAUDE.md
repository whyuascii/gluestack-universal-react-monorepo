# API (apps/api)

Fastify 5 + oRPC API server at `:3030`.

## Route Organization

Routes are organized by access level in `src/orpc-routes/`:

- `public/` - No auth (health, waitlist)
- `private/` - Auth required (me, settings, todos)
- `admin/` - Auth + admin role required

## API Pattern

```typescript
// 1. Contract (packages/core-contract/src/contracts/example.ts)
export const exampleContract = {
  create: oc
    .route({ method: "POST", path: "/examples" })
    .input(z.object({ name: z.string() }))
    .output(z.object({ id: z.string() })),
};

// 2. Action (apps/api/src/actions/example.ts)
export class ExampleActions {
  static async create(input, context: AuthContext) {
    return db.insert(examples).values(input).returning();
  }
}

// 3. Route (apps/api/src/orpc-routes/example.ts)
const create = os.example.create
  .use(authMiddleware)
  .handler(({ input, context }) => ExampleActions.create(input, context));
```

## Middleware Stack

```typescript
.use(authMiddleware)                         // 1. Auth required
.use(tenantMiddleware)                       // 2. Tenant membership
.use(createRBACMiddleware("task", "create")) // 3. Permission check
.use(requireFeature("bulkExport"))           // 4. Subscription feature gate
```

## Novu Workflows (local testing)

```bash
# Terminal 1:
pnpm --filter api dev
# Terminal 2:
npx novu@latest dev --port 3030 --route /api/novu
# Open http://localhost:2022 to test workflows
```
