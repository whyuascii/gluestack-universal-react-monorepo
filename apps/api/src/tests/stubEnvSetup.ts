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
}
