# API Documentation

The `apps/api` directory contains a **Fastify-based REST API** server with full TypeScript support and Zod validation.

## Overview

The API is built using:

- **Fastify**: Fast and low-overhead web framework for Node.js
- **Better Auth**: Authentication with email/password and OAuth support
- **Zod**: TypeScript-first schema declaration and validation
- **fastify-type-provider-zod**: Seamless integration between Fastify and Zod
- **Drizzle ORM**: Type-safe database access (see [database package](../packages/database.md))
- **PostgreSQL**: Primary database

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm --filter api dev

# Run type checking
pnpm --filter api typecheck

# Run tests
pnpm --filter api test

# Build for production
pnpm --filter api build

# Start production server
pnpm --filter api start
```

## Directory Structure

```
apps/api/
├── src/
│   ├── app.ts                  # Fastify app setup
│   ├── index.ts                # Server entry point
│   ├── @types/                 # TypeScript type definitions
│   │   └── fastify.d.ts       # Fastify augmentations
│   ├── plugins/                # Fastify plugins
│   │   ├── auth.ts            # Better Auth integration
│   │   ├── config.ts          # Environment configuration
│   │   ├── cors.ts            # CORS setup
│   │   ├── sensible.ts        # HTTP helpers
│   │   ├── swagger.ts         # API documentation
│   │   └── tests/             # Plugin tests
│   ├── routes/                 # API route handlers
│   │   ├── index.ts           # Route registration
│   │   ├── health.ts          # Health check endpoint
│   │   ├── swagger.ts         # Swagger UI route
│   │   ├── versions.ts        # API version info
│   │   ├── auth.ts            # Authentication routes
│   │   ├── users.ts           # User management routes
│   │   ├── me.ts              # Current user routes
│   │   └── tests/             # Route tests
│   ├── utils/                  # Utility functions
│   │   ├── error-handling.ts  # Global error handler
│   │   ├── logging-handling.ts# Logging utilities
│   │   └── format-date-field.ts# Date formatting
│   └── tests/                  # Shared test utilities
│       └── stubEnvSetup.ts    # Test env stubbing
├── .swcrc                      # SWC compiler config
├── package.json
├── tsconfig.json
└── vitest.config.ts           # Test configuration
```

## Key Features

- **Authentication**: Better Auth with email/password and OAuth providers
- **Type-Safe Routes**: Zod schemas ensure request/response validation
- **Auto-Generated Docs**: Swagger/OpenAPI docs from Zod schemas
- **Global Error Handling**: Consistent error responses with error package
- **Environment Configuration**: Type-safe env var management
- **Database Integration**: Drizzle ORM with PostgreSQL
- **Testing**: Unit and integration tests with Vitest
- **Logging**: Structured logging with Pino

## Endpoints

All endpoints are versioned and prefixed with `/api/v1` unless otherwise noted.

### Health & Documentation

```
GET  /health              # Health check
GET  /api/versions        # API version information
GET  /documentation       # Swagger UI
GET  /documentation/json  # OpenAPI spec
```

### Authentication

```
POST /api/v1/auth/signup   # Register new user
POST /api/v1/auth/signin   # Sign in with email/password
POST /api/v1/auth/signout  # Sign out (requires auth)
```

### User Management

```
GET  /api/v1/me            # Get current user (requires auth)
GET  /api/v1/users         # List users (requires auth)
POST /api/v1/users         # Create user (requires auth)
GET  /api/v1/users/:id     # Get user by ID (requires auth)
PUT  /api/v1/users/:id     # Update user (requires auth)
DELETE /api/v1/users/:id   # Delete user (requires auth)
```

See [routes.md](./routes.md) for detailed API documentation with request/response examples.

## Configuration

The API server can be configured via environment variables:

```bash
# Server
PORT=3030
HOST=0.0.0.0
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3030
```

## Authentication

The API uses **Better Auth** for authentication. It's integrated via the `plugins/auth.ts` plugin:

```typescript
// Registers Better Auth with Fastify
import { auth } from "auth";

app.decorate("betterAuth", auth);
app.decorate("verifyAuth", async (request, reply) => {
  // Verify JWT token from Authorization header
});
```

Protected routes use the `verifyAuth` pre-handler:

```typescript
app.route({
  method: "GET",
  url: "/api/v1/me",
  preHandler: [app.verifyAuth],
  handler: async (request, reply) => {
    return request.user;
  },
});
```

See [Authentication Package](../packages/auth.md) for more details.

## Next Steps

- [API Routes Documentation](./routes.md)
- [Error Handling](./error-handling.md)
- [Testing Guide](./testing.md)
- [Route Implementation Guide](./route-implementation.md)
