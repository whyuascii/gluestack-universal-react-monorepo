import { UserErrorResponse } from "service-contracts";

import { AppCustomError } from "./base";

export class LambdaInvocationError extends AppCustomError {
    constructor(
        message = "Error invoking Lambda function",
        userResponse: UserErrorResponse = {
            message:
                "We encountered an issue while invoking a service. Please try again.",
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

export class SecretManagerError extends AppCustomError {
    constructor(
        message = "Error fetching secret from AWS Secrets Manager",
        userResponse: UserErrorResponse = {
            message:
                "We encountered an issue while fetching a secret from AWS Secrets Manager. Please try again.",
        },
        debug?: Record<string, unknown>
    ) {
        super({
            message,
            statusCode: 404, // If we are getting this error, it means the secret does not exist
            userResponse,
            debug,
        });
    }
}
