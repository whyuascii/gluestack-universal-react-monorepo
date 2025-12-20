"use client";

import { VStack, Heading, Text, Link, LinkText, Box } from "@app/components";
import { AuthCard, FormField, PrimaryButton } from "@app/components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLogin } from "../hooks";

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignup }) => {
  const { t } = useTranslation(["auth", "validation"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const loginMutation = useLogin();

  const handleLogin = () => {
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

    loginMutation.mutate({ email, password });
  };

  return (
    <Box className="flex-1 justify-center bg-background-0 p-4">
      <AuthCard>
        <VStack space="lg">
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-900">
              {t("auth:login.title")}
            </Heading>
            <Text size="sm" className="text-typography-600">
              {t("auth:login.subtitle")}
            </Text>
          </VStack>

          <VStack space="md">
            <FormField
              label={t("auth:login.email")}
              value={email}
              onChangeText={setEmail}
              error={
                errors.email || (loginMutation.isError ? loginMutation.error.message : undefined)
              }
              placeholder={t("auth:login.emailPlaceholder")}
              keyboardType="email-address"
            />

            <FormField
              label={t("auth:login.password")}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder={t("auth:login.passwordPlaceholder")}
              secureTextEntry
            />

            <PrimaryButton onPress={handleLogin} isLoading={loginMutation.isPending}>
              {t("auth:login.submit")}
            </PrimaryButton>
          </VStack>

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
    </Box>
  );
};
