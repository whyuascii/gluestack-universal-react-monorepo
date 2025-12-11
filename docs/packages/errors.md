# Errors Package

The `packages/errors` package contains application-specific error classes for consistent error handling across the monorepo.

## Overview

This package provides:

- **Custom Error Classes**: Structured errors with status codes and user responses
- **Type Safety**: Full TypeScript support
- **Debug Information**: Internal context for troubleshooting
- **User-Friendly Messages**: Separate internal/external error messages

## Installation

```json
{
  "dependencies": {
    "errors": "workspace:*"
  }
}
```

## Error Classes

### AppCustomError

Base class for all application errors:

```typescript
import { AppCustomError } from "errors";

throw new AppCustomError({
  message: "Internal error message for logs",
  statusCode: 400,
  userResponse: {
    message: "User-friendly error message",
  },
  debug: {
    userId: "123",
    action: "updateProfile",
  },
});
```

**Properties:**

- `message` (string): Internal error message for logging
- `statusCode` (number): HTTP status code
- `code` (number): Same as statusCode, for compatibility
- `userResponse` (UserErrorResponse): Safe message for clients
- `debug` (object, optional): Internal-only debugging context

### InternalDocumentParseError

For database-to-model mapping errors:

```typescript
import { InternalDocumentParseError } from "errors";

throw new InternalDocumentParseError({
  message: "Failed to parse database record",
  statusCode: 500,
  userResponse: {
    message: "An error occurred processing your request",
  },
  debug: {
    table: "users",
    recordId: userId,
  },
});
```

### Specialized Errors

The package also exports specialized error classes:

```typescript
// Database-related errors
import { DbAndModelOutOfSyncError, UndefinedDocumentError } from "errors";

// AWS-related errors
import {
  AwsError,
  // ... other AWS errors
} from "errors";

// Generic errors
import { GenericError } from "errors";
```

## Usage in API Routes

```typescript
import type { FastifyInstance } from "fastify";
import { AppCustomError } from "errors";
import { db, users, eq } from "database";

app.route({
  method: "DELETE",
  url: "/users/:id",
  handler: async (req, res) => {
    const { id } = req.params;

    const result = await db.delete(users).where(eq(users.id, id)).returning();

    if (!result[0]) {
      throw new AppCustomError({
        message: `User ${id} not found for deletion`,
        statusCode: 404,
        userResponse: {
          message: "User not found",
        },
        debug: {
          userId: id,
          tenantId: req.user.tenantId,
        },
      });
    }

    return { success: true };
  },
});
```

## Usage in Services

```typescript
import { AppCustomError } from "errors";

export async function processPayment(amount: number) {
  if (amount <= 0) {
    throw new AppCustomError({
      message: `Invalid payment amount: ${amount}`,
      statusCode: 400,
      userResponse: {
        message: "Payment amount must be greater than zero",
      },
      debug: { amount },
    });
  }

  // Process payment...
}
```

## Error Response Format

All errors use the `UserErrorResponse` type from `service-contracts`:

```typescript
interface UserErrorResponse {
  message: string;
  details?: string[]; // Optional array of detailed error messages
}
```

## Best Practices

1. **Always Separate Internal/External Messages**
   - Use `message` for logs and debugging
   - Use `userResponse.message` for client-facing messages

2. **Include Debug Context**
   - Add relevant IDs, parameters, and state
   - Never include sensitive data (passwords, tokens)

3. **Use Appropriate Status Codes**
   - 400: Bad Request
   - 404: Not Found
   - 422: Validation Failed
   - 500: Internal Server Error

4. **Don't Leak Implementation Details**
   - External messages should be generic
   - Internal messages can be specific

5. **Catch and Re-throw When Needed**
   ```typescript
   try {
     await externalService.call();
   } catch (error) {
     throw new AppCustomError({
       message: `External service failed: ${error.message}`,
       statusCode: 500,
       userResponse: {
         message: "Service temporarily unavailable",
       },
       debug: { originalError: error },
     });
   }
   ```

## Testing Errors

```typescript
import { AppCustomError } from "errors";

describe("User Service", () => {
  it("should throw AppCustomError when user not found", async () => {
    await expect(getUserById("non-existent-id")).rejects.toThrow(AppCustomError);
  });

  it("should return 404 status code", async () => {
    try {
      await getUserById("non-existent-id");
    } catch (error) {
      expect(error).toBeInstanceOf(AppCustomError);
      expect(error.statusCode).toBe(404);
      expect(error.userResponse.message).toBe("User not found");
    }
  });
});
```

## Resources

- [API Error Handling](../api/error-handling.md)
- [Service Contracts](./service-contracts.md)
- [Error Handling in TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-instanceof-narrowing)
