import { Box, Center, Heading, HStack, Text, VStack } from "components";
import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-6"
      >
        {/* Header */}
        <Box className="bg-white shadow-sm">
          <VStack className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <Box className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Text size="xl">🚀</Text>
            </Box>
            <Heading size="3xl" className="font-bold text-gray-900 text-center mb-3">
              React Native Monorepo
            </Heading>
            <Text className="text-lg text-center text-gray-600 mb-6">
              Cross-platform template with shared UI components using GlueStack-v3
            </Text>
          </VStack>
        </Box>

        {/* Main Content */}
        <Box className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tech Stack */}
          <Box className="gap-4 mb-12">
            <Heading size="xl" className="font-bold text-gray-900 mb-6 text-center">
              Tech Stack
            </Heading>

            <Box className="grid sm:grid-cols-2 gap-4">
              <Box className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <HStack className="items-center gap-3">
                  <Box className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Text size="lg">📱</Text>
                  </Box>
                  <VStack>
                    <Heading size="md" className="text-gray-900">
                      Expo
                    </Heading>
                    <Text className="text-sm text-gray-600">React Native</Text>
                  </VStack>
                </HStack>
              </Box>

              <Box className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <HStack className="items-center gap-3">
                  <Box className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Text size="lg" className="text-white">
                      N
                    </Text>
                  </Box>
                  <VStack>
                    <Heading size="md" className="text-gray-900">
                      Next.js 15
                    </Heading>
                    <Text className="text-sm text-gray-600">React Web framework</Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>

            <Box className="grid sm:grid-cols-2 gap-4">
              <Box className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <HStack className="items-center gap-3">
                  <Box className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <Text className="text-white text-lg">🎨</Text>
                  </Box>
                  <VStack>
                    <Heading size="md" className="text-gray-900">
                      Tailwind v3
                    </Heading>
                    <Text className="text-sm text-gray-600">NativeWind</Text>
                  </VStack>
                </HStack>
              </Box>

              <Box className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <HStack className="items-center gap-3">
                  <Box className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Text className="text-white text-lg font-bold">T</Text>
                  </Box>
                  <VStack>
                    <Heading size="md" className="font-semibold text-gray-900">
                      Turborepo
                    </Heading>
                    <Text size="sm" className="text-gray-600">
                      Monorepo
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </Box>

          {/* What's Included */}
          <Box className="mb-12">
            <VStack className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <Heading size="md" className="text-gray-900 mb-4 text-center">
                What&apos;s Included
              </Heading>
              <Box className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <VStack className="w-full gap-1">
                  <HStack className="items-center gap-2">
                    <Text className="text-green-600">✓</Text>
                    <Text size="sm" className="text-gray-700">
                      Shared GlueStack-v3 UI package
                    </Text>
                  </HStack>
                  <HStack className="items-center gap-2">
                    <Text size="sm" className="text-green-600">
                      ✓
                    </Text>
                    <Text size="sm" className="text-gray-700">
                      TypeScript setup
                    </Text>
                  </HStack>
                  <HStack className="items-center gap-2">
                    <Text size="sm" className="text-green-600">
                      ✓
                    </Text>
                    <Text size="sm" className="text-gray-700">
                      Cross-platform styling
                    </Text>
                  </HStack>
                </VStack>

                <VStack className="w-full gap-1">
                  <HStack className="items-center gap-2">
                    <Text size="sm" className="text-green-600">
                      ✓
                    </Text>
                    <Text size="sm" className="text-gray-700">
                      Development scripts
                    </Text>
                  </HStack>
                  <HStack className="items-center gap-2">
                    <Text size="sm" className="text-green-600">
                      ✓
                    </Text>
                    <Text size="sm" className="text-gray-700">
                      Build configuration
                    </Text>
                  </HStack>
                  <HStack className="items-center gap-2">
                    <Text size="sm" className="text-green-600">
                      ✓
                    </Text>
                    <Text size="sm" className="text-gray-700">
                      Clean architecture
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Getting Started */}
          <Box className="mb-12">
            <VStack className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <Heading size="md" className="text-xl font-bold text-gray-900 mb-4 text-center">
                Quick Start
              </Heading>
              <Box className="bg-gray-900 p-4 rounded mb-3">
                <Text size="sm" className="text-green-400 font-mono">
                  pnpm install
                </Text>
                <Text size="sm" className="text-green-400 font-mono">
                  pnpm dev
                </Text>
              </Box>
              <Text size="sm" className="text-gray-600 text-center">
                Starts both web and mobile apps with hot reload
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* Footer */}
        <Center className="bg-white border-t border-gray-200 mt-12">
          <Box className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Text size="sm" className="text-gray-600 text-center">
              Built with Turborepo • Next.js • Expo • NativeWind
            </Text>
          </Box>
        </Center>
      </ScrollView>
    </SafeAreaView>
  );
}
