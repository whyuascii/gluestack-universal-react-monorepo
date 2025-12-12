"use client";

import { Box, VStack, HStack, Heading, Text, Button, ButtonText, Card } from "components";
import React from "react";

interface HomeScreenProps {
  onNavigateToSignup: () => void;
  onNavigateToLogin: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSignup,
  onNavigateToLogin,
}) => {
  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      features: ["Up to 10 tasks", "Basic collaboration", "Email support"],
    },
    {
      name: "Pro",
      price: "$12",
      features: ["Unlimited tasks", "Advanced collaboration", "Priority support", "Analytics"],
    },
  ];

  return (
    <Box className="min-h-screen bg-background-0">
      {/* Navigation Header */}
      <Box className="border-b border-outline-200 bg-white">
        <Box className="max-w-4xl mx-auto px-6 py-4">
          <HStack className="justify-between items-center">
            <Heading size="xl" className="text-primary-600 font-bold">
              TaskManager
            </Heading>
            <HStack space="sm">
              <Button
                onPress={onNavigateToLogin}
                className="border border-outline-300 bg-transparent px-5 py-2 rounded-lg"
              >
                <ButtonText className="text-typography-900 font-medium">Login</ButtonText>
              </Button>
              <Button onPress={onNavigateToSignup} className="bg-primary-600 px-5 py-2 rounded-lg">
                <ButtonText className="text-white font-medium">Sign Up</ButtonText>
              </Button>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <VStack space="lg" className="items-center text-center mb-16">
          <Heading size="3xl" className="text-typography-900">
            Simple Task Management
          </Heading>
          <Text size="lg" className="text-typography-600 max-w-xl">
            Organize your work and life, finally.
          </Text>
          <HStack space="md" className="mt-4">
            <Button onPress={onNavigateToSignup} className="bg-primary-600 px-6 py-3 rounded-lg">
              <ButtonText className="text-white font-semibold">Get Started Free</ButtonText>
            </Button>
          </HStack>
        </VStack>

        {/* Pricing Section */}
        <VStack space="md" className="mt-12">
          <Heading size="xl" className="text-center text-typography-900 mb-6">
            Pricing
          </Heading>
          <HStack space="md" className="justify-center flex-wrap">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`p-6 rounded-xl shadow-md w-72 ${
                  tier.name === "Pro"
                    ? "bg-primary-600 border-2 border-primary-700"
                    : "bg-white border border-outline-200"
                }`}
              >
                <VStack space="md">
                  <Heading
                    size="lg"
                    className={tier.name === "Pro" ? "text-white" : "text-typography-900"}
                  >
                    {tier.name}
                  </Heading>
                  <HStack className="items-baseline">
                    <Heading
                      size="3xl"
                      className={tier.name === "Pro" ? "text-white" : "text-primary-600"}
                    >
                      {tier.price}
                    </Heading>
                    <Text
                      className={tier.name === "Pro" ? "text-primary-100" : "text-typography-600"}
                    >
                      /month
                    </Text>
                  </HStack>
                  <VStack space="xs" className="mt-3">
                    {tier.features.map((feature, i) => (
                      <HStack key={i} space="sm" className="items-center">
                        <Text className={tier.name === "Pro" ? "text-white" : "text-primary-600"}>
                          ✓
                        </Text>
                        <Text
                          size="sm"
                          className={tier.name === "Pro" ? "text-white" : "text-typography-700"}
                        >
                          {feature}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <Button
                    onPress={onNavigateToSignup}
                    className={`mt-4 py-2 rounded-lg ${
                      tier.name === "Pro" ? "bg-white" : "bg-primary-600"
                    }`}
                  >
                    <ButtonText
                      className={`font-medium ${
                        tier.name === "Pro" ? "text-primary-600" : "text-white"
                      }`}
                    >
                      Get Started
                    </ButtonText>
                  </Button>
                </VStack>
              </Card>
            ))}
          </HStack>
        </VStack>
      </Box>

      {/* Footer */}
      <Box className="mt-16 py-6 border-t border-outline-200">
        <Text className="text-center text-typography-500 text-sm">
          © 2024 TaskManager. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};
