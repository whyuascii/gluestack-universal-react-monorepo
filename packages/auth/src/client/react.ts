import { createAuthClient } from "better-auth/react";

/**
 * Better Auth React client for Next.js web app
 * Provides hooks for authentication: useSession, useSignIn, useSignOut, etc.
 *
 * Usage in Next.js app:
 * ```tsx
 * import { authClient, useSession } from "auth/client/react";
 *
 * function MyComponent() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return <div>Not authenticated</div>;
 *
 *   return <div>Hello {session.user.name}</div>;
 * }
 * ```
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030",
  fetchOptions: {
    credentials: "include",
  },
});

// Re-export all hooks from the client
export const { useSession, signIn, signOut, signUp } = authClient;

// Export the entire client for advanced usage
export default authClient;
