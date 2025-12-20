# Creating a New Route in the API

This guide provides steps and best practices for adding a new route to the API. When adding a new route, it's essential to follow a consistent structure, maintain separation of concerns, and ensure proper error handling.

The API uses:

- **Fastify** - Fast and low overhead web framework
- **PostgreSQL** with **Drizzle ORM** - Type-safe database queries
- **Zod** - Schema validation and type inference
- **fastify-type-provider-zod** - Type-safe route definitions

## Running the API

From the project root:

```bash
pnpm --filter api dev
```

The API will be available at `http://localhost:3030` by default.

## Adding a New Route

When adding a new route to the API, follow these steps:

### Step 1: Create Service Contracts (Optional but Recommended)

If your route returns structured data, create Zod schemas in the `packages/service-contracts` package:

```typescript
// packages/service-contracts/src/your-feature/index.ts
import { z } from "zod";

export const GetYourFeatureResponse = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
});

export type TGetYourFeatureResponse = z.infer<typeof GetYourFeatureResponse>;

export const YourFeatureErrorResponse = z.object({
  message: z.string(),
  details: z.array(z.string()).optional(),
  meta: z.record(z.string(), z.string()).optional(),
});

export type TYourFeatureErrorResponse = z.infer<typeof YourFeatureErrorResponse>;
```

Then export from `packages/service-contracts/src/index.ts`:

```typescript
export * from "./your-feature";
```

### Step 2: Create the Route Handler

Create a new file in `apps/api/src/routes/` directory. For this example, we'll call it `your-feature.ts`.

There are two route patterns you can follow:

#### Pattern 1: Simple Route (No Versioning)

Best for system routes like `/health` or `/me`:

```typescript
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetYourFeatureResponse, YourFeatureErrorResponse } from "@app/service-contracts";

const attachHandlers = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/your-feature",
    schema: {
      description: "Get your feature data",
      tags: ["YourFeature"],
      response: {
        200: GetYourFeatureResponse,
        500: YourFeatureErrorResponse,
      },
    },
    handler: async (request, reply) => {
      // Your logic here
      reply.send({ id: "123", name: "Example", createdAt: new Date() });
    },
  });
};

export default attachHandlers;
```

#### Pattern 2: Versioned Route (Recommended for API Routes)

Best for API routes that may evolve over time:

```typescript
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetYourFeatureResponse, YourFeatureErrorResponse } from "@app/service-contracts";
import { RouteOptions } from "../models";

const attachHandlers = (app: FastifyInstance, routeOptions: RouteOptions) => {
  const { rootPath, versionPrefix } = routeOptions;
  const basePath = `/${versionPrefix}/${rootPath}`;

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: `${basePath}`,
    schema: {
      description: "Get your feature data",
      tags: ["YourFeature"],
      response: {
        200: GetYourFeatureResponse,
        500: YourFeatureErrorResponse,
      },
    },
    handler: async (request, reply) => {
      // Your logic here
      reply.send({ id: "123", name: "Example", createdAt: new Date() });
    },
  });
};

export default attachHandlers;
```

### Step 3: Register the Route

In `apps/api/src/routes/index.ts`, import and register your new route:

```typescript
import type { FastifyInstance } from "fastify";
import health from "./health";
import me from "./me";
import swagger from "./swagger";
import users from "./users";
import yourFeature from "./your-feature"; // Import your route
import { VERSIONS } from "./versions";

export { VERSIONS } from "./versions";

const attachAllHandlers = (fastify: FastifyInstance) => {
  // System routes (no versioning)
  health(fastify);
  me(fastify);
  swagger(fastify);

  // Route Naming Principles:
  // - Use plural nouns to represent collections (e.g., /users, /reviews).
  // - Avoid deeply nested routes; flat and shallow structures are easier to maintain.
  // - At this level routes should correlate directly to a product domain.
  // - Maintain alphabetical order (A-Z) for consistency and readability.
  // - Use constants for versioning to ensure consistency across the application

  // Versioned API routes (alphabetical order)
  users(fastify, { rootPath: "users", versionPrefix: VERSIONS.V1 });
  yourFeature(fastify, { rootPath: "your-feature", versionPrefix: VERSIONS.V1 });
};

export default attachAllHandlers;
```

## Working with the Database

The API has a database plugin that provides access to the Drizzle ORM instance via `app.db`. Here's a complete example of a route that interacts with the database:

### Example: Create User Endpoint

```typescript
import { insertUserSchema, users, type InsertUser } from "database";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetUserResponse, UserErrorResponse } from "@app/service-contracts";
import { RouteOptions } from "../models";

export default (app: FastifyInstance, routeOptions: RouteOptions) => {
  const { rootPath, versionPrefix } = routeOptions;
  const basePath = `/${versionPrefix}/${rootPath}`;

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: `${basePath}`,
    schema: {
      description: "Create a new user",
      tags: ["users"],
      body: insertUserSchema, // Zod schema from database package
      response: {
        201: GetUserResponse,
        400: UserErrorResponse,
        500: UserErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const userData = request.body as InsertUser;

        // Insert user into database using Drizzle ORM
        const [newUser] = await app.db.insert(users).values(userData).returning();

        if (!newUser) {
          return reply.status(500).send({
            message: "Failed to create user",
          });
        }

        return reply.status(201).send(newUser);
      } catch (error) {
        app.log.error({ message: "Error creating user:", error });

        return reply.status(500).send({
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        });
      }
    },
  });
};
```

### Database Query Examples

#### Select with Filtering

```typescript
import { users, eq, and } from "database";

// Get all users for a tenant
const tenantUsers = await app.db.select().from(users).where(eq(users.tenantId, tenantId));

// Get user by email
const [user] = await app.db
  .select()
  .from(users)
  .where(and(eq(users.email, email), eq(users.tenantId, tenantId)));
```

#### Update

```typescript
import { users, eq, updateUserSchema } from "database";

const updateData = updateUserSchema.parse(request.body);

const [updatedUser] = await app.db
  .update(users)
  .set(updateData)
  .where(eq(users.id, userId))
  .returning();
```

#### Delete

```typescript
import { users, eq } from "database";

await app.db.delete(users).where(eq(users.id, userId));
```

For more database operations, see the [Database Package Documentation](../packages/database.md).

## Authentication with preHandlers

To protect routes with authentication, use the `app.verify` preHandler:

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: `${basePath}/protected`,
  preHandler: [app.verify], // Requires authentication
  schema: {
    description: "Protected endpoint",
    tags: ["Protected"],
    response: {
      200: YourResponse,
      401: UserErrorResponse,
    },
  },
  handler: async (request, reply) => {
    // Access authenticated user info
    const auth = request.authorization;
    const userId = auth.userId;
    const companyId = auth.companyId;

    // Your protected logic here
  },
});
```

## Request Validation with Zod

### Query Parameters

```typescript
import { z } from "zod";

const QueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: `${basePath}`,
  schema: {
    querystring: QueryParamsSchema,
    response: {
      200: YourResponse,
    },
  },
  handler: async (request, reply) => {
    const { page, limit, search } = request.query;
    // Query params are validated and typed
  },
});
```

### Path Parameters

```typescript
const ParamsSchema = z.object({
  id: z.string().uuid(),
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: `${basePath}/:id`,
  schema: {
    params: ParamsSchema,
    response: {
      200: YourResponse,
      404: UserErrorResponse,
    },
  },
  handler: async (request, reply) => {
    const { id } = request.params;
    // Params are validated and typed
  },
});
```

## Tips and Best Practices

When creating new routes in the API, consider the following tips and best practices:

### Structure and Organization

- **Keep handlers simple:** Business logic can live directly in handlers for simple cases. For complex operations, consider extracting to service classes or utility functions.
- **Use service contracts:** Define request and response schemas in the `packages/service-contracts` package for consistency.
- **Versioning:** Use versioned routes (`/v1/resource`) for public API endpoints to allow evolution without breaking clients.
- **Naming conventions:** Use plural nouns for collections (`/users`, `/posts`) and follow REST conventions.

### Type Safety

- **Leverage Zod schemas:** Import and reuse schemas from the `database` package for validation.
- **Type providers:** Always use `withTypeProvider<ZodTypeProvider>()` for type-safe routes.
- **Explicit types:** Use TypeScript types from schemas (e.g., `InsertUser`, `User`) for better IDE support.

### Error Handling

- **Global error handler:** Errors thrown in handlers are caught by the global error handler.
- **Structured errors:** Return consistent error responses using schemas from `service-contracts`.
- **Logging:** Use `app.log.error()` to log errors with context before returning responses.
- **HTTP status codes:** Use appropriate status codes (400 for validation, 404 for not found, 500 for server errors).

### Database Operations

- **Transaction support:** Use Drizzle's transaction API for operations that need atomicity.
- **Type-safe queries:** Import table schemas and query helpers from the `database` package.
- **Validation:** Always validate user input against Zod schemas before database operations.
- **Returning data:** Use `.returning()` to get inserted/updated records without additional queries.

### Security

- **Authentication:** Use `preHandler: [app.verify]` for protected routes.
- **Input validation:** Always validate and sanitize user input with Zod schemas.
- **SQL injection:** Drizzle ORM protects against SQL injection, but always use parameterized queries.
- **Sensitive data:** Never log sensitive information (passwords, tokens, etc.).

### Performance

- **Logging:** Use appropriate log levels (`info`, `warn`, `error`) to avoid log spam.
- **Query optimization:** Select only needed columns and use indexes appropriately.
- **Response size:** Paginate large result sets to avoid memory issues.

### Documentation

- **Schema descriptions:** Add clear descriptions to route schemas for Swagger documentation.
- **Tags:** Use meaningful tags to group related endpoints in Swagger UI.
- **Response schemas:** Document all possible response codes and their schemas.

### Environment Variables

- **Config plugin:** Access environment variables via `app.config` (e.g., `app.config.DATABASE_URL`).
- **Add new variables:** Update `apps/api/src/plugins/config.ts` to add new environment variables.

## Patterns and Conventions

### Route Naming

- **Plural nouns:** Use plural nouns for resource collections (`/users`, `/posts`, `/reviews`)
- **Kebab-case:** Use lowercase with hyphens for multi-word resources (`/user-settings`, `/api-keys`)
- **Avoid nesting:** Keep routes flat and shallow. Avoid deeply nested routes like `/companies/:companyId/users/:userId/settings`
- **Resource-oriented:** Routes should represent resources, not actions. Use HTTP methods to indicate actions:
  - `POST /users` (create)
  - `GET /users/:id` (read)
  - `PATCH /users/:id` (update)
  - `DELETE /users/:id` (delete)

### Sub-Routes and Parameters

- **Clear parameter names:** Use descriptive names for path parameters (`/:userId`, `/:postId`, not `/:id` at nested levels)
- **Query parameters:** Use clear names for filters and options (`?status=active`, `?page=1`, `?sortBy=createdAt`)
- **Separate routes for different resources:** Don't make sub-routes optional. Create distinct routes:
  - ✅ `/users` and `/users/:userId`
  - ❌ `/users/:userId?` (optional parameter)

### File Organization

- **One file per resource:** Each resource gets its own route file (e.g., `users.ts`, `posts.ts`)
- **Alphabetical order:** Register routes in alphabetical order in `routes/index.ts`
- **Group by feature:** For complex features, create a subdirectory (e.g., `routes/admin/`)

## Complete Example: CRUD Operations

Here's a comprehensive example showing all CRUD operations for a resource:

```typescript
import { posts, insertPostSchema, updatePostSchema, eq, and, type InsertPost } from "database";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { GetPostResponse, GetPostsResponse, PostErrorResponse } from "@app/service-contracts";
import { RouteOptions } from "../models";

export default (app: FastifyInstance, routeOptions: RouteOptions) => {
  const { rootPath, versionPrefix } = routeOptions;
  const basePath = `/${versionPrefix}/${rootPath}`;

  // CREATE - POST /v1/posts
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: `${basePath}`,
    preHandler: [app.verify],
    schema: {
      description: "Create a new post",
      tags: ["Posts"],
      body: insertPostSchema,
      response: {
        201: GetPostResponse,
        400: PostErrorResponse,
        500: PostErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const auth = request.authorization;
        const postData = request.body as InsertPost;

        const [newPost] = await app.db
          .insert(posts)
          .values({
            ...postData,
            authorId: auth.userId,
            tenantId: auth.companyId,
          })
          .returning();

        if (!newPost) {
          return reply.status(500).send({ message: "Failed to create post" });
        }

        return reply.status(201).send(newPost);
      } catch (error) {
        app.log.error({ message: "Error creating post", error });
        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
        });
      }
    },
  });

  // READ (List) - GET /v1/posts
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: `${basePath}`,
    preHandler: [app.verify],
    schema: {
      description: "Get all posts for tenant",
      tags: ["Posts"],
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
      }),
      response: {
        200: GetPostsResponse,
        500: PostErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const auth = request.authorization;
        const { page, limit } = request.query;
        const offset = (page - 1) * limit;

        const tenantPosts = await app.db
          .select()
          .from(posts)
          .where(eq(posts.tenantId, auth.companyId))
          .limit(limit)
          .offset(offset);

        return reply.send({ data: tenantPosts, page, limit });
      } catch (error) {
        app.log.error({ message: "Error fetching posts", error });
        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
        });
      }
    },
  });

  // READ (Single) - GET /v1/posts/:id
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: `${basePath}/:id`,
    preHandler: [app.verify],
    schema: {
      description: "Get a single post by ID",
      tags: ["Posts"],
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: GetPostResponse,
        404: PostErrorResponse,
        500: PostErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const auth = request.authorization;
        const { id } = request.params;

        const [post] = await app.db
          .select()
          .from(posts)
          .where(and(eq(posts.id, id), eq(posts.tenantId, auth.companyId)));

        if (!post) {
          return reply.status(404).send({ message: "Post not found" });
        }

        return reply.send(post);
      } catch (error) {
        app.log.error({ message: "Error fetching post", error });
        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
        });
      }
    },
  });

  // UPDATE - PATCH /v1/posts/:id
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: `${basePath}/:id`,
    preHandler: [app.verify],
    schema: {
      description: "Update a post",
      tags: ["Posts"],
      params: z.object({
        id: z.string().uuid(),
      }),
      body: updatePostSchema,
      response: {
        200: GetPostResponse,
        404: PostErrorResponse,
        500: PostErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const auth = request.authorization;
        const { id } = request.params;
        const updateData = request.body;

        const [updatedPost] = await app.db
          .update(posts)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(and(eq(posts.id, id), eq(posts.tenantId, auth.companyId)))
          .returning();

        if (!updatedPost) {
          return reply.status(404).send({ message: "Post not found" });
        }

        return reply.send(updatedPost);
      } catch (error) {
        app.log.error({ message: "Error updating post", error });
        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
        });
      }
    },
  });

  // DELETE - DELETE /v1/posts/:id
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: `${basePath}/:id`,
    preHandler: [app.verify],
    schema: {
      description: "Delete a post",
      tags: ["Posts"],
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.void(),
        404: PostErrorResponse,
        500: PostErrorResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        const auth = request.authorization;
        const { id } = request.params;

        const result = await app.db
          .delete(posts)
          .where(and(eq(posts.id, id), eq(posts.tenantId, auth.companyId)))
          .returning();

        if (result.length === 0) {
          return reply.status(404).send({ message: "Post not found" });
        }

        return reply.status(204).send();
      } catch (error) {
        app.log.error({ message: "Error deleting post", error });
        return reply.status(500).send({
          message: error instanceof Error ? error.message : "Internal server error",
        });
      }
    },
  });
};
```

## Related Documentation

- [Database Package](../packages/database.md) - Working with Drizzle ORM and PostgreSQL
- [Service Contracts](../packages/service-contracts.md) - Shared Zod schemas for API contracts
- [Error Handling](./error-handling.md) - Global error handling patterns
- [API README](./README.md) - API overview and architecture
