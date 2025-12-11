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
