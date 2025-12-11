import HttpError from "@fastify/sensible";
import { AppCustomError, InternalDocumentParseError } from "errors";
import type { FastifyError, FastifyInstance, FastifyRequest } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  type ZodFastifySchemaValidationError,
} from "fastify-type-provider-zod";
import { type UserErrorResponse } from "service-contracts";
import { transformValidationErrorMessages } from "utils";
import type { z } from "zod";

export const globalErrorHandler = (
  fastify: FastifyInstance,
  error: FastifyError,
  request: FastifyRequest
): { statusCode: number; response: UserErrorResponse } => {
  let statusCode = error.statusCode || 500;
  let response: UserErrorResponse = {
    message: error.message || "Internal Server Error",
  };
  let internalErrorMessage = `Unhandled Error: ${JSON.stringify(error)}`;

  try {
    // Zod validation errors (request body, query, etc.)
    if (hasZodFastifySchemaValidationErrors(error)) {
      // With fastify v5 we need to parse out the issues from the error
      const transformed = transformValidationErrorMessages(
        error.validation.map(
          (v: ZodFastifySchemaValidationError) => (v.params as { issue: z.ZodIssue }).issue
        )
      );

      statusCode = 422;
      response = {
        message: "Validation failed.",
        details: transformed.map((t) => t.message),
      };
      internalErrorMessage = `Zod Validation Error: ${JSON.stringify(transformed)}`;
    }

    // This handles if we messed up the response schema
    else if (isResponseSerializationError(error)) {
      const transformed = transformValidationErrorMessages(error.cause.issues);

      statusCode = 500;
      internalErrorMessage = `ResponseValidationError: ${JSON.stringify(transformed)}`;
    }

    // Internal doc parse error (DB-to-model mismatch)
    else if (error instanceof InternalDocumentParseError) {
      statusCode = error.code;
      response = error.userResponse;
      internalErrorMessage = `InternalDocumentParseError: ${JSON.stringify(error)}`;
    }

    // Custom PerformYard application errors
    else if (error instanceof AppCustomError) {
      statusCode = error.statusCode;
      response = error.userResponse;
      internalErrorMessage = `${error.name}: ${error.message}`;

      if (error.debug) {
        internalErrorMessage += ` | Debug: ${JSON.stringify(error.debug)}`;
      }
    }
    // Fastify Sensible httpErrors
    else if (error instanceof HttpError) {
      statusCode = error.statusCode || 500;
      response = {
        message: error.message || "An error occurred.",
      };
      internalErrorMessage = `Fastify Sensible HttpError: ${error.message}`;
    }
  } catch (handlerError) {
    statusCode = 500;
    response = { message: "Unable to process error." };
    internalErrorMessage = `Error inside globalErrorHandler: ${JSON.stringify(handlerError)}`;
  }

  if (statusCode >= 500 && !(error instanceof AppCustomError)) {
    response.message = "Internal Server Error";
  }

  // Capture error in Sentry if it's a 5xx
  if (statusCode >= 500) {
    // captureErrorInSentry(fastify, error, request);
  }

  // Always log
  fastify.log.error({
    context: "GlobalErrorHandler",
    message: internalErrorMessage,
    statusCode,
    error,
  });

  return {
    statusCode,
    response,
  };
};
