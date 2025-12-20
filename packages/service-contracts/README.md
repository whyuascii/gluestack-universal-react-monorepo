# Service Contracts

The service contracts package defines the contracts between different services, such as the React frontend and the Node.js backend. These contracts ensure that services communicate using well-defined and agreed-upon data structures and APIs.

## Purpose

The main purpose of the service contracts package is to establish a clear and consistent interface between services. By defining the contracts, we achieve:

1. **Type Safety**: Leverages Zod for TypeScript-first schema declaration and validation, providing strong type safety and ensuring data adheres to expected structures.

2. **Data Validation**: Defines validation rules for exchanged data, including required fields, data types, and constraints. Validates data against contracts to catch discrepancies early.

3. **API Documentation**: Serves as API documentation by clearly defining expected input and output for each service endpoint, helping maintain consistency.

4. **Decoupling**: Decouples implementation details of each service. Services can evolve independently as long as they adhere to defined contracts.

## Architecture

Service contracts are defined using Zod schemas and follow a specific structure:

```typescript
import { z } from "zod";

// Define the schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(18).max(120),
});

// Infer TypeScript type
type User = z.infer<typeof UserSchema>;
```

## Current Contracts

### Base Contracts (`base/`)

**BaseQueryParams** - Standard query parameters for pagination and sorting:

```typescript
import { BaseQueryParams } from "@app/service-contracts";

// Schema definition
const BaseQueryParams = z.object({
  limit: z.number().min(5).max(200).optional().default(20),
  skip: z.number().min(0).optional().default(0),
  sort: sortStringSchema.optional(),
});

// Usage in API
const query: BaseQueryParams = {
  limit: 50,
  skip: 0,
  sort: { name: 1, createdAt: -1 },
};
```

**Fields:**

- `limit` - Number of items to return (5-200, default: 20)
- `skip` - Number of items to skip for pagination (min: 0, default: 0)
- `sort` - Sort criteria using sortStringSchema from utils (e.g., "asc(name),desc(createdAt)")

### Error Contracts (`errors/`)

**UserErrorResponseSchema** - Structured error response for end-users:

```typescript
import { UserErrorResponse } from "@app/service-contracts";

// Schema definition
const UserErrorResponseSchema = z.object({
  message: z.string(),
  details: z.array(z.string()).optional(),
  meta: z.record(z.string()).optional(),
});

// Usage in error handling
const errorResponse: UserErrorResponse = {
  message: "Some users already exist.",
  details: ["email1@example.com", "email4@example.com"],
  meta: { duplicateCount: "2" },
};
```

**Fields:**

- `message` - Friendly, high-level error description for end-users
- `details` - Optional array of contextual details (e.g., affected items)
- `meta` - Optional key-value pairs for field-specific errors or additional context

### Generic Contracts (`generic/`)

**GenericSuccessResponse** - Standard success response:

```typescript
import { GenericSuccessResponse } from "@app/service-contracts";

const response: GenericSuccessResponse = {
  message: "Operation completed successfully.",
};
```

**GenericIdParams** - Standard ID parameter:

```typescript
import { GenericIdParams } from "@app/service-contracts";

const params: GenericIdParams = {
  id: "user-123",
};
```

**GenericNullResponse** - Null response type:

```typescript
import { GenericNullResponse } from "@app/service-contracts";

// For endpoints that return null
const response: null = null;
```

## Usage Examples

### API Endpoint Contracts

Define request and response contracts for API endpoints:

```typescript
import { z } from "zod";
import { BaseQueryParams } from "@app/service-contracts";

// Request contract
export const GetUsersRequest = BaseQueryParams.extend({
  role: z.enum(["admin", "user", "guest"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type GetUsersRequest = z.infer<typeof GetUsersRequest>;

// Response contract
export const GetUsersResponse = z.object({
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      role: z.string(),
      createdAt: z.string().datetime(),
    })
  ),
  total: z.number(),
  hasMore: z.boolean(),
});

export type GetUsersResponse = z.infer<typeof GetUsersResponse>;
```

### Validation in API Routes

Use contracts to validate incoming requests:

```typescript
import { GetUsersRequest } from "@app/service-contracts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse and validate query parameters
  const result = GetUsersRequest.safeParse({
    limit: searchParams.get("limit"),
    skip: searchParams.get("skip"),
    role: searchParams.get("role"),
    sort: searchParams.get("sort"),
  });

  if (!result.success) {
    return Response.json(
      { message: "Invalid query parameters", errors: result.error.errors },
      { status: 400 }
    );
  }

  // Use validated data
  const users = await fetchUsers(result.data);
  return Response.json(users);
}
```

### Client-Side Usage

Use contracts for type safety on the frontend:

```typescript
import { GetUsersRequest, GetUsersResponse } from "@app/service-contracts";

async function fetchUsers(params: GetUsersRequest): Promise<GetUsersResponse> {
  const queryString = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const response = await fetch(`/api/users?${queryString}`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();

  // Validate response matches contract
  return GetUsersResponse.parse(data);
}
```

### Error Handling

Use UserErrorResponse for consistent error handling:

```typescript
import { UserErrorResponse, UserErrorResponseSchema } from "@app/service-contracts";

export function handleApiError(error: unknown): UserErrorResponse {
  if (error instanceof Response) {
    const data = await error.json();

    // Validate error response matches contract
    const result = UserErrorResponseSchema.safeParse(data);

    if (result.success) {
      return result.data;
    }
  }

  // Fallback error
  return {
    message: "An unexpected error occurred. Please try again.",
  };
}
```

## Best Practices

### Contract Naming Conventions

Follow the naming pattern: `<Method><Service><Path><Request/Response>`

**Examples:**

- `GetUsersRequest` - GET request to /users
- `GetUsersResponse` - Response from GET /users
- `PostUsersRequest` - POST request to /users
- `PutUserByIdRequest` - PUT request to /users/:id
- `DeleteUserByIdResponse` - Response from DELETE /users/:id

### Validation Rules

**1. Nullish for Optional or Nullable Fields**

Use `.nullish()` when a field can be `null`, `undefined`, or a specified type:

```typescript
const UserSchema = z.object({
  name: z.string(),
  bio: z.string().nullish(), // Can be null, undefined, or string
});
```

**2. Defaults Everywhere**

Define default values unless a missing value should explicitly cause an error:

```typescript
const QueryParams = z.object({
  limit: z.number().default(20),
  page: z.number().default(1),
  sortBy: z.string().default("createdAt"),
});
```

**3. Non-Optional Responses**

Response schemas should not include optional fields. Provide default values where needed:

```typescript
// Good
const UserResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  bio: z.string().default(""), // Default instead of optional
});

// Bad
const UserResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  bio: z.string().optional(), // Optional in response
});
```

### Preprocessing and Transforms

Use preprocessing for data coercion:

```typescript
const QueryParams = z.object({
  // Convert string to number
  limit: z.preprocess((val) => Number.parseInt(val as string, 10), z.number().min(5).max(200)),

  // Convert string to boolean
  isActive: z.preprocess((val) => val === "true", z.boolean()),
});
```

### Documentation

Document complex schemas with JSDoc comments:

```typescript
/**
 * Request parameters for filtering and paginating user lists.
 */
export const GetUsersRequest = z.object({
  /**
   * Filter by user role
   * @default undefined (all roles)
   */
  role: z.enum(["admin", "user", "guest"]).optional(),

  /**
   * Number of users to return per page
   * @default 20
   * @min 5
   * @max 200
   */
  limit: z.number().min(5).max(200).default(20),
});
```

## Adding New Contracts

When adding new service contracts:

1. **Determine the category**: Base utilities, errors, generic responses, or feature-specific
2. **Create the schema**: Use Zod to define validation rules
3. **Export types**: Use `z.infer<typeof Schema>` for TypeScript types
4. **Document**: Add JSDoc comments explaining the contract's purpose
5. **Test**: Validate that parsing works with sample data

### Example: Adding a New Feature Contract

```typescript
// 1. Create src/users/index.ts
import { z } from "zod";
import { BaseQueryParams } from "../base";

// Request contracts
export const GetUsersRequest = BaseQueryParams.extend({
  role: z.enum(["admin", "user"]).optional(),
});

export const CreateUserRequest = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user"]).default("user"),
});

// Response contracts
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const GetUsersResponse = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  hasMore: z.boolean(),
});

export const CreateUserResponse = UserSchema;

// Export types
export type GetUsersRequest = z.infer<typeof GetUsersRequest>;
export type CreateUserRequest = z.infer<typeof CreateUserRequest>;
export type User = z.infer<typeof UserSchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponse>;
export type CreateUserResponse = z.infer<typeof CreateUserResponse>;

// 2. Export from src/index.ts
export * from "./users";
```

## Integration with Utils Package

The service-contracts package integrates with the `utils` package for advanced functionality:

```typescript
import { sortStringSchema } from "@app/utils";

// Use sort string parser in contracts
const QueryWithSort = z.object({
  sort: sortStringSchema.optional(),
});
```

## Common Patterns

### Pagination Response

```typescript
export function createPaginatedResponse<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    limit: z.number(),
    skip: z.number(),
    hasMore: z.boolean(),
  });
}

// Usage
const PaginatedUsersResponse = createPaginatedResponse(UserSchema);
```

### Partial Updates

```typescript
// For PATCH endpoints
export const UpdateUserRequest = CreateUserRequest.partial();
```

### ID Parameters

```typescript
import { GenericIdParams } from "@app/service-contracts";

// For routes like /users/:id
export const UserIdParams = GenericIdParams;
```

## What Should Be in Service Contracts

 API request/response schemas
 Shared data transfer objects (DTOs)
 Validation schemas for user input
 Error response formats
 Query parameter schemas

## What Should Not Be in Service Contracts

 Business logic
 Database models (use `database` package)
 Error classes (use `errors` package)
 Utility functions (use `utils` package)
 Component props (define in component files)
 State management types

## TypeScript Integration

All contracts automatically generate TypeScript types:

```typescript
import { GetUsersRequest, GetUsersResponse } from "@app/service-contracts";

// Types are automatically inferred
async function getUsers(params: GetUsersRequest): Promise<GetUsersResponse> {
  // Implementation
}
```

The contracts ensure type safety across your entire application stack!
