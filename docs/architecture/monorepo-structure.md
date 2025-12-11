# Monorepo Structure

This document explains the monorepo organization, build system, and workspace configuration.

## Turborepo Configuration

The monorepo uses **Turborepo** for fast, cached builds across all packages and apps.

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^test"]
    }
  }
}
```

**Key Features:**

- **Task dependencies** - `^build` means "build all dependencies first"
- **Smart caching** - Build outputs cached to speed up rebuilds
- **Parallel execution** - Independent tasks run concurrently
- **Incremental builds** - Only rebuilds changed packages

## Workspace Configuration

The monorepo uses **pnpm workspaces** for package management.

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Package References

Packages reference each other using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "database": "workspace:*",
    "auth": "workspace:*",
    "components": "workspace:*"
  }
}
```

**Benefits:**

- Always uses the latest local version
- No need to publish packages to npm
- Proper TypeScript resolution
- Fast installs (no duplicate dependencies)

## Version Management

### pnpm Overrides

The root `package.json` enforces consistent versions across the monorepo:

```json
{
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "react-native": "0.81.4",
      "react-native-web": "0.21.1",
      "tailwindcss": "3.4.17",
      "nativewind": "4.2.1"
    }
  }
}
```

**Why this matters:**

- React 19 requires specific native module versions
- NativeWind 4.x requires Tailwind 3.x
- Prevents version conflicts between packages
- Ensures compatibility across web and mobile

## Shared Configurations

### TypeScript Configuration

The `typescript-config` package provides platform-specific configs:

```
typescript-config/
├── base.json         # Core compiler options
├── nextjs.json       # Next.js-specific settings
└── expo.json         # Expo/React Native settings
```

**Apps extend the appropriate config:**

```json
// apps/web/tsconfig.json
{
  "extends": "typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind Configuration

The `tailwind-config` package exports a factory function:

```javascript
// packages/tailwind-config/index.js
module.exports = function createTailwindConfig(options = {}) {
  const { content = [], important } = options;

  return {
    content: [
      "../../packages/components/src/**/*.{js,jsx,ts,tsx}",
      "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
      ...content,
    ],
    theme: {
      extend: {
        colors: {
          /* shared theme */
        },
      },
    },
  };
};
```

**Apps consume the shared config:**

```javascript
// apps/web/tailwind.config.js
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{html,js,jsx,ts,tsx,mdx}"],
  important: "html",
});
```

### ESLint Configuration

The `eslint-config` package provides shared linting rules:

```json
// packages/eslint-config/package.json
{
  "main": "index.js",
  "dependencies": {
    "eslint": "^9.18.0",
    "@typescript-eslint/parser": "^8.21.0",
    "@typescript-eslint/eslint-plugin": "^8.21.0"
  }
}
```

## Build Pipeline

### Development Mode

```bash
pnpm dev
```

**What happens:**

1. Turborepo starts dev tasks for all apps
2. Each app watches for file changes
3. Changes in packages trigger rebuilds in consuming apps
4. Hot reload works across package boundaries

### Production Build

```bash
pnpm build
```

**Build order:**

1. **Database package** - Generate types from schemas
2. **Auth, errors, utils** - Build base packages
3. **Components** - Build UI components
4. **UI package** - Build screens and logic
5. **Apps** - Build web, mobile, API in parallel

Turborepo handles this automatically via `dependsOn` configuration.

## Package Scripts

### Common Scripts

Every package should have:

```json
{
  "scripts": {
    "build": "tsc" or "swc src -d dist",
    "dev": "npm run build -- --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "clean": "rm -rf dist"
  }
}
```

### Running Scripts

```bash
# Run in all packages
pnpm build

# Run in specific package
pnpm --filter web dev
pnpm --filter api test
pnpm --filter database db:migrate

# Run in multiple packages
pnpm --filter "{web,mobile}" dev
```

## File Resolution

### Module Resolution

TypeScript uses `moduleResolution: "bundler"` (web/API) or inherits Expo's config (mobile):

- Resolves `database` → `node_modules/database/src/index.ts`
- Supports path aliases via `compilerOptions.paths`
- Works with monorepo workspace links

### Platform-Specific Files

The build system resolves platform-specific files:

```
component.tsx        # Default (shared)
component.web.tsx    # Web only
component.native.tsx # React Native only
```

**Resolution order:**

- Web: `.web.tsx` → `.tsx`
- Mobile: `.native.tsx` → `.tsx`

Configured in `next.config.ts` (web) and `metro.config.js` (mobile).

## Caching Strategy

### Turborepo Cache

Turborepo caches outputs based on:

- Input files (source code)
- Dependencies (package.json, lockfile)
- Environment variables (if specified)
- Previous task outputs

**Cache locations:**

- Local: `node_modules/.cache/turbo/`
- Remote: Vercel Remote Cache (optional)

### Incremental Builds

TypeScript incremental builds cache type information:

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Benefits:**

- Faster type checking on rebuilds
- Skip unchanged files
- Works per-package

## Best Practices

### 1. Package Boundaries

**DO:**

- Keep packages focused on a single responsibility
- Use clear, typed interfaces between packages
- Export only what's needed

**DON'T:**

- Create circular dependencies
- Expose internal implementation details
- Mix frontend and backend code in the same package

### 2. Dependency Management

**DO:**

- Use `workspace:*` for internal dependencies
- Specify exact versions in overrides
- Keep dependencies up to date

**DON'T:**

- Pin specific versions in individual packages (use overrides)
- Add the same dependency to multiple packages
- Use relative imports across package boundaries

### 3. Build Configuration

**DO:**

- Extend shared configs (TypeScript, Tailwind, ESLint)
- Keep app-specific configs minimal
- Document any deviations from shared configs

**DON'T:**

- Duplicate compiler options across packages
- Override shared config unless necessary
- Skip type checking or linting

### 4. Testing

**DO:**

- Test packages in isolation
- Use Vitest for all tests
- Mock external dependencies

**DON'T:**

- Test implementation details
- Create tests that depend on other packages' internals
- Skip edge cases

## Troubleshooting

### "Module not found" errors

1. Run `pnpm install` from root
2. Check `package.json` has `workspace:*` dependency
3. Verify `main` and `types` fields in package
4. Restart TypeScript server

### Build cache issues

```bash
# Clear Turborepo cache
pnpm turbo clean

# Clear all build outputs
pnpm clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type errors after changes

1. Build the changed package first: `pnpm --filter <package> build`
2. Restart TypeScript server in your editor
3. Check for circular type dependencies

## Related Documentation

- [Architecture Overview](./overview.md)
- [Cross-Platform Strategy](./cross-platform.md)
- [Monorepo Best Practices](../guides/monorepo-best-practices.md)
