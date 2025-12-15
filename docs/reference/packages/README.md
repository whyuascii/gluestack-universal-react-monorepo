# Package Reference

API reference documentation for all shared packages in the monorepo.

## Core Packages

### [Auth](./auth.md)

Better Auth integration with platform-specific clients.

**Key exports:**

- `auth` - Server auth instance
- `createAuthClient()` - Web client factory
- `createAuthClient()` - Mobile client factory (different implementation)
- Auth hooks and utilities

**Use for:**

- Authentication setup
- User session management
- OAuth integration

### [Database](./database.md)

Drizzle ORM schemas, connection, and type-safe queries.

**Key exports:**

- `db` - Database connection
- Schema tables (`users`, `tenants`, etc.)
- Zod validators (`insertUserSchema`, etc.)
- Type definitions

**Use for:**

- Database queries
- Schema definitions
- Type-safe operations

### [Components](./components.md)

Cross-platform UI component library (Gluestack UI v3 + custom).

**Key exports:**

- Core components (`View`, `Text`, `Button`, etc.)
- Form components (`Input`, `Checkbox`, etc.)
- Layout components (`Stack`, `Grid`, etc.)
- 50+ components

**Use for:**

- Building UI
- Cross-platform components
- Consistent design system

### [UI](./ui.md)

Business logic layer with screens, hooks, and state management.

**Key exports:**

- Screens (`LoginScreen`, `DashboardScreen`, etc.)
- Hooks (`useAuth`, `useSubscription`, etc.)
- RevenueCat integration
- State management utilities

**Use for:**

- Reusable screens
- Business logic hooks
- Subscription features

### [Analytics](./analytics.md)

PostHog analytics and error tracking.

**Key exports:**

- `analytics` - Event tracking instance
- `ErrorBoundary` - React error boundary
- Platform-specific providers

**Use for:**

- Event tracking
- User identification
- Error monitoring
- Feature flags

### [i18n](./i18n.md)

Internationalization with i18next (English + Spanish).

**Key exports:**

- `useTranslation()` - Translation hook
- Platform-specific configurations
- Translation files

**Use for:**

- Multi-language support
- Text translation
- Language switching
- Localization

## Utility Packages

### [Utils](./utils.md)

Pure utility functions for common operations.

**Key exports:**

- Date/time utilities
- Validation helpers
- String manipulation
- Array operations
- Type guards

**Use for:**

- Date formatting
- Data validation
- Common operations

### [Errors](./errors.md)

Structured error classes for consistent error handling.

**Key exports:**

- `ApiError` - API-specific errors
- `ValidationError` - Input validation errors
- `DatabaseError` - Database operation errors
- Error utilities

**Use for:**

- Throwing structured errors
- Error handling
- Error logging

### [Service Contracts](./service-contracts.md)

Shared TypeScript types and Zod schemas.

**Key exports:**

- Request/response types
- Shared DTOs
- API contracts
- Validation schemas

**Use for:**

- Type checking
- API contracts
- Request validation

## Configuration Packages

These packages export configurations, not runtime code:

- **tailwind-config** - Shared Tailwind theme
- **typescript-config** - Shared TypeScript configs
- **eslint-config** - Shared ESLint rules

See individual package `README.md` files for configuration details.

---

## Package Organization

### Dependency Layers

Packages are organized in layers to prevent circular dependencies:

```
Layer 1 (Config):
  - typescript-config
  - eslint-config
  - tailwind-config

Layer 2 (Foundation):
  - errors
  - service-contracts
  - utils

Layer 3 (Infrastructure):
  - database
  - auth

Layer 4 (UI):
  - components
  - ui

Layer 5 (Apps):
  - web
  - mobile
  - api
```

**Rules:**

- Higher layers can depend on lower layers
- Same layer packages cannot depend on each other
- No circular dependencies

### Import Patterns

```typescript
// ✅ Good: Import from package
import { Button } from "components";
import { db } from "database";
import { ApiError } from "errors";

// ❌ Bad: Import from nested paths
import { Button } from "components/src/button";

// ❌ Bad: Import from higher layer
// database cannot import from auth
```

---

## Related Documentation

- **[Guides](../../guides/)** - How to use packages in practice
- **[Concepts](../../concepts/)** - Package organization and architecture
- **[Monorepo Structure](../../concepts/monorepo-structure.md)** - Dependency rules
