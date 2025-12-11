/**
 * Shared types for authentication
 */

// Re-export Better Auth types
export type { User, Session, Account, Verification } from "better-auth/types";

// Custom auth types can be added here
export interface AuthError {
  code: string;
  message: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}
