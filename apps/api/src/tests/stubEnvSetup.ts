import { vi } from "vitest";

/**
 * Stub environment variables for testing
 */
export default function stubEnv() {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("AWS_REGION", "us-east-1");
  vi.stubEnv("PORT", "3030");
  vi.stubEnv("HOST", "0.0.0.0");
  vi.stubEnv("ENVIRONMENT_STAGE", "test");
  vi.stubEnv("GIT_BRANCH", "test-branch");
  vi.stubEnv("GIT_HASH", "testhash123");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-key-for-ci-only-do-not-use-in-production");
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3030");
  vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/test");
}
