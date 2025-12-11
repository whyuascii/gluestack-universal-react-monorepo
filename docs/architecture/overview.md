# Architecture Overview

This document provides a high-level overview of the system architecture for the gluestack Universal React Monorepo.

## System Architecture

The monorepo consists of three main applications that work together:

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend Layer                      │
├──────────────────────────┬──────────────────────────────┤
│                          │                               │
│    Web App (Next.js)     │   Mobile App (Expo)          │
│    Port: 3000            │   Port: 8081                  │
│                          │                               │
│    - App Router          │   - Expo Router               │
│    - Server Components   │   - Native Components         │
│    - React 19            │   - React Native              │
│                          │                               │
└──────────────────────────┴──────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
                         ▼
            ┌───────────────────────┐
            │   API Server          │
            │   (Fastify)           │
            │   Port: 3030          │
            │                       │
            │  - REST API           │
            │  - Better Auth        │
            │  - Zod Validation     │
            │  - Type-safe routes   │
            └───────────────────────┘
                         │
                         │ SQL
                         │
                         ▼
            ┌───────────────────────┐
            │   PostgreSQL          │
            │   Database            │
            │                       │
            │  - Tenant data        │
            │  - User data          │
            │  - Auth sessions      │
            └───────────────────────┘
```

## Request Flow

### 1. Client → API → Database

```
User Action (Web/Mobile)
    │
    ├─→ Auth Client (auth/client/react or auth/client/native)
    │       │
    │       └─→ API Request (Fetch/Axios)
    │               │
    │               └─→ Fastify API Server
    │                       │
    │                       ├─→ Route Handler
    │                       │       │
    │                       │       ├─→ Zod Validation
    │                       │       │
    │                       │       └─→ Drizzle ORM Query
    │                       │               │
    │                       │               └─→ PostgreSQL
    │                       │                       │
    │                       │                       └─→ Return Data
    │                       │                               │
    │                       └───────────────────────────────┘
    │                               │
    └───────────────────────────────┘
            │
            └─→ Update UI State
```

### 2. Authentication Flow

```
User Sign In/Up Request
    │
    ├─→ Client calls authClient.signIn.email() or authClient.signUp.email()
    │       │
    │       └─→ POST /api/v1/auth/signin or /api/v1/auth/signup
    │               │
    │               └─→ Better Auth API (app.betterAuth.api.signInEmail())
    │                       │
    │                       ├─→ Validate credentials
    │                       │
    │                       ├─→ Query database (users table)
    │                       │
    │                       ├─→ Generate session token
    │                       │
    │                       └─→ Store session in database
    │                               │
    │                               └─→ Return user + session token
    │                                       │
    └───────────────────────────────────────┘
            │
            └─→ Store token in client (cookies/local storage)
                    │
                    └─→ Include token in subsequent requests (Authorization header)
```

## Package Dependency Graph

```
Apps (web, mobile, api)
    │
    ├─→ auth (Better Auth config + clients)
    │     │
    │     └─→ database (Drizzle ORM + schemas)
    │
    ├─→ components (Gluestack UI + custom components)
    │     │
    │     └─→ (no dependencies)
    │
    ├─→ ui (screens, hooks, state, utils)
    │     │
    │     ├─→ components
    │     │
    │     └─→ utils
    │
    ├─→ database (Drizzle ORM + PostgreSQL)
    │     │
    │     └─→ (no dependencies - base layer)
    │
    ├─→ utils (date, validation, helpers)
    │     │
    │     └─→ (no dependencies)
    │
    ├─→ errors (error classes)
    │     │
    │     └─→ (no dependencies)
    │
    ├─→ service-contracts (shared types)
    │     │
    │     └─→ (no dependencies)
    │
    └─→ Shared configs (tailwind, typescript, eslint)
```

**Key Principles:**

1. **Bottom-up dependencies**: Base packages (database, utils, errors) have no dependencies
2. **No circular dependencies**: Package imports flow in one direction
3. **Workspace protocol**: Packages reference each other via `workspace:*`
4. **Type safety**: All packages use TypeScript with strict mode

## Technology Stack Summary

### Frontend

- **React 19** - UI library with concurrent rendering
- **Next.js 15** - Web framework with App Router
- **Expo 54** - React Native framework for mobile
- **Gluestack UI v3** - Cross-platform component library
- **NativeWind 4** - Tailwind CSS for React Native
- **React Native Web** - Web compatibility for React Native components

### Backend

- **Fastify** - Fast, low-overhead API server
- **Better Auth** - Authentication with email/password + OAuth
- **Drizzle ORM** - Type-safe SQL query builder
- **PostgreSQL** - Primary database
- **Zod** - Runtime validation and type inference
- **Pino** - Fast JSON logger

### Build & Tooling

- **Turborepo** - Monorepo build system with caching
- **pnpm** - Fast, efficient package manager
- **TypeScript** - Type safety across all packages
- **Vitest** - Fast unit test runner
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Monorepo Structure

The monorepo is organized into three main directories:

1. **apps/** - Deployable applications
   - `web` - Next.js web application
   - `mobile` - Expo mobile application
   - `api` - Fastify API server

2. **packages/** - Shared libraries
   - `auth` - Authentication package
   - `components` - UI components
   - `ui` - Business logic and screens
   - `database` - Database schemas and connection
   - `utils` - Utility functions
   - `errors` - Error handling
   - `service-contracts` - Type definitions
   - Config packages (tailwind, typescript, eslint)

3. **docs/** - Documentation
   - Architecture guides
   - API documentation
   - Package documentation
   - Development guides

## Key Features

### Code Sharing

The monorepo achieves **80%+ code sharing** between web and mobile through:

- Shared component library (`components`)
- Shared business logic (`ui`)
- Shared utilities (`utils`)
- Shared type definitions (`service-contracts`)
- Platform-specific code when needed (.web.tsx / .native.tsx)

### Type Safety

Type safety is enforced at every layer:

1. **Database → TypeScript** - Drizzle generates types from schema
2. **Database → Zod** - drizzle-zod generates validators from schema
3. **API → Client** - Shared service-contracts package
4. **Runtime validation** - Zod validates all API inputs/outputs

### Multi-Tenancy

The database is designed for multi-tenant SaaS applications:

- All tables include `tenant_id` column
- Data isolation at the database level
- Tenant context passed through authentication
- Cascading deletes for data cleanup

## Next Steps

- [Monorepo Structure](./monorepo-structure.md) - Detailed monorepo organization
- [Cross-Platform Strategy](./cross-platform.md) - How code sharing works
- [API Documentation](../api/README.md) - API server details
- [Package Documentation](../packages/README.md) - Individual package docs
