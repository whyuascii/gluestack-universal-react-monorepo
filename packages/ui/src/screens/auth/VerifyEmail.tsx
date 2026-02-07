"use client";

import { authClient } from "@app/auth";
import {
  Box,
  Button,
  ButtonText,
  ButtonSpinner,
  Heading,
  HStack,
  Link,
  LinkText,
  Text,
  VStack,
} from "@app/components";
import { Mail, RefreshCw, LogOut, ArrowLeft } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import { useAccessibilityAnnounce } from "../../hooks/useAccessibilityAnnounce";

interface VerifyEmailScreenProps {
  /** Email address (optional - if not provided, shows generic message) */
  email?: string;
  onSignOut?: () => void;
  onBackToLogin?: () => void;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({
  email,
  onSignOut,
  onBackToLogin,
}) => {
  const { t } = useTranslation("auth");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const announce = useAccessibilityAnnounce();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      const errorMessage = t("verifyEmail.noEmailForResend");
      setError(errorMessage);
      announce(errorMessage);
      return;
    }

    setCountdown(60);
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/verify-email",
      });
      const successMessage = t("verifyEmail.resendSuccess");
      setSuccess(successMessage);
      announce(successMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("verifyEmail.resendFailed");
      setError(errorMessage);
      announce(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="px-6 md:px-12"
        showsVerticalScrollIndicator={false}
      >
        <Box className="w-full max-w-md self-center py-8">
          {/* Card */}
          <Box className="bg-background-0 rounded-3xl p-6 md:p-8 shadow-hard-2 border border-outline-100">
            {/* Icon */}
            <VStack space="md" className="items-center mb-6">
              <Box className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center">
                <Box className="w-14 h-14 rounded-full bg-primary-100 items-center justify-center">
                  <Mail size={28} className="text-primary-500" />
                </Box>
              </Box>
            </VStack>

            {/* Title & Message */}
            <VStack space="sm" className="items-center mb-6">
              <Heading size="xl" className="text-typography-900 text-center">
                {t("auth:verifyEmail.title")}
              </Heading>
              <Text className="text-typography-500 text-center text-base leading-relaxed">
                {email ? (
                  <>
                    {t("auth:verifyEmail.message")}{" "}
                    <Text className="font-semibold text-typography-700">{email}</Text>
                  </>
                ) : (
                  t("auth:verifyEmail.genericMessage")
                )}
              </Text>
            </VStack>

            {/* Error/Success Messages */}
            {error && (
              <Box className="bg-error-50 border border-error-200 p-4 rounded-2xl mb-4">
                <Text className="text-error-700 text-center text-sm font-medium">{error}</Text>
              </Box>
            )}
            {success && (
              <Box className="bg-success-50 border border-success-200 p-4 rounded-2xl mb-4">
                <Text className="text-success-700 text-center text-sm font-medium">{success}</Text>
              </Box>
            )}

            {/* Resend Button - only show if we have the email */}
            {email && (
              <Button
                size="lg"
                action="secondary"
                variant="outline"
                onPress={handleResend}
                isDisabled={countdown > 0 || isLoading}
                className="rounded-2xl h-12 mb-4"
                testID="verify-email-resend-button"
              >
                {isLoading ? (
                  <ButtonSpinner className="text-primary-500" />
                ) : (
                  <HStack space="sm" className="items-center">
                    <RefreshCw size={18} className="text-primary-500" />
                    <ButtonText className="font-medium text-primary-500">
                      {countdown > 0
                        ? `${t("auth:verifyEmail.resendIn")} ${countdown}s`
                        : t("auth:verifyEmail.resendButton")}
                    </ButtonText>
                  </HStack>
                )}
              </Button>
            )}

            {/* Instructions */}
            <Box className="bg-background-50 rounded-2xl p-4 mb-6">
              <Text className="text-typography-500 text-sm text-center">
                {t("auth:verifyEmail.checkSpam")}
              </Text>
            </Box>

            {/* Actions */}
            <VStack space="md" className="items-center">
              {onSignOut && (
                <Link onPress={onSignOut}>
                  <HStack space="sm" className="items-center">
                    <LogOut size={16} className="text-typography-500" />
                    <LinkText className="text-typography-500 font-medium">
                      {t("auth:verifyEmail.signOut")}
                    </LinkText>
                  </HStack>
                </Link>
              )}

              {onBackToLogin && !onSignOut && (
                <Link onPress={onBackToLogin}>
                  <HStack space="sm" className="items-center">
                    <ArrowLeft size={16} className="text-primary-500" />
                    <LinkText className="text-primary-500 font-medium">
                      {t("auth:verifyEmail.backToLogin")}
                    </LinkText>
                  </HStack>
                </Link>
              )}
            </VStack>
          </Box>
        </Box>
      </ScrollView>
    </View>
  );
};
