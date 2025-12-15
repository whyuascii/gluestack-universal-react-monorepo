# API Routes Documentation

Complete documentation for all API endpoints with request/response examples.

## Base URL

```
http://localhost:3030
```

All API routes are prefixed with `/api/v1` unless otherwise noted.

## Authentication

Protected routes require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <session_token>
```

## Health & System Routes

### GET /health

Check API server health status.

**Response 200:**

```json
{
  "healthy": true,
  "gitHash": "abc123...",
  "gitHashShort": "abc123",
  "gitBranch": "main",
  "environment": "development"
}
```

### GET /api/versions

Get API version information.

**Response 200:**

```json
{
  "version": "1.0.0",
  "apiVersion": "v1"
}
```

### GET /documentation

Interactive Swagger UI for API documentation.

### GET /documentation/json

OpenAPI specification in JSON format.

## Authentication Routes

### POST /api/v1/auth/signup

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response 201 (Success):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "image": null
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-12-18T00:00:00.000Z"
  }
}
```

**Response 400 (Error):**

```json
{
  "message": "Email already exists",
  "code": "EMAIL_EXISTS"
}
```

**Response 500 (Error):**

```json
{
  "message": "Internal server error",
  "code": "SIGNUP_ERROR"
}
```

### POST /api/v1/auth/signin

Sign in with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response 200 (Success):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "image": null
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-12-18T00:00:00.000Z"
  }
}
```

**Response 401 (Error):**

```json
{
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

**Response 500 (Error):**

```json
{
  "message": "Internal server error",
  "code": "SIGNIN_ERROR"
}
```

### POST /api/v1/auth/signout

Sign out and invalidate current session.

**Headers:**

```
Authorization: Bearer <session_token>
```

**Response 200 (Success):**

```json
{
  "message": "Successfully signed out"
}
```

**Response 401 (Error):**

```json
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

## User Routes

### GET /api/v1/me

Get current authenticated user's information.

**Headers:**

```
Authorization: Bearer <session_token>
```

**Response 200 (Success):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "image": null
  },
  "session": {
    "id": "session_id",
    "expiresAt": "2025-12-18T00:00:00.000Z"
  }
}
```

**Response 401 (Error):**

```json
{
  "message": "Unauthorized - No valid session",
  "code": "UNAUTHORIZED"
}
```

### GET /api/v1/users

List all users (paginated).

**Headers:**

```
Authorization: Bearer <session_token>
```

**Query Parameters:**

```
?page=1&limit=10
```

**Response 200 (Success):**

```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": false,
      "createdAt": "2025-12-11T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### POST /api/v1/users

Create a new user (admin only).

**Headers:**

```
Authorization: Bearer <session_token>
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "tenantId": "tenant_id"
}
```

**Response 201 (Success):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "emailVerified": false,
  "createdAt": "2025-12-11T00:00:00.000Z"
}
```

### GET /api/v1/users/:id

Get a specific user by ID.

**Headers:**

```
Authorization: Bearer <session_token>
```

**Response 200 (Success):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "emailVerified": false,
  "createdAt": "2025-12-11T00:00:00.000Z",
  "updatedAt": "2025-12-11T00:00:00.000Z"
}
```

**Response 404 (Error):**

```json
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```

### PUT /api/v1/users/:id

Update a user's information.

**Headers:**

```
Authorization: Bearer <session_token>
```

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response 200 (Success):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "emailVerified": false,
  "updatedAt": "2025-12-11T00:00:00.000Z"
}
```

### DELETE /api/v1/users/:id

Delete a user account.

**Headers:**

```
Authorization: Bearer <session_token>
```

**Response 200 (Success):**

```json
{
  "message": "User deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 404 (Error):**

```json
{
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional error details
}
```

### Common Error Codes

| Code                  | HTTP Status | Description                             |
| --------------------- | ----------- | --------------------------------------- |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication token |
| `FORBIDDEN`           | 403         | Insufficient permissions                |
| `NOT_FOUND`           | 404         | Resource not found                      |
| `VALIDATION_ERROR`    | 400         | Invalid request data                    |
| `EMAIL_EXISTS`        | 400         | Email already registered                |
| `INVALID_CREDENTIALS` | 401         | Invalid email or password               |
| `SIGNUP_ERROR`        | 500         | Error during signup                     |
| `SIGNIN_ERROR`        | 500         | Error during signin                     |
| `SIGNOUT_ERROR`       | 500         | Error during signout                    |

## Rate Limiting

(Not currently implemented - coming soon)

## Versioning

The API uses URL path versioning:

- Current version: `v1`
- Base path: `/api/v1`
- Future versions will be `/api/v2`, etc.

## CORS

CORS is configured to allow requests from:

- `http://localhost:3000` (web app)
- `http://localhost:8081` (mobile app)
- Production domains (configured via environment variables)

## Related Documentation

- [Error Handling](./error-handling.md) - Error handling details
- [Testing](./testing.md) - API testing guide
- [Authentication Package](../packages/auth.md) - Auth implementation details
- [Service Contracts](../packages/service-contracts.md) - Request/response types
