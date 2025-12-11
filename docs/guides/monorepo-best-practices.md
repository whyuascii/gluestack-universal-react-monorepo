# Monorepo Best Practices

## Introduction

When working with a monorepo, it's important to follow best practices for importing packages to avoid circular dependencies and ensure maintainability. These practices aim to reduce dependency complexity, improve modularity, and minimize the risk of version conflicts. This guide provides a set of best practices for importing modules and packages within our codebase.

## Glossary

- `monorepo`: a single repository that contains multiple packages
- `package`: a reusable set of code that can be used across multiple projects
- `dependency`: a package that is used by another package
- `external dependency`: a dependency that is not part of the monorepo, comes from npm registry
- `internal dependency`: a dependency that is part of the monorepo

## Install dependencies

When installing dependencies, install them directly in the package that uses them. This is true for both external and internal dependencies. Very few dependencies should be installed in the root package.json file, and these will mostly be tools for managing the monorepo.

You can install dependencies in multiple packages using npm:

```bash
npm install vitest --workspace=webserver --workspace=dto
```

This can be helpful when different packages need consistent versions of a shared tool.

## Keep dependencies in sync

It's usually best practice to keep dependencies at the same version across all packages. There may be some exceptions to this, but they should be rare. You can use npm to update dependencies across all packages:

```bash
npm install typescript@latest --workspaces
```

Additionally, there are some tools that can help manage dependencies across the monorepo:

- [`syncpack`](https://www.npmjs.com/package/syncpack): Great for maintaining version consistency across packages.
- [`manypkg`](https://www.npmjs.com/package/@manypkg/cli): Useful for managing and validating dependency relationships in a monorepo.
- [`sherif`](https://www.npmjs.com/package/sherif): Helps enforce dependency rules and guidelines across the monorepo.

## Importing an internal package

Follow the steps in the [create new monorepo workspace guide](./create-new-monorepo-workspace.md) to create a new internal package.

To import the new internal package, you must first add it to the `package.json` file either in the `dependencies` or `devDependencies` section.

```json
"dependencies": {
    "ai": "*",
    "react": "latest",
    "react-dom": "latest"
},
```

Skipping this step may lead to broken builds or make dependencies difficult to trace during debugging.

Then, you can import the package in your code:

```typescript
import { generateText } from "ai";
```

## Importing from within the same package

It's common to work on a package and need to import a function defined in the same package. When working within the same package, don't add the package to the `package.json` file. You must import the function directly from the source file to avoid circular dependency issues.

## When to create a new package

There isn't a strict science or rule to determine when to create a new package. We have found that most functions are probably service actions in the `dto` package. There are some cases where a business domain needs its own package, but this tends to be only for cross-cutting services.

A common pattern is **One "purpose" per package** design. This is a [recommendation by the Turborepo team](https://turbo.build/repo/docs/crafting-your-repository/creating-an-internal-package#one-purpose-per-package). This would be an easier guideline to follow and help our ultimate goal of [reducing decision fatigue](./decision-fatigue.md). We may move to this model in the future. If you have any thoughts on how this could impact your workflow, we'd love to hear them.

## Application Packages do not contain shared code

When you're creating Application Packages, it's best to avoid putting shared code in those packages. Instead, you should create a separate package for the shared code and have the application packages depend on that package.

Additionally, Application Packages are not meant to be installed into other packages. Instead, they should be thought of as an entry point to your Package Graph.

## This Monorepo's Structure

Our monorepo follows a specific package dependency hierarchy:

**Base Layer (No Dependencies):**

- `database` - Drizzle ORM + schemas
- `utils` - Pure utility functions
- `errors` - Error classes
- `service-contracts` - Type definitions

**Auth Layer:**

- `auth` - Better Auth configuration (depends on `database`)

**UI Layer:**

- `components` - gluestack UI primitives (no dependencies)
- `ui` - Screens, hooks, state (depends on `components`, `utils`)

**Application Layer:**

- `web` - Next.js app (depends on all UI packages)
- `mobile` - Expo app (depends on all UI packages)
- `api` - Fastify server (depends on `auth`, `database`, `errors`, `service-contracts`, `utils`)

**Configuration Packages:**

- `tailwind-config` - Shared Tailwind theme
- `typescript-config` - Shared TypeScript settings
- `eslint-config` - Shared ESLint rules

### Package Manager

This monorepo uses **pnpm** (not npm). Commands differ:

```bash
# pnpm (used in this project)
pnpm --filter api test
pnpm install
pnpm dev

# npm (from general guide above)
npm install --workspace=api
```

### Workspace Dependencies

Internal packages use `workspace:*` protocol:

```json
{
  "dependencies": {
    "database": "workspace:*",
    "auth": "workspace:*",
    "components": "workspace:*"
  }
}
```

This ensures:

- Always uses latest local version
- No need to publish to npm
- Proper TypeScript resolution

### Version Overrides

The root `package.json` uses pnpm overrides to enforce consistent versions:

```json
{
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "tailwindcss": "3.4.17"
    }
  }
}
```

Don't override these in individual packages unless absolutely necessary.

## Related Documentation

- [Monorepo Structure](../architecture/monorepo-structure.md)
- [Architecture Overview](../architecture/overview.md)
- [Cross-Platform Strategy](../architecture/cross-platform.md)
