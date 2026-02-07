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
  Link,
  LinkText,
  Pressable,
  SocialAuthButton,
  Text,
  VStack,
} from "@app/components";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react-native";
import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, KeyboardAvoidingView, Platform, View, type TextInput } from "react-native";
import { useAccessibilityAnnounce } from "../../hooks/useAccessibilityAnnounce";

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  onSignupSuccess?: (email: string) => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onNavigateToLogin,
  onSignupSuccess,
}) => {
  const { t } = useTranslation(["auth", "validation", "common"]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const announce = useAccessibilityAnnounce();

  const handleNameSubmit = useCallback(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleEmailSubmit = useCallback(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    confirmPasswordInputRef.current?.focus();
  }, []);

  const handleSignup = async () => {
    setErrors({});

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

      if (response.error) {
        const errorMessage = response.error.message || t("auth:signup.failed");
        setErrors({ general: errorMessage });
        announce(errorMessage);
        return;
      }

      announce(t("auth:signup.success"));
      onSignupSuccess?.(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("auth:signup.failed");
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
                <UserPlus size={32} color="#ffffff" />
              </Box>
              <Heading size="2xl" className="text-typography-900 text-center">
                {t("auth:signup.title")}
              </Heading>
              <Text className="text-typography-500 text-center text-base">
                {t("auth:signup.subtitle")}
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

              {/* Social Auth Buttons */}
              <VStack space="md" className="mb-6">
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

              {/* Divider */}
              <HStack className="items-center mb-6">
                <Box className="flex-1 h-px bg-outline-200" />
                <Text className="text-typography-400 text-xs uppercase px-4 font-medium">
                  {t("auth:social.divider")}
                </Text>
                <Box className="flex-1 h-px bg-outline-200" />
              </HStack>

              {/* Form Fields */}
              <VStack space="lg">
                <FormField
                  label={t("auth:signup.name")}
                  error={errors.name}
                  leftIcon={<User size={20} className="text-typography-400" />}
                  input={{
                    placeholder: t("auth:signup.namePlaceholder"),
                    value: name,
                    onChangeText: setName,
                    autoCapitalize: "words",
                    returnKeyType: "next",
                    onSubmitEditing: handleNameSubmit,
                    blurOnSubmit: false,
                  }}
                  testID="signup-name-input"
                />

                <FormField
                  ref={emailInputRef}
                  label={t("auth:signup.email")}
                  error={errors.email}
                  leftIcon={<Mail size={20} className="text-typography-400" />}
                  input={{
                    placeholder: t("auth:signup.emailPlaceholder"),
                    value: email,
                    onChangeText: setEmail,
                    keyboardType: "email-address",
                    autoCapitalize: "none",
                    returnKeyType: "next",
                    onSubmitEditing: handleEmailSubmit,
                    blurOnSubmit: false,
                  }}
                  testID="signup-email-input"
                />

                <FormField
                  ref={passwordInputRef}
                  label={t("auth:signup.password")}
                  error={errors.password}
                  leftIcon={<Lock size={20} className="text-typography-400" />}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={8}
                      accessibilityLabel={
                        showPassword ? t("auth:signup.hidePassword") : t("auth:signup.showPassword")
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
                    placeholder: t("auth:signup.passwordPlaceholder"),
                    value: password,
                    onChangeText: setPassword,
                    secureTextEntry: !showPassword,
                    returnKeyType: "next",
                    onSubmitEditing: handlePasswordSubmit,
                    blurOnSubmit: false,
                  }}
                  testID="signup-password-input"
                />

                <FormField
                  ref={confirmPasswordInputRef}
                  label={t("auth:signup.confirmPassword")}
                  error={errors.confirmPassword}
                  leftIcon={<Lock size={20} className="text-typography-400" />}
                  input={{
                    placeholder: t("auth:signup.confirmPasswordPlaceholder"),
                    value: confirmPassword,
                    onChangeText: setConfirmPassword,
                    secureTextEntry: !showPassword,
                    returnKeyType: "done",
                    onSubmitEditing: handleSignup,
                  }}
                  testID="signup-confirm-password-input"
                />

                {/* Submit Button */}
                <Button
                  size="xl"
                  action="primary"
                  onPress={handleSignup}
                  isDisabled={isLoading}
                  className="rounded-2xl h-14 mt-2"
                  testID="signup-submit-button"
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <>
                      <ButtonText className="font-semibold text-base">
                        {t("auth:signup.submit")}
                      </ButtonText>
                      <Icon as={ArrowRight} size="md" className="text-white ml-2" />
                    </>
                  )}
                </Button>
              </VStack>

              {/* Login Link */}
              <HStack className="justify-center items-center mt-8 pt-6 border-t border-outline-100">
                <Text className="text-typography-500 text-base">
                  {t("auth:signup.hasAccount")}{" "}
                </Text>
                <Link onPress={onNavigateToLogin}>
                  <LinkText className="text-primary-500 font-semibold text-base">
                    {t("auth:signup.loginLink")}
                  </LinkText>
                </Link>
              </HStack>
            </Box>

            {/* Terms */}
            <Text className="text-typography-400 text-xs text-center mt-6 px-4">
              {t("auth:signup.termsNotice")}
            </Text>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
