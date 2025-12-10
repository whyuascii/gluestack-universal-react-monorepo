# Testing Guide

This guide outlines best practices and conventions for writing tests in the gluestack Universal React Monorepo.

## Test Categories

We categorize tests into three main types:

1. **Unit Tests**: Test individual functions or methods in isolation
2. **Integration Tests**: Test how multiple units work together
3. **End-to-End Tests**: Test the entire application from the user's perspective

## Test File Organization

### Co-locating Tests with Source Code

We follow the practice of co-locating test files with the source code they are testing:

```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
  utils/
    math-utils.ts
    math-utils.unit.test.ts
  services/
    user-service.ts
    user-service.unit.test.ts
    user-service.integration.test.ts
```

### Naming Conventions

- Unit tests: `*.unit.test.ts`
- Integration tests: `*.integration.test.ts`
- Component tests: `*.test.tsx`

## Testing Tools

### Vitest

We use **Vitest** as our test runner for all packages:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("MyFunction", () => {
  it("should return expected value", () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### React Testing Library

For React components, we use **React Testing Library**:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

test('renders and handles interaction', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);

  expect(screen.getByText(/clicked!/i)).toBeInTheDocument();
});
```

## Unit Testing

Unit tests focus on testing a single function or method in isolation:

```typescript
// math-utils.unit.test.ts
import { add } from "./math-utils";

describe("add function", () => {
  it("should return the sum of two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("should handle negative numbers correctly", () => {
    expect(add(-1, 1)).toBe(0);
  });
});
```

Guidelines:
- Focus on a single use-case at a time
- Have a minimal set of assertions per test
- Test edge cases and error conditions

## Integration Testing

Integration tests verify that multiple units work together correctly:

```typescript
// user-service.integration.test.ts
import { db } from "database";
import { createUser, getUserById } from "./user-service";

describe("User Service Integration", () => {
  beforeEach(async () => {
    await db.delete(users);
  });

  it("should create a user and retrieve it by ID", async () => {
    const newUser = await createUser({
      tenantId: testTenantId,
      name: "John Doe",
      email: "john@example.com"
    });

    const retrievedUser = await getUserById(newUser.id);
    expect(retrievedUser).toEqual(newUser);
  });
});
```

## Database Testing with PostgreSQL

For integration tests that require a database, use a local PostgreSQL instance.

### Setup PostgreSQL with Docker

```bash
# Start PostgreSQL
docker run --name postgres-test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=test \
  -p 5432:5432 \
  -d postgres:16

# Stop PostgreSQL
docker stop postgres-test && docker rm postgres-test
```

### VSCode Task Config

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start PostgreSQL Test DB",
      "type": "shell",
      "command": "docker run --name postgres-test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=test -p 5432:5432 -d --rm postgres:16",
      "problemMatcher": [],
      "dependsOn": ["Stop PostgreSQL Test DB"]
    },
    {
      "label": "Stop PostgreSQL Test DB",
      "type": "shell",
      "command": "docker stop postgres-test || true",
      "problemMatcher": []
    }
  ]
}
```

### Test Environment Setup

Tests should use a separate test database:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    env: {
      DATABASE_URL: "postgresql://postgres:test@localhost:5432/test"
    }
  }
});
```

## API Testing

For API routes, use Fastify's inject method:

```typescript
import { build } from "../../app";
import stubEnv from "../../tests/stubEnvSetup";

describe("Health Endpoint", () => {
  beforeEach(async (context) => {
    stubEnv();
    context.fastify = await build();
    await context.fastify.ready();
  });

  it("should return 200 with health status", async ({ fastify }) => {
    const response = await fastify.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      healthy: true,
    });
  });
});
```

## Test Structure

### Using describe() and it()

```typescript
describe("Score Utilities", () => {
  describe("calculateTotalScore", () => {
    it("should sum up all scores correctly", () => {
      const scores = [10, 20, 30];
      expect(calculateTotalScore(scores)).toBe(60);
    });

    it("should return 0 for an empty array", () => {
      expect(calculateTotalScore([])).toBe(0);
    });
  });
});
```

### Test Naming Conventions

- Use descriptive and clear language
- Start with "should" or present tense verb
- Be specific about expected behavior

Examples:
```typescript
it("should return the sum of two numbers");
it("returns an empty array when no items match");
it("throws an error for invalid input");
```

## Coverage Requirements

- All new packages should come with unit tests
- Significant features should have integration tests
- All tests must be runnable in CI/CD

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter api test
pnpm --filter components test

# Run tests in watch mode
pnpm --filter api test --watch

# Run with coverage
pnpm --filter api coverage
```

## CI/CD

Tests run in GitHub Actions with `GH_ACTIONS=TRUE` environment variable. You can use this to adjust test behavior:

```typescript
const timeout = process.env.GH_ACTIONS ? 10000 : 5000;
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test Behavior, Not Implementation**: Focus on what, not how
3. **Avoid Test Interdependence**: Each test should be independent
4. **Use Descriptive Names**: Test names should explain what they verify
5. **Keep Tests Fast**: Unit tests should run in milliseconds
6. **Mock External Dependencies**: Don't call real APIs in tests
7. **Test Edge Cases**: Cover error conditions and boundary values
