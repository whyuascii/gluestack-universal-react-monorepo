"use client";

import { Box, VStack, HStack, Heading, Text, Button, ButtonText, Card } from "@app/components";
import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

interface HomeScreenProps {
  onNavigateToSignup: () => void;
  onNavigateToLogin: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSignup,
  onNavigateToLogin,
}) => {
  const { t } = useTranslation(["common"]);

  return (
    <Box className="min-h-screen bg-background-0">
      {/* Navigation Header */}
      <Box className="border-b border-outline-200 bg-white">
        <Box className="max-w-4xl mx-auto px-6 py-4">
          <HStack className="justify-between items-center">
            <Heading size="xl" className="text-primary-600 font-bold">
              {t("common:app.name")}
            </Heading>
            <HStack space="md">
              <LanguageSwitcher />
              <HStack space="sm">
                <Button
                  onPress={onNavigateToLogin}
                  className="border border-outline-300 bg-transparent px-5 py-2 rounded-lg"
                >
                  <ButtonText className="text-typography-900 font-medium">
                    {t("common:actions.login")}
                  </ButtonText>
                </Button>
                <Button
                  onPress={onNavigateToSignup}
                  className="bg-primary-600 px-5 py-2 rounded-lg"
                >
                  <ButtonText className="text-white font-medium">
                    {t("common:actions.signup")}
                  </ButtonText>
                </Button>
              </HStack>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <VStack space="lg" className="items-center text-center mb-16">
          <Heading size="3xl" className="text-typography-900">
            {t("common:hero.title")}
          </Heading>
          <Text size="lg" className="text-typography-600 max-w-xl">
            {t("common:hero.subtitle")}
          </Text>
          <HStack space="md" className="mt-4">
            <Button onPress={onNavigateToSignup} className="bg-primary-600 px-6 py-3 rounded-lg">
              <ButtonText className="text-white font-semibold">
                {t("common:actions.getStartedFree")}
              </ButtonText>
            </Button>
          </HStack>
        </VStack>

        {/* Pricing Section */}
        <VStack space="md" className="mt-12">
          <Heading size="xl" className="text-center text-typography-900 mb-6">
            {t("common:pricing.title")}
          </Heading>
          <HStack space="md" className="justify-center flex-wrap">
            {["free", "pro"].map((tier) => (
              <Card
                key={tier}
                className={`p-6 rounded-xl shadow-md w-72 ${
                  tier === "pro"
                    ? "bg-primary-600 border-2 border-primary-700"
                    : "bg-white border border-outline-200"
                }`}
              >
                <VStack space="md">
                  <Heading
                    size="lg"
                    className={tier === "pro" ? "text-white" : "text-typography-900"}
                  >
                    {t(`common:pricing.tiers.${tier}.name`)}
                  </Heading>
                  <HStack className="items-baseline">
                    <Heading
                      size="3xl"
                      className={tier === "pro" ? "text-white" : "text-primary-600"}
                    >
                      {t(`common:pricing.tiers.${tier}.price`)}
                    </Heading>
                    <Text className={tier === "pro" ? "text-primary-100" : "text-typography-600"}>
                      {t("common:pricing.perMonth")}
                    </Text>
                  </HStack>
                  <VStack space="xs" className="mt-3">
                    {Object.keys(
                      t(`common:pricing.tiers.${tier}.features`, { returnObjects: true }) as object
                    ).map((featureKey, i) => (
                      <HStack key={i} space="sm" className="items-center">
                        <Text className={tier === "pro" ? "text-white" : "text-primary-600"}>
                          ✓
                        </Text>
                        <Text
                          size="sm"
                          className={tier === "pro" ? "text-white" : "text-typography-700"}
                        >
                          {t(`common:pricing.tiers.${tier}.features.${featureKey}`)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <Button
                    onPress={onNavigateToSignup}
                    className={`mt-4 py-2 rounded-lg ${
                      tier === "pro" ? "bg-white" : "bg-primary-600"
                    }`}
                  >
                    <ButtonText
                      className={`font-medium ${
                        tier === "pro" ? "text-primary-600" : "text-white"
                      }`}
                    >
                      {t("common:actions.getStarted")}
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
          {t("common:footer.copyright")}
        </Text>
      </Box>
    </Box>
  );
};
