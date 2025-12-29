import { BadRequestError, ForbiddenError, UnauthorizedError } from "@app/errors";

/**
 * Transform Better Auth errors into structured AppCustomErrors
 *
 * Better Auth returns errors with { code, message } format.
 * This function maps them to our error handling system.
 */
export function transformBetterAuthError(authError: { code?: string; message?: string }): never {
  const code = authError.code || "UNKNOWN";
  const message = authError.message || "Authentication error occurred";

  switch (code) {
    case "INVALID_ORIGIN":
      throw new ForbiddenError(
        `Better Auth: Invalid origin - ${message}`,
        {
          message:
            "Request from unauthorized origin. Please ensure you're accessing from the correct domain.",
        },
        { betterAuthCode: code, originalMessage: message }
      );

    case "INVALID_EMAIL":
    case "INVALID_PASSWORD":
    case "INVALID_CREDENTIALS":
      throw new BadRequestError(
        `Better Auth: ${code} - ${message}`,
        {
          message: "Invalid email or password.",
        },
        { betterAuthCode: code }
      );

    case "USER_ALREADY_EXISTS":
    case "EMAIL_ALREADY_EXISTS":
      throw new BadRequestError(
        `Better Auth: User already exists - ${message}`,
        {
          message: "An account with this email already exists.",
        },
        { betterAuthCode: code }
      );

    case "UNAUTHORIZED":
    case "SESSION_EXPIRED":
    case "SESSION_NOT_FOUND":
      throw new UnauthorizedError(
        `Better Auth: ${code} - ${message}`,
        {
          message: "Your session has expired. Please log in again.",
        },
        { betterAuthCode: code }
      );

    default:
      throw new BadRequestError(
        `Better Auth: ${code} - ${message}`,
        {
          message: message || "Authentication error occurred.",
        },
        { betterAuthCode: code }
      );
  }
}

/**
 * Check if an error is from Better Auth and transform it
 */
export async function handleBetterAuthResponse(response: Response): Promise<void> {
  // Better Auth returns errors with status >= 400
  if (response.status >= 400) {
    try {
      // Try to parse the error body
      const body = (await response.json()) as Record<string, unknown>;
      if (body && (body.code || body.message)) {
        transformBetterAuthError(body as { code?: string; message?: string });
      }
    } catch {
      // If we can't parse the response, throw a generic error
      throw new BadRequestError(
        `Better Auth error: ${response.status} ${response.statusText}`,
        {
          message: "Authentication error occurred.",
        },
        { status: response.status, statusText: response.statusText }
      );
    }
  }
}
