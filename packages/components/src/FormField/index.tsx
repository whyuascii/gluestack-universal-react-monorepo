import React, { useId, forwardRef } from "react";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "../form-control";
import { Input, InputField, InputSlot } from "../input";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoComplete?: string;
  // Keyboard navigation props
  returnKeyType?: "done" | "go" | "next" | "search" | "send" | "default";
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

interface FormFieldProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  // Support both flat props and input object for flexibility
  input?: InputProps;
  // Flat props (backwards compatibility)
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  // Keyboard navigation props
  returnKeyType?: "done" | "go" | "next" | "search" | "send" | "default";
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  // Accessibility props
  accessibilityHint?: string;
  testID?: string;
}

export const FormField = forwardRef<unknown, FormFieldProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      input,
      // Flat props fallback
      value: flatValue,
      onChangeText: flatOnChangeText,
      placeholder: flatPlaceholder,
      secureTextEntry: flatSecureTextEntry,
      autoCapitalize: flatAutoCapitalize,
      keyboardType: flatKeyboardType,
      // Keyboard navigation props
      returnKeyType: flatReturnKeyType,
      onSubmitEditing: flatOnSubmitEditing,
      blurOnSubmit: flatBlurOnSubmit,
      accessibilityHint,
      testID,
    },
    ref
  ) => {
    // Generate unique IDs for accessibility linking
    const baseId = useId();
    const fieldId = `field-${baseId}`;
    const labelId = `${fieldId}-label`;
    const errorId = `${fieldId}-error`;

    // Prefer input object if provided, otherwise use flat props
    const value = input?.value ?? flatValue ?? "";
    const onChangeText = input?.onChangeText ?? flatOnChangeText ?? (() => {});
    const placeholder = input?.placeholder ?? flatPlaceholder;
    const secureTextEntry = input?.secureTextEntry ?? flatSecureTextEntry;
    const autoCapitalize = input?.autoCapitalize ?? flatAutoCapitalize ?? "none";
    const keyboardType = input?.keyboardType ?? flatKeyboardType ?? "default";
    const returnKeyType = input?.returnKeyType ?? flatReturnKeyType;
    const onSubmitEditing = input?.onSubmitEditing ?? flatOnSubmitEditing;
    const blurOnSubmit = input?.blurOnSubmit ?? flatBlurOnSubmit;

    const hasError = !!error;

    return (
      <FormControl isInvalid={hasError} className="mb-4">
        <FormControlLabel nativeID={labelId}>
          <FormControlLabelText className="text-typography-900 font-medium">
            {label}
          </FormControlLabelText>
        </FormControlLabel>
        <Input
          className="border-outline-300"
          isInvalid={hasError}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        >
          {leftIcon && <InputSlot className="pl-3">{leftIcon}</InputSlot>}
          <InputField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={ref as any}
            nativeID={fieldId}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
            accessibilityLabel={label}
            accessibilityHint={accessibilityHint}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            testID={testID}
            className="text-typography-900"
          />
          {rightIcon && <InputSlot className="pr-3">{rightIcon}</InputSlot>}
        </Input>
        {hasError && (
          <FormControlError>
            <FormControlErrorText
              nativeID={errorId}
              role="alert"
              aria-live="assertive"
              className="text-error-600"
            >
              {error}
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>
    );
  }
);

FormField.displayName = "FormField";
