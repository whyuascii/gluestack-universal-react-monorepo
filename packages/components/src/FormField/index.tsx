import React from "react";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "../form-control";
import { Input, InputField } from "../input";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType = "default",
}) => {
  return (
    <FormControl isInvalid={!!error} className="mb-4">
      <FormControlLabel>
        <FormControlLabelText className="text-typography-900 font-medium">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      <Input className="border-outline-300">
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className="text-typography-900"
        />
      </Input>
      {error && (
        <FormControlError>
          <FormControlErrorText className="text-error-600">{error}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
