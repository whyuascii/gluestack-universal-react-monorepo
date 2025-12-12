"use client";

import { VStack, Heading, Text, Link, LinkText, Box } from "components";
import { AuthCard, FormField, PrimaryButton } from "components";
import React, { useState } from "react";
import { useSignup } from "../hooks";

interface SignupScreenProps {
  onNavigateToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin }) => {
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
      newErrors.name = "Name is required";
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
              Create Account
            </Heading>
            <Text size="sm" className="text-typography-600">
              Sign up to get started
            </Text>
          </VStack>

          <VStack space="md">
            <FormField
              label="Name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              placeholder="John Doe"
              autoCapitalize="words"
            />

            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={
                errors.email || (signupMutation.isError ? signupMutation.error.message : undefined)
              }
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="At least 8 characters"
              secureTextEntry
            />

            <FormField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
            />

            <PrimaryButton onPress={handleSignup} isLoading={signupMutation.isPending}>
              Sign Up
            </PrimaryButton>
          </VStack>

          <Box className="items-center">
            <Text size="sm" className="text-typography-600">
              Already have an account?{" "}
              <Link onPress={onNavigateToLogin}>
                <LinkText className="text-primary-600 font-semibold">Sign in</LinkText>
              </Link>
            </Text>
          </Box>
        </VStack>
      </AuthCard>
    </Box>
  );
};
