"use client";

import { auth } from "@app/auth";
import { Box, VStack, Heading, Text, Button, ButtonText, Pressable } from "@app/components";
import { AuthCard } from "@app/components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface VerifyEmailScreenProps {
  email: string;
  onSignOut?: () => void;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ email, onSignOut }) => {
  const { t } = useTranslation("auth");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setCountdown(60);
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await auth.sendVerificationEmail(email);
      setSuccess("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex-1 justify-center bg-background-0 p-4">
      <AuthCard>
        <VStack space="lg" className="items-center">
          {/* Email Icon */}
          <Box className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
            <Text size="3xl">✉️</Text>
          </Box>

          {/* Title & Message */}
          <VStack space="sm" className="items-center">
            <Heading size="xl" className="text-typography-900 text-center">
              {t("auth:verifyEmail.title")}
            </Heading>
            <Text size="sm" className="text-typography-600 text-center">
              {t("auth:verifyEmail.message")} <Text className="font-semibold">{email}</Text>
            </Text>
          </VStack>

          {/* Error/Success Messages */}
          {error && (
            <Box className="p-3 bg-error-100 rounded-lg">
              <Text size="sm" className="text-error-700 text-center">
                {error}
              </Text>
            </Box>
          )}
          {success && (
            <Box className="p-3 bg-success-100 rounded-lg">
              <Text size="sm" className="text-success-700 text-center">
                {success}
              </Text>
            </Box>
          )}

          {/* Resend Button */}
          <Button
            variant="outline"
            onPress={handleResend}
            isDisabled={countdown > 0 || isLoading}
            className="w-full"
          >
            <ButtonText>
              {countdown > 0
                ? `${t("auth:verifyEmail.resendIn")} ${countdown}s`
                : t("auth:verifyEmail.resendButton")}
            </ButtonText>
          </Button>

          {/* Sign Out Link */}
          {onSignOut && (
            <Pressable onPress={onSignOut}>
              <Text size="sm" className="text-primary-600">
                {t("auth:verifyEmail.signOut")}
              </Text>
            </Pressable>
          )}
        </VStack>
      </AuthCard>
    </Box>
  );
};
