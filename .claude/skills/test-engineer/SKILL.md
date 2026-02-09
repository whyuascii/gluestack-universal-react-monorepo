---
name: test-engineer
description: Use when writing tests for implemented features - creates API integration tests, component tests, and E2E scenarios
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Test Engineer

Write comprehensive tests for API endpoints, components, and user flows.

> **Shared rules apply:** See README for type safety requirements (no `any` in test code either).

## Test Types & Locations

| Test Type       | Location                           | Runner     |
| --------------- | ---------------------------------- | ---------- |
| API Integration | `apps/api/src/__tests__/`          | Vitest     |
| Component Unit  | `packages/ui/src/**/__tests__/`    | Vitest     |
| Hook Tests      | `packages/ui/src/hooks/__tests__/` | Vitest     |
| E2E (Web)       | `apps/web/e2e/`                    | Playwright |
| E2E (Mobile)    | `apps/mobile/e2e/`                 | Detox      |

## Priority Order

1. API Integration Tests → 2. Hook Tests → 3. Component Tests → 4. E2E Critical Paths

## API Integration Tests

```typescript
// apps/api/src/__tests__/settings.test.ts
describe("Settings API", () => {
  let app: FastifyInstance;
  let authCookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    const { cookie, user } = await createTestUser(app);
    authCookie = cookie;
  });

  afterAll(async () => {
    await cleanupTestUser(userId);
    await app.close();
  });

  it("returns default settings for new user", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/rpc/settings/notifications",
      headers: { cookie: authCookie },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ emailNotifications: true });
  });

  it("returns 401 without auth", async () => {
    const response = await app.inject({ method: "GET", url: "/rpc/settings/notifications" });
    expect(response.statusCode).toBe(401);
  });
});
```

**Test helpers** (`apps/api/src/__tests__/helpers.ts`): `createTestApp()`, `createTestUser(app)`, `cleanupTestUser(userId)`.

## Hook Tests

```typescript
// Mock oRPC client, wrap with QueryClientProvider, use renderHook + waitFor
vi.mock("../../api", () => ({
  orpc: {
    settings: {
      get: {
        queryOptions: () => ({
          queryKey: ["settings"],
          queryFn: async () => ({ emailNotifications: true }),
        }),
      },
    },
  },
}));
```

## Component Tests

```typescript
// Mock hooks and i18n, render component, assert text/interactions
vi.mock("../../../hooks", () => ({
  useSettings: () => ({ data: mockSettings, isLoading: false }),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
```

## Test Patterns

- **Arrange-Act-Assert** for structure
- **Test isolation** — reset state in `beforeEach`
- **Typed mocks** — match actual interfaces, no `any`
- **Error assertions** — typed error structures, not `expect.any(Object)`

## Running Tests

```bash
pnpm test                                          # All
pnpm --filter api test                             # API only
pnpm --filter api test src/__tests__/settings.test.ts  # Single file
pnpm --filter api coverage                         # With coverage
```

## Checklist

- [ ] API integration tests for all endpoints
- [ ] Auth-required endpoints tested without auth (401)
- [ ] Input validation tested (400)
- [ ] Error cases tested
- [ ] Hook tests for data fetching
- [ ] Component rendering tested
- [ ] Loading/error states tested
- [ ] E2E critical paths documented
- [ ] All tests pass (`pnpm test`)
- [ ] No `any` types in test code
