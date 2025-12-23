import { z } from "zod";

/**
 * Authentication-related contracts for API requests and responses
 */

// Sign In (Login) Request
export const SignInRequest = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type TSignInRequest = z.infer<typeof SignInRequest>;

// Sign Up (Register) Request
export const SignUpRequest = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type TSignUpRequest = z.infer<typeof SignUpRequest>;

// Authentication Response (returned after successful login/signup)
export const AuthenticationResponse = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  session: z.object({
    token: z.string(),
    expiresAt: z.date(),
  }),
});

export type TAuthenticationResponse = z.infer<typeof AuthenticationResponse>;

// Me Response (current user session info)
export const MeResponse = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
  }),
  session: z.object({
    id: z.string(),
    expiresAt: z.date(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  }),
});

export type TMeResponse = z.infer<typeof MeResponse>;

// Auth Error Response
export const AuthErrorResponse = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.array(z.string()).optional(),
});

export type TAuthErrorResponse = z.infer<typeof AuthErrorResponse>;

// ============================================================================
// Better Auth Types
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

/**
 * Forget Password Request
 */
export const ForgetPasswordRequest = z.object({
  email: z.string().email("Invalid email address"),
  redirectTo: z.string().optional(),
});

export type TForgetPasswordRequest = z.infer<typeof ForgetPasswordRequest>;

/**
 * Reset Password Request
 */
export const ResetPasswordRequest = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type TResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;

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
  sendVerificationEmail: (params: { email: string }) => Promise<void>;
  useSession: () => any;
}
