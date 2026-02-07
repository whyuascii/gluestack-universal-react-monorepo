/**
 * Admin Portal API Configuration
 */

/**
 * Get the API URL for making requests.
 * Uses NEXT_PUBLIC_API_URL if available, otherwise falls back to localhost.
 */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.warn("[Admin] NEXT_PUBLIC_API_URL not set, using default http://localhost:3030");
    return "http://localhost:3030";
  }
  return url;
}

/**
 * API URL constant - use this instead of process.env directly
 */
export const API_URL = getApiUrl();

/**
 * Make an authenticated API request to the admin endpoints.
 */
export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_URL}/rpc${path}`;

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
