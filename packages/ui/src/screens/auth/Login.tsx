"use client";

import { authClient } from "@app/auth";
import {
  Box,
  Button,
  ButtonText,
  ButtonSpinner,
  ForgotPasswordModal,
  FormField,
  Heading,
  HStack,
  Icon,
  Link,
  LinkText,
  Pressable,
  SocialAuthButton,
  Text,
  VStack,
} from "@app/components";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Sparkles } from "lucide-react-native";
import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, KeyboardAvoidingView, Platform, View, type TextInput } from "react-native";
import { useAccessibilityAnnounce } from "../../hooks/useAccessibilityAnnounce";

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onLoginSuccess?: () => void;
  /**
   * Platform-specific signIn function.
   * Mobile MUST pass signIn from @app/auth/client/native.
   * Web can omit to use default authClient.
   */
  signIn?: (params: {
    email: string;
    password: string;
  }) => Promise<{ error?: { message?: string } }>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignup,
  onLoginSuccess,
  signIn,
}) => {
  const performSignIn =
    signIn || ((params: { email: string; password: string }) => authClient.signIn.email(params));
  const { t } = useTranslation(["auth", "validation", "common"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);
  const announce = useAccessibilityAnnounce();

  const handleEmailSubmit = useCallback(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    setErrors({});

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
      const response = await performSignIn({ email, password });

      if (response.error) {
        setErrors({
          general: response.error.message || t("auth:login.failed"),
        });
        return;
      }

      announce(t("auth:login.success"));
      onLoginSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("auth:login.failed");
      setErrors({ general: errorMessage });
      announce(errorMessage);
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
        general: error instanceof Error ? error.message : t("auth:social.failed"),
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (resetEmail: string) => {
    try {
      await authClient.forgetPassword({
        email: resetEmail,
        redirectTo: "/reset-password",
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : t("auth:forgotPassword.error"));
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
                <Sparkles size={32} color="#ffffff" />
              </Box>
              <Heading size="2xl" className="text-typography-900 text-center">
                {t("auth:login.title")}
              </Heading>
              <Text className="text-typography-500 text-center text-base">
                {t("auth:login.subtitle")}
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
                  label={t("auth:login.email")}
                  error={errors.email}
                  leftIcon={<Mail size={20} className="text-typography-400" />}
                  input={{
                    placeholder: t("auth:login.emailPlaceholder"),
                    value: email,
                    onChangeText: setEmail,
                    keyboardType: "email-address",
                    autoCapitalize: "none",
                    returnKeyType: "next",
                    onSubmitEditing: handleEmailSubmit,
                    blurOnSubmit: false,
                  }}
                  testID="login-email-input"
                />

                <VStack space="xs">
                  <FormField
                    ref={passwordInputRef}
                    label={t("auth:login.password")}
                    error={errors.password}
                    leftIcon={<Lock size={20} className="text-typography-400" />}
                    rightIcon={
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={8}
                        accessibilityLabel={
                          showPassword ? t("auth:login.hidePassword") : t("auth:login.showPassword")
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
                      placeholder: t("auth:login.passwordPlaceholder"),
                      value: password,
                      onChangeText: setPassword,
                      secureTextEntry: !showPassword,
                      returnKeyType: "done",
                      onSubmitEditing: handleLogin,
                    }}
                    testID="login-password-input"
                  />

                  {/* Forgot Password Link */}
                  <HStack className="justify-end mt-1">
                    <Link onPress={() => setIsForgotPasswordOpen(true)}>
                      <LinkText className="text-sm text-primary-500 font-medium">
                        {t("auth:login.forgotPassword")}
                      </LinkText>
                    </Link>
                  </HStack>
                </VStack>

                {/* Submit Button */}
                <Button
                  size="xl"
                  action="primary"
                  onPress={handleLogin}
                  isDisabled={isLoading}
                  className="rounded-2xl h-14 mt-2"
                  testID="login-submit-button"
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <>
                      <ButtonText className="font-semibold text-base">
                        {t("auth:login.submit")}
                      </ButtonText>
                      <Icon as={ArrowRight} size="md" className="text-white ml-2" />
                    </>
                  )}
                </Button>
              </VStack>

              {/* Divider */}
              <HStack className="items-center my-6">
                <Box className="flex-1 h-px bg-outline-200" />
                <Text className="text-typography-400 text-xs uppercase px-4 font-medium">
                  {t("auth:login.orContinueWith")}
                </Text>
                <Box className="flex-1 h-px bg-outline-200" />
              </HStack>

              {/* Social Auth Buttons */}
              <VStack space="md">
                <SocialAuthButton
                  provider="google"
                  onPress={() => handleSocialAuth("google")}
                  isDisabled={isLoading}
                />
                <SocialAuthButton
                  provider="github"
                  onPress={() => handleSocialAuth("github")}
                  isDisabled={isLoading}
                />
              </VStack>

              {/* Sign Up Link */}
              <HStack className="justify-center items-center mt-8 pt-6 border-t border-outline-100">
                <Text className="text-typography-500 text-base">{t("auth:login.noAccount")} </Text>
                <Link onPress={onNavigateToSignup}>
                  <LinkText className="text-primary-500 font-semibold text-base">
                    {t("auth:login.signUp")}
                  </LinkText>
                </Link>
              </HStack>
            </Box>

            {/* Terms */}
            <Text className="text-typography-400 text-xs text-center mt-6 px-4">
              {t("auth:login.termsNotice")}
            </Text>
          </Box>
        </ScrollView>

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          onSubmit={handleForgotPassword}
        />
      </KeyboardAvoidingView>
    </View>
  );
};
