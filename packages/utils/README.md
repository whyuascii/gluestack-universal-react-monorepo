# Utils

This package contains utility functions that do not have backend nor frontend dependencies and can be used in both frontend and backend environments. It was created to provide a shared set of utilities that can be used across different parts of the application without introducing unnecessary dependencies.

**Note:** This package is for isomorphic utilities only - code that works the same in browser and Node.js environments.

## When should you add a function to this package?

- The function is used across multiple workspaces.
    - If the function is only used in one workspace, keep it in the utils directory of that workspace.
    - Avoid prematurely adding functions to this package based on anticipated future use. This can lead to stale code.
- The function does not have any backend-specific dependencies.
- The function is not frontend-specific.
- The function can be used in both frontend and backend environments.

## Current Utilities

### TypeScript Utilities (`typescript-utils/`)

TypeScript utility types and type guards for common patterns:

- **Type Manipulation**: `PartiallyOptional`, `PartiallyRequired`, `PartiallyNullable`, `RemoveNullable`
- **Type Guards**: Runtime type checking utilities
- **Nested Keys**: `NestedKeyOf` for generating type-safe nested object paths

### Zod Utilities (`zod/`)

Validation and transformation helpers for Zod schemas:

- **Date Transforms**: `transformDate`, `transformNullishDate`, `transformDateToUTC`
- **Boolean Transforms**: `transformToBoolean` - Parse string booleans ("true"/"false")
- **String Transforms**: `transformEmptyStringToNull`
- **Array Helpers**: `transformStringToArray` - Convert single values to arrays
- **Sort Parsing**: `sortStringSchema` - Parse sort strings like "asc(fieldName),desc(otherField)"
- **Error Formatting**: `transformValidationErrorMessages` - Format Zod errors for display

### URL Utilities (`url-utils/`)

URL building utilities for the application:

- **Domain Building**: `buildDomainUrl` - Build domain URLs based on environment
- **URL Building**: `buildUrl` - Build complete URLs with protocol and paths

## What Should Be in a Utils Package

- **Utility Functions**: Generic, reusable functions (e.g., string manipulation, date utilities, array/object manipulation, math functions)
- **Configuration Utilities**: Environment variable validation, configuration file parsing
- **Validation Utilities**: Shared validation methods (e.g., regex patterns, Zod schemas, but not DTO models)
- **Type Utilities**: Shared TypeScript utility types and type guards
- **Transform Functions**: Data transformation utilities that work across environments

## What Should Not Be in a Utils Package

- Workspace-specific code
- Standalone type definitions (use `service-contracts` or `types` packages)
- Error classes (use `errors` package)
- Business logic
- Database models and schemas (use `database` package)
- API client code
- Component code
- Routing logic
- State management

## Usage Examples

### Zod Validation

```typescript
import { z } from "zod";
import { transformDate, sortStringSchema } from "utils";

// Date transformation
const schema = z.object({
  createdAt: transformDate,
  sort: sortStringSchema.optional(),
});

// Parse input
const result = schema.parse({
  createdAt: "2024-01-01",
  sort: "asc(name),desc(createdAt)",
});
```

### TypeScript Type Utilities

```typescript
import type { PartiallyOptional, NestedKeyOf } from "utils";

interface User {
  id: string;
  name: string;
  email: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
}

// Make some fields optional
type UserInput = PartiallyOptional<User, "id" | "settings">;

// Generate nested keys
type UserKeys = NestedKeyOf<User, "settings">;
// Result: "id" | "name" | "email" | "settings" | "settings.theme" | "settings.notifications"
```

### URL Building

```typescript
import { buildUrl } from "utils";

const apiUrl = buildUrl({
  environmentStage: "production",
  subdomain: "api",
  path: "/users",
});
// Result: "https://api.demo-app.com/users"
```

## Adding New Utilities

When adding new utilities to this package:

1. Create a new directory under `src/` for the category (e.g., `string-utils/`, `array-utils/`)
2. Add an `index.ts` file that exports all utilities in that category
3. Export from the main `src/index.ts` file
4. Add unit tests in a `.test.ts` or `.unit.test.ts` file
5. Update this README with the new utilities and usage examples
6. Ensure the utility has no platform-specific dependencies
