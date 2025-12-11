# API Testing Guide

This guide covers testing strategies for the Fastify API server.

## Testing Stack

- **Vitest** - Fast unit test runner with TypeScript support
- **Fastify.inject()** - Test HTTP endpoints without starting a server
- **PostgreSQL** - Real database for integration tests (recommended)

## Running Tests

```bash
# Run all tests
pnpm --filter api test

# Run tests in watch mode
pnpm --filter api test --watch

# Run with coverage
pnpm --filter api coverage

# Run specific test file
pnpm --filter api test src/routes/auth.test.ts
```

## Test Structure

```
apps/api/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   └── auth.test.ts      # Route tests
│   ├── plugins/
│   │   ├── config.ts
│   │   └── config.test.ts    # Plugin tests
│   └── utils/
│       ├── error-handling.ts
│       └── error-handling.test.ts  # Utility tests
└── vitest.config.ts
```

## Writing Route Tests

### Basic Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app";
import type { FastifyInstance } from "fastify";

describe("/api/v1/auth", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /signup - should create new user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: {
        name: "Test User",
        email: "test@example.com",
        password: "SecurePassword123!",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      user: {
        name: "Test User",
        email: "test@example.com",
      },
      session: {
        token: expect.any(String),
      },
    });
  });

  it("POST /signup - should reject duplicate email", async () => {
    // Create user first
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: {
        name: "Test User",
        email: "duplicate@example.com",
        password: "SecurePassword123!",
      },
    });

    // Try to create same user again
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: {
        name: "Test User 2",
        email: "duplicate@example.com",
        password: "SecurePassword123!",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: "EMAIL_EXISTS",
    });
  });
});
```

### Testing Protected Routes

```typescript
describe("/api/v1/me", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Sign up and get auth token
    const signupResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: {
        name: "Test User",
        email: "test@example.com",
        password: "SecurePassword123!",
      },
    });

    authToken = signupResponse.json().session.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /me - should return current user", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: {
        email: "test@example.com",
      },
    });
  });

  it("GET /me - should reject without auth", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/me",
    });

    expect(response.statusCode).toBe(401);
  });
});
```

## Database Testing

### Option 1: Real PostgreSQL (Recommended)

Use a test database for integration tests:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
      NODE_ENV: "test",
    },
    setupFiles: ["./src/tests/setup.ts"],
    teardownFiles: ["./src/tests/teardown.ts"],
  },
});
```

```typescript
// src/tests/setup.ts
import { db } from "database";
import { sql } from "drizzle-orm";

export async function setup() {
  // Clear all tables before tests
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  await db.execute(sql`TRUNCATE TABLE sessions CASCADE`);
}
```

### Option 2: In-Memory Database

For faster tests, use SQLite in-memory:

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite);
```

## Mocking

### Mocking External Services

```typescript
import { vi } from "vitest";

// Mock email service
vi.mock("../services/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

it("should send verification email", async () => {
  const { sendEmail } = await import("../services/email");

  // Your test code...

  expect(sendEmail).toHaveBeenCalledWith({
    to: "test@example.com",
    subject: "Verify your email",
  });
});
```

### Mocking Database

```typescript
import { vi } from "vitest";

vi.mock("database", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ id: "123", name: "Test" }]),
  },
}));
```

## Testing Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
describe("User routes", () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();
  });

  it("test 1", async () => {
    // This test starts with clean state
  });

  it("test 2", async () => {
    // This test also starts with clean state
  });
});
```

### 2. Use Factories

Create test data factories:

```typescript
// src/tests/factories.ts
export function createTestUser(overrides = {}) {
  return {
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: "SecurePassword123!",
    ...overrides,
  };
}

// In your test
it("should create user", async () => {
  const userData = createTestUser({ name: "Custom Name" });

  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/signup",
    payload: userData,
  });

  expect(response.statusCode).toBe(201);
});
```

### 3. Test Error Cases

Always test both success and failure scenarios:

```typescript
describe("POST /api/v1/users", () => {
  it("should create user with valid data", async () => {
    // Test success case
  });

  it("should reject invalid email", async () => {
    // Test validation error
  });

  it("should reject duplicate email", async () => {
    // Test business logic error
  });

  it("should reject unauthorized request", async () => {
    // Test authentication error
  });
});
```

### 4. Use TypeScript

Leverage TypeScript for better test quality:

```typescript
import type { AuthenticationResponse } from "service-contracts";

it("should return typed response", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/signup",
    payload: createTestUser(),
  });

  const data: AuthenticationResponse = response.json();

  expect(data.user.id).toBeDefined();
  expect(data.session.token).toBeDefined();
});
```

## Coverage

Run tests with coverage:

```bash
pnpm --filter api coverage
```

**Coverage targets:**

- Statements: > 80%
- Branches: > 80%
- Functions: > 80%
- Lines: > 80%

## Continuous Integration

Tests run automatically on CI (GitHub Actions):

```yaml
# .github/workflows/ci.yml
- name: Run API tests
  run: pnpm --filter api test

- name: Check coverage
  run: pnpm --filter api coverage
```

## Debugging Tests

### VS Code Launch Configuration

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["--filter", "api", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Console Logging

```typescript
it("debug test", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/users",
  });

  console.log("Response:", response.json());
  console.log("Status:", response.statusCode);
});
```

## Related Documentation

- [Error Handling](./error-handling.md)
- [API Routes](./routes.md)
- [Testing Guide](../guides/testing.md)
