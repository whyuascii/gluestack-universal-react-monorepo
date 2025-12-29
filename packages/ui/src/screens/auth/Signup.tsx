"use client";

import { authClient } from "@app/auth";
import { VStack, HStack, Heading, Text, Link, LinkText, Box } from "@app/components";
import { AuthCard, FormField, PrimaryButton, SocialAuthButton } from "@app/components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  onSignupSuccess?: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onNavigateToLogin,
  onSignupSuccess,
}) => {
  const { t } = useTranslation(["auth", "validation"]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Reset errors
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};
    if (!name || name.length < 1) {
      newErrors.name = t("validation:name.required");
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("validation:email.invalid");
    }
    if (!password || password.length < 8) {
      newErrors.password = t("validation:password.minLength", { count: 8 });
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("validation:password.mismatch");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      // Better Auth returns { data, error } - check for error
      if (response.error) {
        setErrors({
          general: response.error.message || "Signup failed",
        });
        return;
      }

      // Success - Better Auth automatically sets the session cookie
      // Call success callback if provided
      onSignupSuccess?.();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Signup failed",
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

  return (
    <Box className="flex-1 justify-center bg-background-0 p-4 relative overflow-hidden">
      {/* Decorative floating leaves in background */}
      <Box className="absolute top-16 right-12 opacity-20 animate-float">
        <svg width="45" height="45" viewBox="0 0 100 100" fill="none">
          <path d="M50 10C30 10 20 30 20 50C20 70 30 90 50 90C50 70 50 30 50 10Z" fill="#8EB8E5" />
        </svg>
      </Box>
      <Box className="absolute bottom-24 left-8 opacity-15 animate-float-slow">
        <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
          <path d="M50 10C30 10 20 30 20 50C20 70 30 90 50 90C50 70 50 30 50 10Z" fill="#A8CBB7" />
        </svg>
      </Box>

      <AuthCard>
        <VStack space="lg">
          {/* Small decorative illustration at top - birds for signup */}
          <Box className="items-center mb-2">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
              <path d="M30 40C30 35 35 30 40 30C45 30 50 35 50 40L30 40Z" fill="#FAD97A" />
              <path d="M60 35C60 30 65 25 70 25C75 25 80 30 80 35L60 35Z" fill="#8EB8E5" />
              <circle cx="40" cy="32" r="2" fill="#4E3F30" />
              <circle cx="70" cy="27" r="2" fill="#4E3F30" />
            </svg>
          </Box>

          {/* Title & Subtitle */}
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-900 text-center">
              {t("auth:signup.title")}
            </Heading>
            <Text size="sm" className="text-typography-600 text-center">
              {t("auth:signup.subtitle")}
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
              label={t("auth:signup.name")}
              value={name}
              onChangeText={setName}
              error={errors.name}
              placeholder={t("auth:signup.namePlaceholder")}
              autoCapitalize="words"
            />

            <FormField
              label={t("auth:signup.email")}
              value={email}
              onChangeText={setEmail}
              error={errors.email || errors.general}
              placeholder={t("auth:signup.emailPlaceholder")}
              keyboardType="email-address"
            />

            <FormField
              label={t("auth:signup.password")}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder={t("auth:signup.passwordPlaceholder")}
              secureTextEntry
            />

            <FormField
              label={t("auth:signup.confirmPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder={t("auth:signup.confirmPasswordPlaceholder")}
              secureTextEntry
            />

            <PrimaryButton onPress={handleSignup} isLoading={isLoading} isDisabled={isLoading}>
              {t("auth:signup.submit")}
            </PrimaryButton>
          </VStack>

          {/* Login link */}
          <Box className="items-center">
            <Text size="sm" className="text-typography-600">
              {t("auth:signup.hasAccount")}{" "}
              <Link onPress={onNavigateToLogin}>
                <LinkText className="text-primary-600 font-semibold">
                  {t("auth:signup.loginLink")}
                </LinkText>
              </Link>
            </Text>
          </Box>
        </VStack>
      </AuthCard>
    </Box>
  );
};
