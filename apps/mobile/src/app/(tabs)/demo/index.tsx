import { Text, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import {
  Alert,
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertIcon,
  AlertText,
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Heading,
} from "ui";
import { AlertCircleIcon, PlusCircleIcon } from "lucide-react-native";
import { useState } from "react";

export default function Demo() {
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const handleClose = () => setShowAlertDialog(false);

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 py-6"
      >
        {/* Header Section */}
        <View className="items-center mb-8">
          <View className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl items-center justify-center mb-4">
            <Text className="text-2xl">🎨</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Shared UI Components
          </Text>
          <Text className="text-gray-600 mb-4 text-center">
            Cross-platform components built with React Native and NativeWind
          </Text>
          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-purple-800 text-sm font-medium">
              📱 Mobile App
            </Text>
          </View>
        </View>

        {/* Component Showcase */}
        <View className="gap-6">
          {/* Button Component */}
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Button
          </Text>
          <View className="gap-3">
            <Button size="xl">
              <ButtonIcon as={PlusCircleIcon} />
              <ButtonText>Test</ButtonText>
            </Button>
            <Button size="xl" variant="outline">
              <ButtonIcon as={PlusCircleIcon} />
              <ButtonText>Test</ButtonText>
            </Button>
            <Button size="xl" variant="link">
              <ButtonIcon as={PlusCircleIcon} />
              <ButtonText>Test</ButtonText>
            </Button>
          </View>

          {/* Card Component */}
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Alert
          </Text>
          <View>
            <Alert variant="solid" action="error">
              <AlertIcon as={AlertCircleIcon} />
              <AlertText>This is an alert text</AlertText>
            </Alert>
          </View>

          <Box className="bg-primary-500 p-5">
            <Text className="text-typography-0">This is the Box</Text>
          </Box>

          <Button size="xl" onPress={() => setShowAlertDialog(true)}>
            <ButtonIcon as={PlusCircleIcon} />
            <ButtonText>Open Dialog</ButtonText>
          </Button>
          <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
            <AlertDialogBackdrop />
            <AlertDialogContent>
              <AlertDialogHeader>
                <Heading
                  className="text-typography-950 font-semibold"
                  size="md"
                >
                  Are you sure you want to delete this post?
                </Heading>
              </AlertDialogHeader>
              <AlertDialogBody className="mt-3 mb-4">
                <Text>
                  Deleting the post will remove it permanently and cannot be
                  undone. Please confirm if you want to proceed.
                </Text>
              </AlertDialogBody>
              <AlertDialogFooter className="">
                <Button
                  variant="outline"
                  action="secondary"
                  onPress={handleClose}
                  size="sm"
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button size="sm" onPress={handleClose}>
                  <ButtonText>Delete</ButtonText>
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* How It Works */}
          <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              How It Works
            </Text>
            <Text className="text-gray-600 text-sm mb-4 leading-5">
              Components use React Native primitives (View, Text, Pressable)
              with NativeWind for styling. React Native Web transforms these
              into HTML elements for the browser.
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-white p-3 rounded border border-blue-100">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-blue-600">🌐</Text>
                  <Text className="font-medium text-blue-900 text-sm">Web</Text>
                </View>
                <Text className="text-blue-700 text-xs">
                  React Native Web → HTML
                </Text>
              </View>

              <View className="flex-1 bg-white p-3 rounded border border-purple-100">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-purple-600">📱</Text>
                  <Text className="font-medium text-purple-900 text-sm">
                    Mobile
                  </Text>
                </View>
                <Text className="text-purple-700 text-xs">
                  Native iOS/Android
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Navigation */}
        <View className="items-center mt-8 gap-4">
          <Link href="/(tabs)/(home)" asChild>
            <Pressable className="bg-blue-600 px-6 py-2 rounded-lg active:opacity-80">
              <View className="flex-row items-center gap-2">
                <Text className="text-white text-sm">🏠</Text>
                <Text className="text-white font-medium text-sm">
                  Back to Home
                </Text>
              </View>
            </Pressable>
          </Link>

          <Text className="text-sm text-gray-500 text-center">
            Try the web app to see identical components in action
          </Text>
        </View>

        {/* Footer */}
        <View className="mt-8">
          <Text className="text-gray-600 text-center text-sm">
            Same components • Different platforms • One codebase
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
