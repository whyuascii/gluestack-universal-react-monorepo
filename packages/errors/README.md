# Errors

This package contains a set of error classes that can be used to throw errors in a consistent way across the application. All errors extend from `AppCustomError` and provide both developer-facing and user-facing messages.

## Architecture

The error system is designed to separate concerns:

- **Internal Messages**: Developer-facing error messages for logs and debugging
- **User Responses**: Safe, structured messages returned to end-users via APIs
- **Debug Context**: Internal metadata (user IDs, request data) for troubleshooting
- **HTTP Status Codes**: Consistent mapping to standard HTTP status codes

## Error Classes

### Base Error

**`AppCustomError`** - Base class that all application errors extend from.

```typescript
import { AppCustomError } from "errors";

throw new AppCustomError({
  message: "Developer message for logs",
  statusCode: 500,
  userResponse: {
    message: "User-friendly message",
    details: ["Optional array of details"],
    meta: { key: "Optional metadata" },
  },
  debug: { userId: "123", requestId: "abc" },
});
```

### Generic HTTP Errors (`generic.ts`)

Standard HTTP error classes with sensible defaults:

- **`NotFoundError`** (404) - Resource not found
- **`BadRequestError`** (400) - Invalid request data
- **`UnauthorizedError`** (401) - Authentication required
- **`ForbiddenError`** (403) - Insufficient permissions
- **`ConflictError`** (409) - Resource conflict
- **`UnprocessableEntityError`** (422) - Validation failed
- **`PermissionsError`** (403) - Permission denied
- **`DataFetchError`** (500) - Data retrieval failed
- **`InternalServerError`** (500) - Generic server error

```typescript
import { NotFoundError, BadRequestError } from "errors";

// With defaults
throw new NotFoundError();

// With custom messages
throw new NotFoundError(
  "User with ID 123 not found",
  { message: "The requested user does not exist." },
  { userId: "123", requestedBy: "admin" }
);
```

### Database Errors (`db.ts`)

Errors specific to database operations:

- **`InternalDocumentParseError`** (500) - Document parsing failed
- **`DocumentIsDeletedError`** (404) - Document is soft-deleted
- **`DbAndModelOutOfSyncError`** (500) - Schema mismatch
- **`UndefinedDocumentError`** (500) - Document is undefined
- **`DatabaseError`** (500) - Generic database error

```typescript
import { DocumentIsDeletedError, DatabaseError } from "errors";

throw new DocumentIsDeletedError(
  "Document 456 is marked as deleted",
  { message: "This item is no longer available." },
  { documentId: "456" }
);
```

### AWS Errors (`aws.ts`)

Errors for AWS service interactions:

- **`LambdaInvocationError`** (500) - Lambda invocation failed
- **`SecretManagerError`** (404) - Secret not found in AWS Secrets Manager

```typescript
import { LambdaInvocationError } from "errors";

throw new LambdaInvocationError(
  "Failed to invoke process-payment lambda",
  { message: "Payment processing is temporarily unavailable." },
  { functionName: "process-payment", requestId: "xyz" }
);
```

## Usage Patterns

### In API Routes/Controllers

```typescript
import { NotFoundError, BadRequestError } from "errors";

export async function getUser(userId: string) {
  if (!userId) {
    throw new BadRequestError("Missing userId parameter", { message: "User ID is required." });
  }

  const user = await db.users.findById(userId);

  if (!user) {
    throw new NotFoundError(
      `User ${userId} not found`,
      { message: "The requested user does not exist." },
      { userId }
    );
  }

  return user;
}
```

### In Error Handling Middleware

```typescript
import { AppCustomError } from "errors";

export function errorHandler(error: unknown, req, res, next) {
  // Check if it's one of our custom errors
  if (error instanceof AppCustomError) {
    // Log the internal message and debug context
    console.error({
      message: error.message,
      code: error.code,
      debug: error.debug,
      stack: error.stack,
    });

    // Return the user-safe response
    return res.status(error.statusCode).json(error.userResponse);
  }

  // Handle unexpected errors
  console.error("Unexpected error:", error);
  return res.status(500).json({
    message: "An unexpected error occurred.",
  });
}
```

### With Validation Errors

```typescript
import { UnprocessableEntityError } from "errors";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export function createUser(data: unknown) {
  const result = UserSchema.safeParse(data);

  if (!result.success) {
    throw new UnprocessableEntityError(
      "User validation failed",
      {
        message: "Invalid user data provided.",
        details: result.error.errors.map((e) => e.message),
        meta: {
          fields: result.error.errors.map((e) => e.path.join(".")),
        },
      },
      { input: data }
    );
  }

  return result.data;
}
```

## Best Practices

### Do's

✓ **Use specific error classes** - Choose the most appropriate error type for the situation
✓ **Provide context in debug** - Include request IDs, user IDs, and other debugging info
✓ **Write clear user messages** - Keep user-facing messages simple and actionable
✓ **Include developer context** - The internal message should help with debugging
✓ **Log errors properly** - Use the debug field for structured logging

### Don'ts

✗ **Don't expose internal details** - Never include stack traces or internal IDs in user responses
✗ **Don't use generic errors everywhere** - Create specific error classes when needed
✗ **Don't skip the debug field** - Always include context for troubleshooting
✗ **Don't duplicate information** - The user message and internal message serve different purposes
✗ **Don't throw raw Error objects** - Always use AppCustomError or its subclasses

## Adding New Error Classes

When adding new error types:

1. Determine the appropriate file (`generic.ts`, `db.ts`, `aws.ts`, or create a new category)
2. Extend `AppCustomError`
3. Choose the correct HTTP status code
4. Provide sensible default messages
5. Export from `index.ts`

```typescript
// In src/payment.ts
import { AppCustomError } from "./base";
import { UserErrorResponse } from "@app/service-contracts";

export class PaymentFailedError extends AppCustomError {
  constructor(
    message = "Payment processing failed",
    userResponse: UserErrorResponse = {
      message: "Your payment could not be processed. Please try again.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 402,
      userResponse,
      debug,
    });
  }
}
```

Then export from `index.ts`:

```typescript
export * from "./payment";
```

## Integration with Service Contracts

All errors use the `UserErrorResponse` type from the `service-contracts` package, ensuring consistency across the application:

```typescript
interface UserErrorResponse {
  message: string;
  details?: string[];
  meta?: Record<string, string>;
}
```

This standardized response format makes it easy for frontends to handle errors consistently.
