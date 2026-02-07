import { X } from "lucide-react-native";
import React, { useState } from "react";
import { View, Platform } from "react-native";
import { HStack } from "../hstack";
import { Input, InputField, InputSlot, InputIcon } from "../input";
import { Pressable } from "../pressable";
import { Text } from "../text";
import { VStack } from "../vstack";

export interface EmailChipInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  maxEmails?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const EmailChipInput: React.FC<EmailChipInputProps> = ({
  emails,
  onChange,
  maxEmails = 10,
  placeholder = "Enter email and press Enter",
  disabled = false,
  error,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | undefined>();

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Validation
    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      setInputError("Invalid email format");
      return;
    }

    if (emails.includes(trimmedEmail)) {
      setInputError("Email already added");
      return;
    }

    if (emails.length >= maxEmails) {
      setInputError(`Maximum ${maxEmails} emails allowed`);
      return;
    }

    // Add email
    onChange([...emails, trimmedEmail]);
    setInputValue("");
    setInputError(undefined);
  };

  const removeEmail = (emailToRemove: string) => {
    onChange(emails.filter((e) => e !== emailToRemove));
  };

  const handleKeyPress = (e: any) => {
    if (Platform.OS === "web") {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addEmail(inputValue);
      }
    }
  };

  const handleSubmitEditing = () => {
    if (Platform.OS !== "web") {
      addEmail(inputValue);
    }
  };

  const isMaxReached = emails.length >= maxEmails;

  return (
    <VStack space="sm">
      {/* Email chips */}
      {emails.length > 0 && (
        <HStack space="xs" className="flex-wrap">
          {emails.map((email) => (
            <View
              key={email}
              className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5 mb-2"
            >
              <Text className="text-sm text-primary-900 mr-1">{email}</Text>
              <Pressable onPress={() => removeEmail(email)} disabled={disabled} className="ml-1">
                <X size={14} className="text-primary-900" />
              </Pressable>
            </View>
          ))}
        </HStack>
      )}

      {/* Input field */}
      <Input
        variant="outline"
        size="md"
        isDisabled={disabled || isMaxReached}
        isInvalid={!!(inputError || error)}
      >
        <InputField
          placeholder={isMaxReached ? `Maximum ${maxEmails} emails reached` : placeholder}
          value={inputValue}
          onChangeText={setInputValue}
          onKeyPress={handleKeyPress}
          onSubmitEditing={handleSubmitEditing}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          editable={!disabled && !isMaxReached}
        />
      </Input>

      {/* Error message */}
      {(inputError || error) && (
        <Text className="text-error-600 text-sm">{inputError || error}</Text>
      )}
    </VStack>
  );
};
