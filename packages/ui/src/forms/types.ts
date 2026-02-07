/**
 * Form Types
 *
 * Type definitions for TanStack Form integration.
 * Uses Zod schemas from @app/core-contract for validation.
 */

import type { z } from "zod";

/**
 * Options for useAppForm hook
 */
export interface UseAppFormOptions<TSchema extends z.ZodType> {
  /** Zod schema for validation (use from @app/core-contract) */
  schema: TSchema;
  /** Default values for form fields */
  defaultValues?: Partial<z.infer<TSchema>>;
  /** Called when form is submitted with valid data */
  onSubmit: (data: z.infer<TSchema>) => Promise<void> | void;
  /** Optional async validation (e.g., check if email exists) */
  onValidateAsync?: (data: z.infer<TSchema>) => Promise<Record<string, string> | undefined>;
}

/**
 * Props for AppFormField component
 */
export interface AppFormFieldProps {
  /** Field name (must match schema key) */
  name: string;
  /** Field label */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Hide text input (for passwords) */
  secureTextEntry?: boolean;
  /** Keyboard type */
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  /** Auto capitalize behavior */
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  /** Left icon element */
  leftIcon?: React.ReactElement;
  /** Right icon element */
  rightIcon?: React.ReactElement;
  /** Additional class name */
  className?: string;
}
