"use client";

import { authClient } from "@app/auth";
import {
  Box,
  Button,
  ButtonText,
  ButtonSpinner,
  FormField,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from "@app/components";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react-native";
import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, KeyboardAvoidingView, Platform, View, type TextInput } from "react-native";
import { useAccessibilityAnnounce } from "../../hooks/useAccessibilityAnnounce";

interface ResetPasswordScreenProps {
  token: string;
  onSuccess?: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ token, onSuccess }) => {
  const { t } = useTranslation(["auth", "validation"]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const confirmPasswordRef = useRef<TextInput>(null);
  const announce = useAccessibilityAnnounce();

  const handleNewPasswordSubmit = useCallback(() => {
    confirmPasswordRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    setErrors({});

    const newErrors: typeof errors = {};
    if (!newPassword || newPassword.length < 8) {
      newErrors.newPassword = t("validation:password.minLength", { count: 8 });
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("validation:password.mismatch");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authClient.resetPassword({
        newPassword,
        token,
      });
      announce(t("auth:resetPassword.success"));
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("auth:resetPassword.failed");
      setErrors({ general: errorMessage });
      announce(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6 md:px-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Box className="w-full max-w-md self-center py-8">
            {/* Header */}
            <VStack space="sm" className="items-center mb-8">
              <Box className="w-16 h-16 rounded-2xl bg-primary-500 items-center justify-center mb-2 shadow-lg">
                <ShieldCheck size={32} color="#ffffff" />
              </Box>
              <Heading size="2xl" className="text-typography-900 text-center">
                {t("auth:resetPassword.title")}
              </Heading>
              <Text className="text-typography-500 text-center text-base">
                {t("auth:resetPassword.subtitle")}
              </Text>
            </VStack>

            {/* Card */}
            <Box className="bg-background-0 rounded-3xl p-6 md:p-8 shadow-hard-2 border border-outline-100">
              {/* Error Message */}
              {errors.general && (
                <Box className="bg-error-50 border border-error-200 p-4 rounded-2xl mb-6">
                  <Text className="text-error-700 text-center text-sm font-medium">
                    {errors.general}
                  </Text>
                </Box>
              )}

              {/* Form Fields */}
              <VStack space="lg">
                <FormField
                  label={t("auth:resetPassword.newPassword")}
                  error={errors.newPassword}
                  leftIcon={<Lock size={20} className="text-typography-400" />}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={8}
                      accessibilityLabel={
                        showPassword
                          ? t("auth:resetPassword.hidePassword")
                          : t("auth:resetPassword.showPassword")
                      }
                      accessibilityRole="button"
                      className="p-1"
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-typography-400" />
                      ) : (
                        <Eye size={20} className="text-typography-400" />
                      )}
                    </Pressable>
                  }
                  input={{
                    placeholder: t("auth:resetPassword.newPasswordPlaceholder"),
                    value: newPassword,
                    onChangeText: setNewPassword,
                    secureTextEntry: !showPassword,
                    autoCapitalize: "none",
                    returnKeyType: "next",
                    onSubmitEditing: handleNewPasswordSubmit,
                    blurOnSubmit: false,
                  }}
                  testID="reset-password-new-input"
                />

                <FormField
                  ref={confirmPasswordRef}
                  label={t("auth:resetPassword.confirmPassword")}
                  error={errors.confirmPassword}
                  leftIcon={<Lock size={20} className="text-typography-400" />}
                  input={{
                    placeholder: t("auth:resetPassword.confirmPasswordPlaceholder"),
                    value: confirmPassword,
                    onChangeText: setConfirmPassword,
                    secureTextEntry: !showPassword,
                    autoCapitalize: "none",
                    returnKeyType: "done",
                    onSubmitEditing: handleSubmit,
                  }}
                  testID="reset-password-confirm-input"
                />

                {/* Submit Button */}
                <Button
                  size="xl"
                  action="primary"
                  onPress={handleSubmit}
                  isDisabled={isLoading}
                  className="rounded-2xl h-14 mt-2"
                  testID="reset-password-submit-button"
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <>
                      <ButtonText className="font-semibold text-base">
                        {t("auth:resetPassword.submit")}
                      </ButtonText>
                      <Icon as={ArrowRight} size="md" className="text-white ml-2" />
                    </>
                  )}
                </Button>
              </VStack>

              {/* Password Requirements */}
              <Box className="mt-6 p-4 bg-background-50 rounded-2xl">
                <Text className="text-typography-500 text-sm font-medium mb-2">
                  {t("auth:resetPassword.requirements")}
                </Text>
                <VStack space="xs">
                  <HStack space="sm" className="items-center">
                    <Box className="w-1.5 h-1.5 rounded-full bg-typography-400" />
                    <Text className="text-typography-400 text-sm">
                      {t("auth:resetPassword.requirementLength")}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
