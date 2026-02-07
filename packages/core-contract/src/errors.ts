import { z } from "zod";

/**
 * Standard error codes with HTTP status mappings
 * These are used across all contracts
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: { status: 401, message: "Not authenticated" },
  FORBIDDEN: { status: 403, message: "Not authorized" },

  // Resource errors
  NOT_FOUND: { status: 404, message: "Resource not found" },
  CONFLICT: { status: 409, message: "Resource conflict" },

  // Validation
  BAD_REQUEST: { status: 400, message: "Invalid request" },
  VALIDATION_ERROR: { status: 422, message: "Validation failed" },

  // Rate limiting
  RATE_LIMITED: { status: 429, message: "Too many requests" },

  // Server errors
  INTERNAL_ERROR: { status: 500, message: "Internal server error" },
  SERVICE_UNAVAILABLE: { status: 503, message: "Service unavailable" },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

/**
 * Error data schemas for typed error payloads
 */
export const ValidationErrorData = z.object({
  fields: z.record(z.string(), z.string()),
});

export const RateLimitedErrorData = z.object({
  retryAfter: z.number(),
});
