# Error Handling

The API uses a centralized error handling system that provides consistent error responses and logging.

## Global Error Handler

Located in `src/utils/error-handling.ts`, the global error handler:

1. Catches all errors thrown during request processing
2. Transforms errors into standardized responses
3. Logs errors appropriately
4. Returns user-friendly error messages

## Error Types

### Zod Validation Errors

Automatically handled when request validation fails:

```typescript
// Request with invalid query parameters
GET /items?page=invalid

// Response
{
  "message": "Validation failed.",
  "details": [
    "Expected number, received string at page"
  ]
}
// Status: 422
```

### Custom Application Errors

Use error classes from the `errors` package:

```typescript
import { AppCustomError } from "errors";

throw new AppCustomError({
  message: "User not found",  // Internal log message
  statusCode: 404,
  userResponse: {
    message: "The requested user does not exist"
  },
  debug: {
    userId: userId,
    tenantId: tenantId
  }
});
```

### Fastify Sensible Errors

Fastify provides helpful HTTP error methods:

```typescript
import type { FastifyReply } from "fastify";

// In your handler
if (!user) {
  return reply.notFound("User not found");
}

// Or throw
throw app.httpErrors.unauthorized("Invalid credentials");
```

## Custom Error Classes

### AppCustomError

Base class for application errors:

```typescript
export class AppCustomError extends Error {
  public readonly code: number;
  public readonly statusCode: number;
  public readonly userResponse: UserErrorResponse;
  public readonly debug?: Record<string, unknown>;
}
```

### InternalDocumentParseError

For database-to-model mapping errors:

```typescript
import { InternalDocumentParseError } from "errors";

throw new InternalDocumentParseError({
  message: "Failed to parse user document",
  statusCode: 500,
  userResponse: {
    message: "An error occurred while processing your request"
  },
  debug: {
    document: rawData
  }
});
```

## Error Response Format

All errors return a consistent format:

```typescript
interface UserErrorResponse {
  message: string;
  details?: string[];  // For validation errors
}
```

Examples:

```json
// Validation Error (422)
{
  "message": "Validation failed.",
  "details": [
    "Email must be a valid email address",
    "Name is required"
  ]
}

// Not Found (404)
{
  "message": "Resource not found"
}

// Internal Server Error (500)
{
  "message": "Internal Server Error"
}
```

## Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400  | Bad Request | Invalid request format |
| 401  | Unauthorized | Authentication required |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource doesn't exist |
| 422  | Unprocessable Entity | Validation failed |
| 500  | Internal Server Error | Unexpected server error |

## Logging

The global error handler logs all errors:

```typescript
fastify.log.error({
  context: "GlobalErrorHandler",
  message: internalErrorMessage,
  statusCode,
  error,
});
```

Logs include:
- Error context and type
- Status code
- Full error details
- Request information

## Best Practices

1. **Use Custom Errors**: Throw `AppCustomError` for business logic errors
2. **Separate Internal/External**: Use `message` for logs, `userResponse` for clients
3. **Include Debug Info**: Add relevant context to `debug` field
4. **Don't Leak Details**: Never expose stack traces or sensitive data to clients
5. **Log Appropriately**: Log 5xx errors for investigation, not 4xx errors

## Example: Creating a Route with Error Handling

```typescript
import { AppCustomError } from "errors";
import { db, users, eq } from "database";

app.route({
  method: "GET",
  url: "/users/:id",
  schema: {
    params: z.object({
      id: z.string().uuid()
    }),
    response: {
      200: UserSchema
    }
  },
  handler: async (req, res) => {
    const { id } = req.params;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user[0]) {
      throw new AppCustomError({
        message: `User ${id} not found`,
        statusCode: 404,
        userResponse: {
          message: "User not found"
        },
        debug: { userId: id }
      });
    }

    return user[0];
  }
});
```

## Testing Error Handling

```typescript
it("should return 404 when user not found", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/users/non-existent-id"
  });

  expect(response.statusCode).toBe(404);
  expect(response.json()).toEqual({
    message: "User not found"
  });
});
```

## Resources

- [errors package documentation](../packages/errors.md)
- [service-contracts package documentation](../packages/service-contracts.md)
- [Fastify Error Handling](https://fastify.dev/docs/latest/Reference/Errors/)
