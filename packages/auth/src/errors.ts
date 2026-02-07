/**
 * Auth Error Classes
 *
 * Error classes for Better Auth error handling.
 * These provide structured error responses with user-safe messages.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * User-safe error response structure.
 * This is what gets sent to the client.
 */
export interface AuthErrorResponse {
  /** User-friendly error message */
  message: string;
  /** Optional list of details */
  details?: string[];
  /** Optional key-value metadata */
  meta?: Record<string, string>;
}

// ============================================================================
// Base Error Class
// ============================================================================

/**
 * Base class for auth-related errors.
 *
 * Separates internal error logging from user-facing messages.
 * The `userResponse` field contains safe content for API responses.
 */
export class AuthError extends Error {
  /** HTTP status code */
  public readonly statusCode: number;

  /** Internal error code (same as statusCode) */
  public readonly code: number;

  /** Safe, structured error for client response */
  public readonly userResponse: AuthErrorResponse;

  /** Internal-only debug context (never sent to client) */
  public readonly debug?: Record<string, unknown>;

  constructor({
    message,
    statusCode = 500,
    userResponse,
    debug,
  }: {
    message: string;
    statusCode: number;
    userResponse: AuthErrorResponse;
    debug?: Record<string, unknown>;
  }) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = statusCode;
    this.userResponse = userResponse;
    this.debug = debug;
    Error.captureStackTrace(this, new.target);
  }
}

// ============================================================================
// Specific Error Classes
// ============================================================================

export class BadRequestError extends AuthError {
  constructor(
    message = "Bad request",
    userResponse: AuthErrorResponse = {
      message: "The request was invalid or missing required data.",
    },
    debug?: Record<string, unknown>
  ) {
    super({ message, statusCode: 400, userResponse, debug });
  }
}

export class UnauthorizedError extends AuthError {
  constructor(
    message = "Unauthorized",
    userResponse: AuthErrorResponse = {
      message: "You are not authorized to perform this action.",
    },
    debug?: Record<string, unknown>
  ) {
    super({ message, statusCode: 401, userResponse, debug });
  }
}

export class ForbiddenError extends AuthError {
  constructor(
    message = "Forbidden",
    userResponse: AuthErrorResponse = {
      message: "You do not have permission to access this resource.",
    },
    debug?: Record<string, unknown>
  ) {
    super({ message, statusCode: 403, userResponse, debug });
  }
}

export class NotFoundError extends AuthError {
  constructor(
    message = "Resource not found",
    userResponse: AuthErrorResponse = {
      message: "The requested resource was not found.",
    },
    debug?: Record<string, unknown>
  ) {
    super({ message, statusCode: 404, userResponse, debug });
  }
}

export class ConflictError extends AuthError {
  constructor(
    message = "Conflict",
    userResponse: AuthErrorResponse = {
      message: "A conflict occurred while processing the request.",
    },
    debug?: Record<string, unknown>
  ) {
    super({ message, statusCode: 409, userResponse, debug });
  }
}

export class InternalServerError extends AuthError {
  constructor(
    message = "Internal server error",
    userResponse: AuthErrorResponse = {
      message: "An internal server error occurred.",
    },
    debug?: Record<string, unknown>
  ) {
    super({ message, statusCode: 500, userResponse, debug });
  }
}
