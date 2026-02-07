/**
 * AppFormField Component
 *
 * Form field component that integrates with TanStack Form.
 * Renders using @app/components primitives for cross-platform support.
 *
 * @example
 * ```typescript
 * <form.Field name="email">
 *   {(field) => (
 *     <AppFormField
 *       field={field}
 *       label="Email"
 *       placeholder="Enter your email"
 *       keyboardType="email-address"
 *       leftIcon={<Mail size={18} />}
 *     />
 *   )}
 * </form.Field>
 * ```
 */

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Input,
  InputField,
  InputSlot,
} from "@app/components";
import React from "react";

/**
 * Generic field type that works with TanStack Form's FieldApi
 * Uses a simplified interface to avoid complex generic constraints
 */
interface FormFieldState {
  value: unknown;
  meta: {
    errors: string[];
  };
}

interface FormField {
  state: FormFieldState;
  handleChange: (value: string) => void;
  handleBlur: () => void;
}

interface AppFormFieldProps {
  /** TanStack Form field instance - accepts any object matching FormField interface */
  field: FormField;
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
}

export function AppFormField({
  field,
  label,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  leftIcon,
  rightIcon,
}: AppFormFieldProps) {
  const errors = field.state.meta.errors;
  const hasError = errors && errors.length > 0;
  const errorMessage = hasError ? String(errors[0]) : undefined;

  return (
    <FormControl isInvalid={hasError} className="mb-4">
      <FormControlLabel>
        <FormControlLabelText className="text-typography-900 font-medium">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      <Input className="border-outline-300">
        {leftIcon && <InputSlot className="pl-3">{leftIcon}</InputSlot>}
        <InputField
          value={String(field.state.value ?? "")}
          onChangeText={(text: string) => field.handleChange(text)}
          onBlur={field.handleBlur}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className="text-typography-900"
        />
        {rightIcon && <InputSlot className="pr-3">{rightIcon}</InputSlot>}
      </Input>
      {errorMessage && (
        <FormControlError>
          <FormControlErrorText className="text-error-600">{errorMessage}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}
