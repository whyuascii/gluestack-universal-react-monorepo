import { UserErrorResponse } from "service-contracts";

import { AppCustomError } from "./base";

/**
 * Thrown when the system encounters an error parsing a document from the database.
 */
export class InternalDocumentParseError extends AppCustomError {
    constructor(
        message = "Error parsing document",
        userResponse?: Partial<UserErrorResponse>,

        debug?: Record<string, unknown>
    ) {
        super({
            message,
            statusCode: 500,
            userResponse: {
                message:
                    "We couldn’t process the data correctly. Please contact support.",
                ...userResponse, // allows overriding message, details, or meta
            },
            debug,
        });
    }
}

/**
 * Thrown when the requested document is found but marked as deleted.
 */
export class DocumentIsDeletedError extends AppCustomError {
    constructor(
        message = "Document is deleted",
        userResponse: UserErrorResponse = {
            message: "The requested document is no longer available.",
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

export class DbAndModelOutOfSyncError extends InternalDocumentParseError {
    constructor(debug?: Record<string, unknown>) {
        super(
            "Malformed document: database and model are out of sync",
            {
                message: "We encountered a data issue. Please contact support.",
            },
            debug
        );
    }
}

export class UndefinedDocumentError extends InternalDocumentParseError {
    constructor(debug?: Record<string, unknown>) {
        super(
            "Malformed document: document is undefined",
            {
                message: "The requested data could not be found or is invalid.",
            },
            debug
        );
    }
}

/**
 * Thrown when a generic internal database error occurs.
 */
export class DatabaseError extends AppCustomError {
    constructor(debug?: Record<string, unknown>) {
        super({
            message: "Unhandled internal database error",
            statusCode: 500,
            userResponse: {
                message:
                    "We encountered a system error. Please try again or contact support.",
            },
            debug,
        });
    }
}
