# Development Workflow Guides

Guides for development practices, testing, debugging, and working effectively in the monorepo.

## Available Guides

### [Testing](./testing.md)

Comprehensive testing strategies:

- Unit testing with Vitest
- Integration testing
- Component testing with React Testing Library
- API testing
- Test data factories
- Mocking strategies
- Coverage reporting

**Use this when:**

- Writing tests for new features
- Test-driven development (TDD)
- Fixing bugs (write test first!)
- Setting up CI/CD

### [Monorepo Workflow](./monorepo-workflow.md)

Working effectively in a Turborepo monorepo:

- Package dependencies and boundaries
- Turborepo task running
- Build caching strategies
- Workspace commands
- Versioning and publishing
- Common pitfalls

**Use this when:**

- New to the monorepo
- Adding new packages
- Optimizing build times
- Troubleshooting workspace issues

### [Debugging](./debugging.md)

Debug strategies for all platforms:

- Debugging Next.js (web)
- Debugging Expo (mobile)
- Debugging Fastify (API)
- VS Code debugging
- Remote debugging
- Network inspection
- Database queries

**Use this when:**

- Investigating bugs
- Understanding code flow
- Inspecting runtime values
- Debugging production issues

## Quick Reference

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter api test

# Watch mode
pnpm --filter api test --watch

# Coverage
pnpm --filter api coverage
```

### Turborepo Commands

```bash
# Run task in all packages
pnpm build
pnpm lint
pnpm typecheck

# Run in specific package
pnpm --filter web dev
pnpm --filter database db:migrate

# Run in multiple packages
pnpm --filter web --filter mobile build
```

### Debugging

**VS Code Launch Config:**

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API",
  "program": "${workspaceFolder}/apps/api/src/index.ts",
  "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/tsx",
  "skipFiles": ["<node_internals>/**"]
}
```

**Chrome DevTools (Next.js):**

```bash
NODE_OPTIONS='--inspect' pnpm --filter web dev
# Open chrome://inspect
```

## Best Practices

### Test-Driven Development (TDD)

1. **Write failing test** - Define expected behavior
2. **Implement minimum code** - Make test pass
3. **Refactor** - Improve code while tests pass
4. **Repeat** - Next feature

### Monorepo Hygiene

- **Clear boundaries** - Packages should have single responsibility
- **No circular deps** - Packages can't depend on each other in a cycle
- **Shared configs** - Use config packages for common settings
- **Consistent structure** - Follow established patterns

### Debugging Workflow

1. **Reproduce** - Create minimal reproduction
2. **Isolate** - Narrow down to specific component/function
3. **Inspect** - Use debugger or logs
4. **Fix** - Implement solution
5. **Test** - Write test to prevent regression

## Related Documentation

- **[Getting Started - Troubleshooting](../../getting-started.md#troubleshooting)** - Common issues
- **[Monorepo Structure Concepts](../../concepts/monorepo-structure.md)** - Package organization
- **[API Testing Guide](../api/testing-api.md)** - API-specific testing
