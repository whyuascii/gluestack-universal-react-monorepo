# API Documentation

The `apps/api` directory contains a **Fastify-based REST API** server with full TypeScript support and Zod validation.

## Overview

The API is built using:
- **Fastify**: Fast and low-overhead web framework for Node.js
- **Zod**: TypeScript-first schema declaration and validation
- **fastify-type-provider-zod**: Seamless integration between Fastify and Zod
- **Drizzle ORM**: Type-safe database access (see [database package](../packages/database.md))

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
│   │   ├── config.ts          # Environment configuration
│   │   ├── cors.ts            # CORS setup
│   │   ├── sensible.ts        # HTTP helpers
│   │   ├── swagger.ts         # API documentation
│   │   └── tests/             # Plugin tests
│   ├── routes/                 # API route handlers
│   │   ├── index.ts           # Route registration
│   │   ├── health.ts          # Health check endpoint
│   │   ├── swagger.ts         # Swagger UI route
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

- **Type-Safe Routes**: Zod schemas ensure request/response validation
- **Auto-Generated Docs**: Swagger/OpenAPI docs from Zod schemas
- **Global Error Handling**: Consistent error responses
- **Environment Configuration**: Type-safe env var management
- **Testing**: Unit and integration tests with Vitest

## Endpoints

### Health Check

```
GET /health
```

Returns server health status and environment info.

### Swagger Documentation

```
GET /documentation
GET /documentation/json
```

Interactive API documentation and OpenAPI spec.

## Next Steps

- [Error Handling](./error-handling.md)
- [Creating Routes](./creating-routes.md) (Coming Soon)
- [Testing](../guides/testing.md)
