"use client";

import { VStack, Heading, Text, Link, LinkText, Box } from "components";
import { AuthCard, FormField, PrimaryButton } from "components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSignup } from "../hooks";

interface SignupScreenProps {
  onNavigateToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin }) => {
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
  }>({});

  const signupMutation = useSignup();

  const handleSignup = () => {
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

    signupMutation.mutate({ name, email, password });
  };

  return (
    <Box className="flex-1 justify-center bg-background-0 p-4">
      <AuthCard>
        <VStack space="lg">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-900">
              {t("auth:signup.title")}
            </Heading>
            <Text size="sm" className="text-typography-600">
              {t("auth:signup.subtitle")}
            </Text>
          </VStack>

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
              error={
                errors.email || (signupMutation.isError ? signupMutation.error.message : undefined)
              }
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

            <PrimaryButton onPress={handleSignup} isLoading={signupMutation.isPending}>
              {t("auth:signup.submit")}
            </PrimaryButton>
          </VStack>

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
