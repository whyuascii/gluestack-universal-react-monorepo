# Packages Documentation

This directory contains documentation for all shared packages in the monorepo.

## Package Overview

### Core Packages

- **[components](./components.md)** - Cross-platform UI components built with Gluestack UI v3
- **[ui](./ui.md)** - Shared UI logic, screens, hooks, and state management
- **[database](./database.md)** - Drizzle ORM schemas, types, and database connection

### Utility Packages

- **[errors](./errors.md)** - Application-specific error classes
- **[service-contracts](./service-contracts.md)** - Shared type definitions and contracts
- **[utils](./utils.md)** - Utility functions and helpers

### Configuration Packages

- **[tailwind-config](./tailwind-config.md)** - Shared Tailwind CSS configuration
- **[typescript-config](./typescript-config.md)** - Shared TypeScript configurations

## Package Structure

All packages follow a consistent structure:

```
packages/<package-name>/
├── src/
│   ├── index.ts          # Main entry point
│   └── ...               # Package source files
├── package.json
├── tsconfig.json
└── README.md
```

## Using Packages

Packages are consumed using workspace dependencies:

```json
{
  "dependencies": {
    "components": "workspace:*",
    "ui": "workspace:*",
    "database": "workspace:*"
  }
}
```

Import from packages like any npm package:

```typescript
import { Button } from "components";
import { useAuth } from "ui";
import { db, users } from "database";
```

## Creating a New Package

See the [Monorepo Best Practices](../guides/monorepo-best-practices.md) guide for instructions on creating new packages.
