"use client";

import { auth } from "@app/auth";
import { Box, VStack, Heading, Text } from "@app/components";
import { AuthCard, FormField, PrimaryButton } from "@app/components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface ResetPasswordScreenProps {
  token: string;
  onSuccess?: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ token, onSuccess }) => {
  const { t } = useTranslation(["auth", "validation"]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleSubmit = async () => {
    // Reset errors
    setErrors({});

    // Validation
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
      await auth.resetPassword(token, newPassword);
      onSuccess?.();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex-1 justify-center bg-background-0 p-4">
      <AuthCard>
        <VStack space="lg">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-900 text-center">
              {t("auth:resetPassword.title")}
            </Heading>
            <Text size="sm" className="text-typography-600 text-center">
              {t("auth:resetPassword.subtitle")}
            </Text>
          </VStack>

          <VStack space="md">
            <FormField
              label={t("auth:resetPassword.newPassword")}
              value={newPassword}
              onChangeText={setNewPassword}
              error={errors.newPassword || errors.general}
              placeholder={t("auth:resetPassword.newPasswordPlaceholder")}
              secureTextEntry
            />

            <FormField
              label={t("auth:resetPassword.confirmPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder={t("auth:resetPassword.confirmPasswordPlaceholder")}
              secureTextEntry
            />

            <PrimaryButton onPress={handleSubmit} isLoading={isLoading} isDisabled={isLoading}>
              {t("auth:resetPassword.submit")}
            </PrimaryButton>
          </VStack>
        </VStack>
      </AuthCard>
    </Box>
  );
};
