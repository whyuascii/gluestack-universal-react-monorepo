# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a cross-platform React monorepo using Turborepo, pnpm workspaces, Next.js (web), and Expo (mobile). The codebase enables maximum code sharing between web and mobile platforms using gluestack-v3 UI primitives and NativeWind (Tailwind CSS for React Native).

## Package Manager & Commands

**Package Manager:** pnpm (v10.15.0)

### Root-level Commands

```bash
pnpm dev              # Start all apps in development (web + mobile)
pnpm build            # Build all apps for production
pnpm lint             # Lint all workspaces
pnpm check-types      # TypeScript type checking across all packages
```

### Working with Specific Packages

```bash
# Run commands in specific packages
pnpm --filter web dev              # Next.js web app
pnpm --filter mobile dev           # Expo mobile app
pnpm --filter components <command> # Component library (gluestack primitives)
pnpm --filter ui <command>         # UI package (screens, hooks, state, utils)
pnpm --filter database <command>   # Database package

# Database-specific commands
pnpm --filter database generate    # Generate migrations from schema
pnpm --filter database db:migrate  # Apply migrations to database
pnpm --filter database db:studio   # Open Drizzle Studio GUI
pnpm --filter database db:seed     # Seed initial data

# Mobile platform-specific (run from apps/mobile/)
cd apps/mobile
pnpm ios              # iOS simulator
pnpm android          # Android emulator
pnpm web              # Web browser (Expo web)
```

### Testing Individual Components

When developing or testing specific components, you can:

- For web: Run `pnpm --filter web dev` and navigate to the component in the browser
- For mobile: Run `pnpm --filter mobile dev` and test on iOS/Android/web platforms

## Repository Structure

```
/
├── apps/
│   ├── mobile/               # Expo React Native app
│   │   ├── src/app/          # Expo Router file-based routing
│   │   │   ├── (tabs)/       # Tab-based navigation
│   │   │   └── _layout.tsx   # Root layout with providers
│   │   ├── global.css        # Global Tailwind styles
│   │   └── tailwind.config.js
│   │
│   └── web/                  # Next.js web app
│       ├── src/app/          # Next.js App Router
│       │   ├── layout.tsx    # Root layout with providers
│       │   ├── page.tsx      # Home page
│       │   └── registry.tsx  # Styled-jsx registry for gluestack
│       ├── globals.css       # Global Tailwind styles
│       ├── next.config.ts    # Next.js config with gluestack adapter
│       └── tailwind.config.js
│
├── packages/
│   ├── components/           # Shared component library (gluestack-v3 + custom)
│   │   ├── src/              # 50+ cross-platform components
│   │   └── index.ts          # Component exports
│   │
│   ├── ui/                   # Shared UI logic package
│   │   ├── src/
│   │   │   ├── home/         # Screen implementations
│   │   │   ├── auth/         # Auth screens
│   │   │   ├── hooks/        # Shared React hooks
│   │   │   ├── store/        # State management (Zustand/etc)
│   │   │   └── utils/        # Utility functions
│   │   └── index.ts          # Package exports
│   │
│   ├── database/             # Shared database package (Drizzle ORM + PostgreSQL)
│   │   ├── src/
│   │   │   ├── schema/       # Drizzle table schemas with Zod validators
│   │   │   ├── db.ts         # Database connection singleton
│   │   │   └── index.ts      # Package exports
│   │   ├── drizzle/          # Generated migration files
│   │   ├── scripts/          # Seed and migration scripts
│   │   └── drizzle.config.ts # Drizzle Kit configuration
│   │
│   ├── tailwind-config/      # Shared Tailwind configuration
│   │   ├── index.js          # Factory function for Tailwind config
│   │   └── package.json      # Package definition
│   │
│   ├── typescript-config/    # Shared TypeScript configuration
│   │   ├── base.json         # Core compiler options
│   │   ├── nextjs.json       # Next.js-specific settings
│   │   ├── expo.json         # Expo/React Native settings
│   │   └── package.json      # Package definition
│   │
│   ├── errors/               # Shared error handling
│   └── service-contracts/    # Shared type definitions/interfaces
│
├── turbo.json                # Turborepo pipeline configuration
└── pnpm-workspace.yaml       # pnpm workspace configuration
```

## Architecture & Key Concepts

### Cross-Platform Strategy

This monorepo achieves web/mobile code sharing through:

1. **Shared Components (`packages/components`)**: gluestack-v3 primitives + custom components that work on both web and native
2. **Shared UI Logic (`packages/ui`)**: Screens, hooks, state management, and utilities used by both apps
3. **Shared Database (`packages/database`)**: Database schemas, types, and connection shared across backend services
4. **Shared Tailwind Config (`packages/tailwind-config`)**: Centralized theme configuration ensuring visual consistency
5. **Shared TypeScript Config (`packages/typescript-config`)**: Platform-specific TypeScript configurations (Next.js vs Expo)
6. **NativeWind**: Enables Tailwind CSS classes on React Native (both apps use identical theme)
7. **React Native Web**: Transpiles React Native components to web (configured in `next.config.ts`)

### Database Package (`packages/database`)

**Architecture:**

The database package uses **Drizzle ORM** with **PostgreSQL** and provides type-safe database schemas with automatic **Zod** validation. It's designed for multitenant SaaS applications using a shared tables approach (tenant_id column).

**Key Features:**

1. **Drizzle ORM**: Type-safe SQL query builder with excellent TypeScript inference
2. **drizzle-zod**: Automatically generates Zod schemas from Drizzle table definitions
3. **Single source of truth**: Database schema → Zod validators → TypeScript types
4. **Multitenant ready**: All tables include `tenant_id` for data isolation
5. **Shared package**: Used by API server, lambdas, scripts, and future backend services

**Schema Organization:**

Each table is defined in its own file under `src/schema/`:

```typescript
// Example: packages/database/src/schema/users.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auto-generated Zod schemas with custom validations
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address").max(255),
  name: z.string().min(1).max(255).optional(),
  tenantId: z.string().uuid("Invalid tenant ID"),
});

export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = insertUserSchema.partial().omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types derived from Zod schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
```

**What the package exports:**

```typescript
// Import in your API server or lambdas
import {
  db, // Database connection instance
  users, // Table schema
  tenants, // Table schema
  insertUserSchema, // Zod validator for inserts
  selectUserSchema, // Zod validator for selects
  updateUserSchema, // Zod validator for updates
  type User, // TypeScript type
  type InsertUser, // TypeScript type
  eq,
  and,
  or,
  sql, // Drizzle query utilities
} from "database";

// Validate input with Zod
const result = insertUserSchema.safeParse(input);
if (!result.success) {
  // Handle validation errors
}

// Query with type-safe Drizzle
const allUsers = await db.select().from(users).where(eq(users.tenantId, tenantId));
```

**Environment Variables:**

The database package requires a `DATABASE_URL` environment variable:

```bash
# .env (at package or app level)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

**Intended Usage:**

- **API Server** (`apps/api`): Main consumer, handles all database operations
- **Lambdas/Serverless Functions**: Import for event-driven database operations
- **Scripts**: Migration, seeding, data maintenance scripts
- **Future Services**: Any backend service needing database access

Frontend apps (web/mobile) should **NEVER** import the database package directly - they call the API instead.

### Package Dependencies

- **pnpm overrides** (root `package.json`): Enforces consistent versions across the monorepo
  - React 19.1.0
  - React Native 0.81.4
  - React Native Web 0.21.1
  - Tailwind CSS 3.4.17
  - NativeWind 4.2.1

- **Workspace dependencies**: Packages reference each other via `workspace:*` protocol
  - Both apps depend on `components` and `ui` packages
  - `ui` package depends on `components` package

### Next.js Configuration

The web app's `next.config.ts` includes critical setup:

1. **`withGluestackUI` adapter**: Enables gluestack components on web
2. **`transpilePackages`**: Transpiles workspace packages and React Native libraries
3. **Webpack alias**: Maps `react-native` → `react-native-web`
4. **File extensions**: Prioritizes `.web.*` files for web-specific implementations

### Expo Configuration

The mobile app uses:

1. **Expo Router**: File-based routing (similar to Next.js)
2. **Expo SDK 54**: Latest stable version
3. **File-based navigation**: Screens in `src/app/(tabs)/` directory

### Styling System

**Shared Tailwind Configuration (`packages/tailwind-config`):**

The monorepo uses a centralized Tailwind configuration package that ensures styling consistency across all platforms. The configuration is exported as a factory function that both apps consume.

**How it works:**

```javascript
// packages/tailwind-config/index.js
module.exports = function createTailwindConfig(options = {}) {
  const { content = [], important } = options;

  return {
    // Shared package paths automatically included
    content: [
      "../../packages/components/src/**/*.{js,jsx,ts,tsx}",
      "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
      ...content, // App-specific paths
    ],
    // Full theme configuration...
  };
};
```

Apps consume the shared config:

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{html,js,jsx,ts,tsx,mdx}"],
  important: "html", // Web-specific setting
});
```

**Theme features:**

- **CSS Variables**: Custom color system using RGB CSS variables
  - `primary-*`, `secondary-*`, `error-*`, `success-*`, `warning-*`, `info-*`
  - `typography-*`, `outline-*`, `background-*`, `indicator-*`
  - All colors have shades from 0-950

- **Dark Mode**: Controlled via `DARK_MODE` environment variable (defaults to `"class"`)
- **Safelist**: Ensures all semantic color classes are included in builds
- **Font Families**: Defined but fonts loaded differently per platform
- **Custom Shadows**: `hard-*` and `soft-*` shadow utilities (1-5 variants)

**Benefits:**

- Single source of truth for theme (colors, fonts, shadows, etc.)
- Theme changes propagate automatically to both platforms
- Apps can't accidentally exclude shared package paths
- Platform-specific overrides still possible via the factory options

### Provider Setup

Both apps wrap their content with the same providers (in the same order):

```tsx
<GluestackUIProvider mode="light">
  <SafeAreaProvider>{/* App content */}</SafeAreaProvider>
</GluestackUIProvider>
```

For web, an additional `StyledJsxRegistry` wraps everything for Next.js 15 compatibility.

## Development Workflow

### Adding New Components to Components Package

1. Create component directory in `packages/components/src/<component-name>/`
2. Export from `packages/components/src/index.ts`
3. Component will be automatically available in both apps via `import { Component } from "components"`

### Creating Shared Screens and UI Logic

**For screens:**

1. Add screen to `packages/ui/src/<feature>/`
2. Export from `packages/ui/src/index.ts`
3. Import in app-specific routing:
   - Web: `apps/web/src/app/` (Next.js App Router)
   - Mobile: `apps/mobile/src/app/` (Expo Router)

**For hooks:**

1. Add hook to `packages/ui/src/hooks/<hook-name>.ts`
2. Export from `packages/ui/src/index.ts`
3. Import via `import { useHookName } from "ui"`

**For state management:**

1. Add stores to `packages/ui/src/store/<store-name>.ts`
2. Export from `packages/ui/src/index.ts`
3. Import via `import { useStore } from "ui"`

**For utilities:**

1. Add utilities to `packages/ui/src/utils/<util-name>.ts`
2. Export from `packages/ui/src/index.ts`
3. Import via `import { utilityFunction } from "ui"`

### Working with the Database Package

**Adding new tables:**

1. Create a new schema file in `packages/database/src/schema/<table-name>.ts`
2. Define the Drizzle table with all columns
3. Create Zod schemas using `createInsertSchema` and `createSelectSchema`
4. Add custom Zod validations in the second parameter
5. Export insert, select, and update schemas
6. Export TypeScript types using `z.infer<typeof schema>`
7. Export from `packages/database/src/schema/index.ts`

**Example workflow:**

```typescript
// 1. Create packages/database/src/schema/posts.ts
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

export const selectPostSchema = createSelectSchema(posts);
export const updatePostSchema = insertPostSchema.partial().omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = z.infer<typeof selectPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

// 2. Export from packages/database/src/schema/index.ts
export * from "./posts";

// 3. Generate migration
// pnpm --filter database generate

// 4. Apply migration
// pnpm --filter database db:migrate
```

**Generating and applying migrations:**

```bash
# After adding/modifying schemas
pnpm --filter database generate    # Generates SQL migration files in drizzle/
pnpm --filter database db:migrate  # Applies pending migrations to database

# Open Drizzle Studio to browse data
pnpm --filter database db:studio   # Opens GUI at https://local.drizzle.studio
```

**Database connection:**

The `db` instance is a singleton exported from `packages/database/src/db.ts`. It automatically:

- Loads `DATABASE_URL` from environment variables via `dotenv`
- Configures SSL based on `NODE_ENV` (enabled in production)
- Includes all schemas for type inference and relations

### Modifying the Theme

All theme customizations (colors, fonts, shadows, etc.) are centralized in `packages/tailwind-config/index.js`:

**To update theme colors:**

1. Edit `packages/tailwind-config/index.js`
2. Modify the `colors` object in `theme.extend`
3. Changes apply to both apps immediately (hot reload works)

**To add new theme values:**

```javascript
// packages/tailwind-config/index.js
theme: {
  extend: {
    colors: { /* existing colors */ },
    spacing: {
      '128': '32rem', // Add custom spacing
    },
    animation: {
      'spin-slow': 'spin 3s linear infinite', // Add custom animation
    }
  }
}
```

**For app-specific theme overrides:**

```javascript
// apps/web/tailwind.config.js
const baseConfig = require("tailwind-config")({ content: [...] });

module.exports = {
  ...baseConfig,
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      // Web-only additions
      colors: {
        ...baseConfig.theme.extend.colors,
        'web-specific': '#custom',
      }
    }
  }
};
```

### Modifying TypeScript Settings

All shared TypeScript compiler options are centralized in `packages/typescript-config/`:

**To update compiler options for all projects:**

1. Edit `packages/typescript-config/base.json`
2. Add/modify compiler options
3. Changes apply immediately to all apps and packages

**To update Next.js-specific settings:**

1. Edit `packages/typescript-config/nextjs.json`
2. Only affects the web app

**To update Expo/React Native settings:**

1. Edit `packages/typescript-config/expo.json`
2. Affects mobile app and all packages (ui, screens)

**For app-specific TypeScript overrides:**

```json
// apps/web/tsconfig.json
{
  "extends": "typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"], // App-specific path aliases
      "@components/*": ["./src/components/*"]
    },
    "baseUrl": "." // App-specific setting
  }
}
```

**Note:** Avoid duplicating compiler options already in the shared configs. Only add app-specific settings like paths, baseUrl, or includes.

### Platform-Specific Code

When needed, use file extensions or platform detection:

```tsx
// File-based: component.web.tsx / component.native.tsx
// Runtime: Platform.OS === 'web' | 'ios' | 'android'
```

### TypeScript Configuration

**Shared TypeScript Configuration (`packages/typescript-config`):**

The monorepo uses a Turborepo-style TypeScript configuration with platform-specific configs. Each config is a JSON file that apps/packages extend from.

**Configuration files:**

1. **`base.json`** - Core compiler options shared by all projects:

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

2. **`nextjs.json`** - Extends base.json, adds Next.js-specific settings:

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "nativewind",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

3. **`expo.json`** - Extends Expo's base config with our strict mode:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  }
}
```

**How apps/packages use it:**

```json
// apps/web/tsconfig.json (Next.js app)
{
  "extends": "typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}

// apps/mobile/tsconfig.json (Expo app)
{
  "extends": "typescript-config/expo.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts"]
}

// packages/components/tsconfig.json & packages/ui/tsconfig.json (React packages)
{
  "extends": "typescript-config/expo.json",
  "include": ["src/**/*"]
}

// packages/database/tsconfig.json (Node.js backend package)
{
  "extends": "typescript-config/base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2020"
  },
  "include": ["src/**/*", "drizzle.config.ts"],
  "exclude": ["node_modules", "dist", "drizzle"]
}
```

**Benefits:**

- Platform-specific configs (Next.js vs Expo vs Node.js) clearly defined
- Compiler options centralized - update once, applies everywhere
- Apps/packages reduced to minimal configs (just paths and includes)
- Backend packages (like database) extend base.json with Node.js-specific settings
- Follows Turborepo best practices for monorepo TypeScript configs

### Build Caching

Turborepo caches build outputs:

- Web: `.next/**` (excluding cache)
- Task dependencies defined in `turbo.json`

## Important Notes

### Version Constraints

Always respect the pnpm overrides in root `package.json`. These versions are locked for compatibility:

- React 19 requires specific native module versions
- NativeWind 4.x requires Tailwind 3.x

### gluestack Component Conditionals

Some components are commented out in `packages/components/src/index.ts`:

- `accordion`, `actionsheet`: Not yet implemented
- `bottomsheet`, `input-accessory-view`: Expo-only (no web support)
- `select`, `table`: Currently disabled

### Build Errors to Ignore

`next.config.ts` has:

```ts
eslint: {
  ignoreDuringBuilds: true;
}
typescript: {
  ignoreBuildErrors: true;
}
```

This is intentional for faster builds during development. Remove when stabilizing.

### React Native Web Limitations

Not all React Native components work on web. The components package selectively exports components known to work cross-platform. When adding new components, test on both platforms.

## Common Issues

### Module Resolution

If imports fail:

1. Check `pnpm-workspace.yaml` includes the package path
2. Verify `package.json` has `"main"` and `"types"` fields pointing to entry
3. Run `pnpm install` from root to update workspace links

### Tailwind Classes Not Working

1. Check if the file is in an app-specific location that needs to be added to the app's `tailwind.config.js` content array
2. The shared packages (`components` and `ui`) are automatically included via `packages/tailwind-config/index.js`
3. Ensure `global.css` (mobile) or `globals.css` (web) imports Tailwind directives
4. If you modified `packages/tailwind-config/index.js`, restart the dev server to pick up changes
5. Verify both apps have `tailwind-config: "workspace:*"` in their `devDependencies`

### TypeScript Errors

If TypeScript is not recognizing the shared config:

1. Verify the app/package has `typescript-config: "workspace:*"` in `devDependencies`
2. Run `pnpm install` from root to ensure workspace linking
3. Check that `tsconfig.json` extends the correct config:
   - Web app should extend `typescript-config/nextjs.json`
   - Mobile app and React packages (components, ui) should extend `typescript-config/expo.json`
   - Backend packages (database) should extend `typescript-config/base.json` with Node.js settings
4. Restart your TypeScript server (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")

If you need to modify compiler options:

- **DO NOT** add compiler options directly to app/package `tsconfig.json` files
- **DO** update the shared config in `packages/typescript-config/`
- Only add app-specific settings like `paths`, `baseUrl`, or `include` to individual configs
- Backend packages can add Node.js-specific options (`module: "NodeNext"`, `moduleResolution: "NodeNext"`, etc.)

### Platform-Specific Bugs

Use `pnpm --filter mobile dev` to test all three platforms (iOS/Android/web) before assuming mobile-only issues.

### Database Package Issues

**Connection errors:**

1. Verify `DATABASE_URL` is set in environment variables (`.env` file or system env)
2. Check database is running and accessible at the connection string
3. For production, ensure SSL is enabled (automatically enabled when `NODE_ENV=production`)
4. Test connection with: `pnpm --filter database db:studio`

**Migration errors:**

1. Ensure `drizzle.config.ts` points to correct schema path (`./src/schema/index.ts`)
2. Run `pnpm --filter database generate` after schema changes
3. Apply migrations with `pnpm --filter database db:migrate`
4. Check `drizzle/` directory for generated SQL files

**Type errors with Drizzle/Zod:**

1. Ensure `drizzle-orm`, `drizzle-zod`, and `zod` versions are compatible
2. Run `pnpm install` from root to ensure workspace dependencies are linked
3. Verify schema files export both Zod schemas and TypeScript types
4. Check that `createInsertSchema` and `createSelectSchema` are imported from `drizzle-zod`

**Import errors in API/lambdas:**

1. Verify the consuming app has `"database": "workspace:*"` in dependencies
2. Run `pnpm install` from root to link workspace packages
3. Check import path is `from "database"` (not `from "@/database"` or relative paths)
4. Ensure `packages/database/package.json` has correct `main` and `types` fields pointing to `./src/index.ts`
