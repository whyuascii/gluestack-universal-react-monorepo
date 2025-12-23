"use client";

import { auth, authClient } from "@app/auth";
import { VStack, HStack, Heading, Text, Link, LinkText, Box, Pressable } from "@app/components";
import {
  AuthCard,
  FormField,
  PrimaryButton,
  SocialAuthButton,
  ForgotPasswordModal,
} from "@app/components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignup, onLoginSuccess }) => {
  const { t } = useTranslation(["auth", "validation"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Reset errors
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("validation:email.invalid");
    }
    if (!password || password.length < 8) {
      newErrors.password = t("validation:password.minLength", { count: 8 });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authClient.signIn.email({
        email,
        password,
      });
      // Better Auth automatically sets the session cookie
      // Call success callback if provided
      onLoginSuccess?.();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Social auth failed",
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await auth.forgetPassword(email, "/reset-password");
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to send reset email");
    }
  };

  return (
    <Box className="flex-1 justify-center bg-background-0 p-4 relative overflow-hidden">
      <AuthCard>
        <VStack space="lg">
          {/* Title & Subtitle */}
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-900 text-center">
              {t("auth:login.title")}
            </Heading>
            <Text size="sm" className="text-typography-600 text-center">
              {t("auth:login.subtitle")}
            </Text>
          </VStack>

          {/* Social Auth Buttons */}
          <VStack space="md">
            <HStack space="md" className="w-full">
              <Box className="flex-1">
                <SocialAuthButton
                  provider="google"
                  onPress={() => handleSocialAuth("google")}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                />
              </Box>
              <Box className="flex-1">
                <SocialAuthButton
                  provider="github"
                  onPress={() => handleSocialAuth("github")}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                />
              </Box>
            </HStack>

            {/* Divider */}
            <HStack space="md" className="items-center">
              <Box className="flex-1 h-px bg-outline-200" />
              <Text size="sm" className="text-typography-500">
                {t("auth:social.divider")}
              </Text>
              <Box className="flex-1 h-px bg-outline-200" />
            </HStack>
          </VStack>

          {/* Email Form */}
          <VStack space="md">
            <FormField
              label={t("auth:login.email")}
              value={email}
              onChangeText={setEmail}
              error={errors.email || errors.general}
              placeholder={t("auth:login.emailPlaceholder")}
              keyboardType="email-address"
            />

            <Box>
              <FormField
                label={t("auth:login.password")}
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                placeholder={t("auth:login.passwordPlaceholder")}
                secureTextEntry
              />
              <Pressable onPress={() => setIsForgotPasswordOpen(true)} className="mt-1">
                <Text size="sm" className="text-primary-600 font-medium text-right">
                  {t("auth:login.forgotPassword")}
                </Text>
              </Pressable>
            </Box>

            <PrimaryButton onPress={handleLogin} isLoading={isLoading} isDisabled={isLoading}>
              {t("auth:login.submit")}
            </PrimaryButton>
          </VStack>

          {/* Sign up link */}
          <Box className="items-center">
            <Text size="sm" className="text-typography-600">
              {t("auth:login.noAccount")}{" "}
              <Link onPress={onNavigateToSignup}>
                <LinkText className="text-primary-600 font-semibold">
                  {t("auth:login.signupLink")}
                </LinkText>
              </Link>
            </Text>
          </Box>
        </VStack>
      </AuthCard>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSubmit={handleForgotPassword}
      />
    </Box>
  );
};
