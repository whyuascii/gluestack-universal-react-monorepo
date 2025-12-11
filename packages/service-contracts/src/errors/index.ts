import { z } from "zod";

/**
 * Zod schema representing a structured error response safe for end-users.
 *
 * This format is returned from APIs or UI clients to communicate issues
 * in a clear and controlled way, avoiding exposure of sensitive system details.
 */
export const UserErrorResponse = z.object({
  /**
   * A friendly, high-level message describing what went wrong.
   *
   * This should be clear, human-readable, and suitable for end-user display.
   * Example: "Some users already exist."
   */
  message: z.string(),

  /**
   * Optional list of contextual details for the error.
   *
   * Example: if `message` is "Some users already exist", this might be
   * ["email1@example.com", "email4@example.com"].
   */
  details: z.array(z.string()).optional(),

  /**
   * Optional key-value pairs describing field-specific issues or additional context.
   *
   * This is typically used for:
   * - Form validation errors mapped to specific fields
   * - High-level, user-safe metadata (e.g., mappings or identifiers)
   * - Guidance that can be displayed inline or in tooltips
   *
   * Examples:
   * - { email: "Already in use", username: "Required" }
   * - { mappingSource: "Field 'Employee ID' was mapped to 'ID' in the system" }
   */
  meta: z.record(z.string(), z.string()).optional(),
});

/**
 * TypeScript type inferred from the Zod schema.
 */
export type TUserErrorResponse = z.infer<typeof UserErrorResponse>;
