"use client";

import { VStack, Heading, Text, Link, LinkText, Box } from "components";
import { AuthCard, FormField, PrimaryButton } from "components";
import React, { useState } from "react";
import { useLogin } from "../hooks";

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignup }) => {
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
      newErrors.email = "Please enter a valid email";
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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
              Welcome Back
            </Heading>
            <Text size="sm" className="text-typography-600">
              Sign in to continue to your dashboard
            </Text>
          </VStack>

          <VStack space="md">
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={
                errors.email || (loginMutation.isError ? loginMutation.error.message : undefined)
              }
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="Enter your password"
              secureTextEntry
            />

            <PrimaryButton onPress={handleLogin} isLoading={loginMutation.isPending}>
              Sign In
            </PrimaryButton>
          </VStack>

          <Box className="items-center">
            <Text size="sm" className="text-typography-600">
              Don&apos;t have an account?{" "}
              <Link onPress={onNavigateToSignup}>
                <LinkText className="text-primary-600 font-semibold">Sign up</LinkText>
              </Link>
            </Text>
          </Box>
        </VStack>
      </AuthCard>
    </Box>
  );
};
