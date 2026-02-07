/**
 * Better Auth Types
 *
 * Utility types for Better Auth integration.
 * NOT for API request/response schemas - those are in @app/core-contract.
 */

// Re-export Better Auth types
export type {
  User,
  Session as BetterAuthSessionType,
  Account,
  Verification,
} from "better-auth/types";

// ============================================================================
// Better Auth User & Session Types
// ============================================================================

/**
 * Better Auth User type
 * Matches the user object from Better Auth's database schema
 */
export interface BetterAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Better Auth Session type
 */
export interface BetterAuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Better Auth Request type
 * Generic request object passed to Better Auth callbacks
 */
export interface BetterAuthRequest {
  headers: Headers;
  method: string;
  url: string;
  body?: any;
}

// ============================================================================
// Better Auth Callback Parameter Types
// ============================================================================

/**
 * Parameters for sendResetPassword callback
 */
export interface SendResetPasswordParams {
  user: BetterAuthUser;
  url: string;
  token: string;
}

/**
 * Parameters for sendVerificationEmail callback
 */
export interface SendVerificationEmailParams {
  user: BetterAuthUser;
  url: string;
  token: string;
}

// ============================================================================
// Better Auth Client Type
// ============================================================================

/**
 * Extended Auth Client type that includes all Better Auth methods
 * This extends the base Better Auth client with typed method signatures
 */
export interface ExtendedAuthClient {
  signIn: {
    email: (credentials: { email: string; password: string }) => Promise<any>;
    social: (params: { provider: string; callbackURL?: string }) => Promise<any>;
  };
  signUp: {
    email: (data: { email: string; password: string; name: string }) => Promise<any>;
  };
  signOut: () => Promise<void>;
  forgetPassword: (params: { email: string; redirectTo?: string }) => Promise<void>;
  resetPassword: (params: { token: string; newPassword: string }) => Promise<void>;
  sendVerificationEmail: (params: { email: string; callbackURL?: string }) => Promise<void>;
  getSession: () => Promise<{ data: { user: BetterAuthUser; session: BetterAuthSession } | null }>;
  useSession: () => any;
}

// ============================================================================
// Credential Types
// ============================================================================

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}
