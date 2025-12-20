import { type TUserErrorResponse } from "@app/service-contracts";
import { AppCustomError } from "./base";

export class NotFoundError extends AppCustomError {
  constructor(
    message = "Resource not found",
    userResponse: TUserErrorResponse = {
      message: "The requested resource was not found.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 404,
      userResponse,
      debug,
    });
  }
}

export class BadRequestError extends AppCustomError {
  constructor(
    message = "Bad request",
    userResponse: TUserErrorResponse = {
      message: "The request was invalid or missing required data.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 400,
      userResponse,
      debug,
    });
  }
}

export class UnauthorizedError extends AppCustomError {
  constructor(
    message = "Unauthorized",
    userResponse: TUserErrorResponse = {
      message: "You are not authorized to perform this action.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 401,
      userResponse,
      debug,
    });
  }
}

export class ForbiddenError extends AppCustomError {
  constructor(
    message = "Forbidden",
    userResponse: TUserErrorResponse = {
      message: "You do not have permission to access this resource.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 403,
      userResponse,
      debug,
    });
  }
}

export class ConflictError extends AppCustomError {
  constructor(
    message = "Conflict",
    userResponse: TUserErrorResponse = {
      message: "A conflict occurred while processing the request.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 409,
      userResponse,
      debug,
    });
  }
}

export class UnprocessableEntityError extends AppCustomError {
  constructor(
    message = "Unprocessable entity",
    userResponse: TUserErrorResponse = {
      message: "The provided data could not be processed.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 422,
      userResponse,
      debug,
    });
  }
}

export class PermissionsError extends AppCustomError {
  constructor(
    message = "Permission denied",
    userResponse: TUserErrorResponse = {
      message: "You do not have permission to perform this action.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 403,
      userResponse,
      debug,
    });
  }
}

export class DataFetchError extends AppCustomError {
  constructor(
    message: string,
    userResponse: TUserErrorResponse = {
      message: "Failed to retrieve required data.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 500,
      userResponse,
      debug,
    });
  }
}

export class InternalServerError extends AppCustomError {
  constructor(
    message = "Internal server error",
    userResponse: TUserErrorResponse = {
      message: "An internal server error occurred.",
    },
    debug?: Record<string, unknown>
  ) {
    super({
      message,
      statusCode: 500,
      userResponse,
      debug,
    });
  }
}
