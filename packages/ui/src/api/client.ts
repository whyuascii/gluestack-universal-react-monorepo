/**
 * Unified API Client for Web and Mobile
 *
 * Provides a consistent interface for making API calls across platforms
 */

import type { TUserErrorResponse } from "@app/service-contracts";

/**
 * Request options type (compatible with fetch API)
 */
type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/**
 * Get the API base URL from environment variables
 */
function getApiUrl(): string {
  // Next.js (web)
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Expo (mobile)
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback for development
  return "http://localhost:3030";
}

const API_BASE_URL = getApiUrl();

/**
 * API Client Error
 * Wraps structured error responses from the API
 */
export class ApiError extends Error {
  /**
   * HTTP status code
   */
  public readonly statusCode: number;

  /**
   * Structured user-facing error response from the API
   */
  public readonly userResponse?: TUserErrorResponse;

  /**
   * Raw response data
   */
  public readonly data?: unknown;

  constructor(
    message: string,
    statusCode: number,
    data?: unknown,
    userResponse?: TUserErrorResponse
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
    this.userResponse = userResponse;
  }
}

/**
 * Generic API request function
 */
async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Try to parse JSON response
    let data: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Try to extract TUserErrorResponse from the data
      let userResponse: TUserErrorResponse | undefined;
      if (data && typeof data === "object") {
        // Check if the response has the expected error structure
        if ("message" in data) {
          userResponse = data as TUserErrorResponse;
        }
      }

      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        data,
        userResponse
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      0,
      error,
      undefined
    );
  }
}

/**
 * API Client
 */
export const apiClient = {
  /**
   * GET request (public endpoint)
   */
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  /**
   * POST request (public endpoint)
   */
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT request (public endpoint)
   */
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH request (public endpoint)
   */
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request (public endpoint)
   */
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),

  /**
   * Authenticated API methods
   * Automatically includes credentials for cookie-based auth (Better Auth)
   */
  authenticated: {
    /**
     * GET request (authenticated)
     */
    get: <T>(endpoint: string, options?: RequestOptions) =>
      apiRequest<T>(endpoint, {
        ...options,
        method: "GET",
        credentials: "include",
      }),

    /**
     * POST request (authenticated)
     */
    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      apiRequest<T>(endpoint, {
        ...options,
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      }),

    /**
     * PUT request (authenticated)
     */
    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      apiRequest<T>(endpoint, {
        ...options,
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      }),

    /**
     * PATCH request (authenticated)
     */
    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      apiRequest<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      }),

    /**
     * DELETE request (authenticated)
     */
    delete: <T>(endpoint: string, options?: RequestOptions) =>
      apiRequest<T>(endpoint, {
        ...options,
        method: "DELETE",
        credentials: "include",
      }),
  },
};
