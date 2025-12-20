import { type TUserErrorResponse } from "@app/service-contracts";

/**
 * Base class for application-specific errors.
 *
 * This class is designed to:
 * - Separate internal error logging from user-facing messages
 * - Support structured metadata for debugging (e.g., request context, IDs)
 * - Produce predictable and secure responses in public or internal APIs
 *
 * When thrown, this error should be caught and translated into a consistent API response,
 * and optionally logged or reported to observability platforms.
 */
export class AppCustomError extends Error {
  /**
   * Internal error code, always equal to the HTTP status code.
   * Useful for filtering logs or debugging without revealing sensitive context.
   */
  public readonly code: number;

  /**
   * HTTP status code to be returned with the response (e.g., 400, 409, 500).
   */
  public readonly statusCode: number;

  /**
   * Safe, structured error information to be returned to the client.
   */
  public readonly userResponse: TUserErrorResponse;

  /**
   * Internal-only debugging context.
   *
   * This can contain rich context such as userId, companyId, payload, etc.,
   * and is intended to aid developers in debugging the root cause.
   *
   * This field should never be sent directly to the client.
   */
  public readonly debug?: Record<string, unknown>;

  /**
   * Create a new `AppCustomError`.
   *
   * @param message - Developer-facing error message for logs and observability
   * @param statusCode - HTTP status code for the response (default: 500)
   * @param userResponse - Structured, safe error content for end-users
   * @param debug - Optional internal-only metadata for debugging and logging
   */
  constructor({
    message,
    statusCode = 500,
    userResponse,
    debug,
  }: {
    message: string;
    statusCode: number;
    userResponse: TUserErrorResponse;
    debug?: Record<string, unknown>;
  }) {
    super(message);
    this.name = new.target.name; // ensures that the name of the error instance reflects the actual class that was instantiated
    this.statusCode = statusCode;
    this.code = statusCode;
    this.userResponse = userResponse;
    this.debug = debug;

    // Captures the stack trace relative to where the error was thrown
    Error.captureStackTrace(this, new.target);
  }
}
