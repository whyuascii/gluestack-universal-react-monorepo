"use client";

import {
  Box,
  Button,
  ButtonText,
  ButtonSpinner,
  FormField,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from "@app/components";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  UserCog,
  AlertCircle,
} from "lucide-react-native";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  ActivityIndicator,
  type TextInput,
} from "react-native";
import { useAccessibilityAnnounce } from "../../hooks/useAccessibilityAnnounce";
import { client } from "../../api/orpc-client";

interface AdminInviteInfo {
  userId: string;
  email: string;
  adminRole: "read_only" | "support_rw" | "super_admin";
  name: string | null;
}

interface AdminInviteScreenProps {
  token: string;
  onSuccess?: (info: { userId: string; email: string; hasWorkspace: boolean }) => void;
  onError?: (error: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  read_only: "roleReadOnly",
  support_rw: "roleSupportRW",
  super_admin: "roleSuperAdmin",
};

export const AdminInviteScreen: React.FC<AdminInviteScreenProps> = ({
  token,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation(["auth", "validation"]);
  const [inviteInfo, setInviteInfo] = useState<AdminInviteInfo | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const confirmPasswordRef = useRef<TextInput>(null);
  const announce = useAccessibilityAnnounce();

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      setIsVerifying(true);
      setVerifyError(null);
      try {
        const result = await client.public.adminInvite.verify({ token });
        setInviteInfo(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("auth:adminInvite.invalidToken");
        setVerifyError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };
    verifyToken();
  }, [token, t, onError]);

  const handlePasswordSubmit = useCallback(() => {
    confirmPasswordRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    setErrors({});

    const newErrors: typeof errors = {};
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
      const result = await client.public.adminInvite.accept({ token, password });
      announce(t("auth:adminInvite.success"));

      // Note: The caller needs to handle authentication after this
      // The accept endpoint doesn't automatically log the user in
      onSuccess?.({
        userId: result.userId,
        email: result.email,
        hasWorkspace: false, // Will be determined by the caller
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("auth:adminInvite.failed");
      setErrors({ general: errorMessage });
      announce(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-typography-500 mt-4">{t("auth:adminInvite.submitting")}</Text>
      </View>
    );
  }

  // Error state
  if (verifyError || !inviteInfo) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Box className="w-full max-w-md">
          <Box className="bg-background-0 rounded-3xl p-6 md:p-8 shadow-hard-2 border border-outline-100">
            <VStack space="md" className="items-center">
              <Box className="w-16 h-16 rounded-2xl bg-error-100 items-center justify-center mb-2">
                <AlertCircle size={32} color="#dc2626" />
              </Box>
              <Heading size="xl" className="text-typography-900 text-center">
                {t("auth:adminInvite.invalidToken")}
              </Heading>
              <Text className="text-typography-500 text-center">
                {verifyError || t("auth:adminInvite.invalidTokenMessage")}
              </Text>
            </VStack>
          </Box>
        </Box>
      </View>
    );
  }

  const roleKey = ROLE_LABELS[inviteInfo.adminRole] || "roleReadOnly";

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
                <UserCog size={32} color="#ffffff" />
              </Box>
              <Heading size="2xl" className="text-typography-900 text-center">
                {t("auth:adminInvite.title")}
              </Heading>
              <Text className="text-typography-500 text-center text-base">
                {t("auth:adminInvite.subtitle")}
              </Text>
            </VStack>

            {/* Card */}
            <Box className="bg-background-0 rounded-3xl p-6 md:p-8 shadow-hard-2 border border-outline-100">
              {/* User Info */}
              <Box className="bg-primary-50 border border-primary-200 p-4 rounded-2xl mb-6">
                <VStack space="sm">
                  <Text className="text-primary-900 font-semibold text-center">
                    {inviteInfo.name || inviteInfo.email}
                  </Text>
                  <Text className="text-primary-700 text-sm text-center">{inviteInfo.email}</Text>
                  <HStack className="justify-center items-center">
                    <Text className="text-primary-600 text-sm">
                      {t("auth:adminInvite.roleLabel")}{" "}
                    </Text>
                    <Text className="text-primary-800 font-semibold text-sm">
                      {t(`auth:adminInvite.${roleKey}`)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

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
                  label={t("auth:adminInvite.password")}
                  error={errors.password}
                  leftIcon={<Lock size={20} className="text-typography-400" />}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={8}
                      accessibilityLabel={
                        showPassword
                          ? t("auth:resetPassword.hidePassword")
                          : t("auth:resetPassword.showPassword")
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
                    placeholder: t("auth:adminInvite.passwordPlaceholder"),
                    value: password,
                    onChangeText: setPassword,
                    secureTextEntry: !showPassword,
                    autoCapitalize: "none",
                    returnKeyType: "next",
                    onSubmitEditing: handlePasswordSubmit,
                    blurOnSubmit: false,
                  }}
                  testID="admin-invite-password-input"
                />

                <FormField
                  ref={confirmPasswordRef}
                  label={t("auth:adminInvite.confirmPassword")}
                  error={errors.confirmPassword}
                  leftIcon={<Lock size={20} className="text-typography-400" />}
                  input={{
                    placeholder: t("auth:adminInvite.confirmPasswordPlaceholder"),
                    value: confirmPassword,
                    onChangeText: setConfirmPassword,
                    secureTextEntry: !showPassword,
                    autoCapitalize: "none",
                    returnKeyType: "done",
                    onSubmitEditing: handleSubmit,
                  }}
                  testID="admin-invite-confirm-password-input"
                />

                {/* Submit Button */}
                <Button
                  size="xl"
                  action="primary"
                  onPress={handleSubmit}
                  isDisabled={isLoading}
                  className="rounded-2xl h-14 mt-2"
                  testID="admin-invite-submit-button"
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <>
                      <ButtonText className="font-semibold text-base">
                        {t("auth:adminInvite.submit")}
                      </ButtonText>
                      <Icon as={ArrowRight} size="md" className="text-white ml-2" />
                    </>
                  )}
                </Button>
              </VStack>

              {/* Password Requirements */}
              <Box className="mt-6 p-4 bg-background-50 rounded-2xl">
                <Text className="text-typography-500 text-sm font-medium mb-2">
                  {t("auth:resetPassword.requirements")}
                </Text>
                <VStack space="xs">
                  <HStack space="sm" className="items-center">
                    <Box className="w-1.5 h-1.5 rounded-full bg-typography-400" />
                    <Text className="text-typography-400 text-sm">
                      {t("auth:resetPassword.requirementLength")}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
