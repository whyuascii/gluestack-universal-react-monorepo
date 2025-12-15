# API Development Guides

Step-by-step guides for building and maintaining the Fastify API server.

## Available Guides

### [Creating Routes](./creating-routes.md)

Learn how to add new API endpoints with full type safety:

- Setting up route handlers
- Request/response validation with Zod
- Versioned API patterns
- Route organization

**Use this when:**

- Adding a new API endpoint
- Creating CRUD operations
- Building authenticated routes

### [Error Handling](./error-handling.md)

Implement consistent error responses:

- Structured error classes
- HTTP status code mapping
- Error logging and monitoring
- Client-friendly error messages

**Use this when:**

- Handling business logic errors
- Validating user input
- Dealing with external service failures
- Logging errors for debugging

### [Testing API Routes](./testing-api.md)

Write integration tests for your API:

- Setting up test database
- Request/response testing
- Authentication in tests
- Test data factories

**Use this when:**

- Adding new routes (write tests first!)
- Fixing bugs (reproduce with test)
- Refactoring routes (ensure nothing breaks)

## Quick Reference

### Common Tasks

**Add a new endpoint:**

1. Create service contract in `service-contracts`
2. Create route handler in `apps/api/src/routes/`
3. Add to route index
4. Write tests
5. Update API documentation

**Handle errors:**

```typescript
import { ApiError } from "errors";

throw new ApiError("Resource not found", 404);
```

**Validate request:**

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

// Automatic validation in route schema
```

## Related Documentation

- **[API Endpoints Reference](../../reference/api-endpoints/)** - Complete API specification
- **[Service Contracts Package](../../reference/packages/service-contracts.md)** - Shared types and schemas
- **[Error Handling Package](../../reference/packages/errors.md)** - Error class reference
