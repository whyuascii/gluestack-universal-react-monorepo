"use client";

import { authClient } from "@app/auth";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Icon,
  Link,
  LinkText,
} from "@app/components";
import {
  CheckCircleIcon,
  CloseCircleIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  MailIcon,
} from "@app/components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface VerifyEmailTokenScreenProps {
  token: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export const VerifyEmailTokenScreen: React.FC<VerifyEmailTokenScreenProps> = ({
  token,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation(["auth", "common"]);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await (authClient as any).verifyEmail({
          query: {
            token,
          },
        });

        setStatus("success");

        // Auto-redirect after 2 seconds
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } catch (err) {
        console.error("[VerifyEmailToken] Verification failed");
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : t("auth:verifyEmailToken.errorMessage")
        );
        onError?.();
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setErrorMessage(t("auth:verifyEmailToken.noToken"));
    }
  }, [token, onSuccess, onError]);

  const handleResend = () => {
    setStatus("verifying");
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  return (
    <Box className="flex-1 justify-center items-center p-6 bg-surface-canvas">
      {/* Main Container */}
      <Box className="w-full max-w-md">
        {/* Logo */}
        <VStack space="lg" className="items-center mb-8">
          <HStack space="sm" className="items-center">
            <Box className="w-10 h-10 rounded-full items-center justify-center shadow-md bg-primary-500">
              <Text className="font-bold text-2xl text-white">A</Text>
            </Box>
            <Text className="text-4xl font-bold text-content-emphasis">{t("common:app.name")}</Text>
          </HStack>
        </VStack>

        {/* Card */}
        <Box className="bg-surface rounded-2xl p-8 md:p-12 shadow-lg border border-outline-100 items-center min-h-[400px] justify-center">
          {status === "verifying" && (
            <VStack space="lg" className="items-center">
              <Box className="relative w-20 h-20">
                <Box className="absolute inset-0 rounded-full border-4 border-primary-100" />
                <Box className="absolute inset-0 rounded-full animate-spin border-4 border-primary-500 border-t-transparent" />
                <Box className="absolute inset-0 items-center justify-center">
                  <Icon as={MailIcon} size="xl" className="text-primary-500" />
                </Box>
              </Box>
              <Heading size="xl" className="text-center text-content-emphasis">
                {t("auth:verifyEmail.verifying")}
              </Heading>
              <Text size="sm" className="text-center max-w-xs text-content-muted">
                {t("auth:verifyEmail.verifyingSubtitle")}
              </Text>
            </VStack>
          )}

          {status === "success" && (
            <VStack space="lg" className="items-center">
              <Box className="w-20 h-20 rounded-full items-center justify-center bg-success-50">
                <Icon as={CheckCircleIcon} size="xl" className="text-success-500" />
              </Box>
              <Heading size="xl" className="text-center text-content-emphasis">
                {t("auth:verifyEmail.verified")}
              </Heading>
              <Text size="sm" className="text-center max-w-xs mb-8 text-content-muted">
                {t("auth:verifyEmail.verifiedMessage")}
              </Text>
              <Button onPress={onSuccess} className="w-full rounded-full bg-primary-500">
                <HStack space="sm" className="items-center justify-center">
                  <ButtonText className="text-white font-bold text-lg">
                    {t("auth:verifyEmail.continueButton")}
                  </ButtonText>
                  <Icon as={ArrowRightIcon} size="sm" className="text-white" />
                </HStack>
              </Button>
            </VStack>
          )}

          {status === "error" && (
            <VStack space="lg" className="items-center">
              <Box className="w-20 h-20 rounded-full items-center justify-center bg-error-50">
                <Icon as={CloseCircleIcon} size="xl" className="text-error-500" />
              </Box>
              <Heading size="xl" className="text-center text-content-emphasis">
                {t("auth:verifyEmail.failedTitle")}
              </Heading>
              <Text size="sm" className="text-center max-w-xs mb-8 text-content-muted">
                {t("auth:verifyEmail.errorMessage")}
              </Text>
              <Button onPress={handleResend} className="w-full rounded-full bg-secondary-500">
                <HStack space="sm" className="items-center justify-center">
                  <ButtonText className="font-bold text-lg text-white">
                    {t("auth:verifyEmail.resendVerification")}
                  </ButtonText>
                  <Icon as={RefreshCwIcon} size="sm" className="text-white" />
                </HStack>
              </Button>
              <Box className="mt-6">
                <Link onPress={onError}>
                  <LinkText className="font-semibold text-sm text-content-muted">
                    {t("auth:verifyEmail.backToLogin")}
                  </LinkText>
                </Link>
              </Box>
            </VStack>
          )}
        </Box>

        {/* Decorative bottom text */}
        <Text className="text-center mt-8 text-xl text-content-muted opacity-60">
          {t("auth:verifyEmail.bottomText")}
        </Text>
      </Box>
    </Box>
  );
};
