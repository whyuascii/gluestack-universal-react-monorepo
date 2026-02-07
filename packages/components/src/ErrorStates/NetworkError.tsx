/**
 * NetworkError Component
 *
 * Displays a user-friendly screen when network connectivity is lost.
 * Includes troubleshooting tips and retry functionality.
 *
 * @example
 * ```tsx
 * <NetworkError onRetry={() => refetch()} />
 * ```
 */

import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../text";
import { Button, ButtonText, ButtonIcon } from "../button";
import { VStack } from "../vstack";
import { HStack } from "../hstack";
import { Icon } from "../icon";
import { WifiOff, RefreshCw } from "lucide-react-native";

export interface NetworkErrorProps {
  /** Callback when user taps retry */
  onRetry?: () => void;
  /** Custom message to display */
  message?: string;
  /** Custom title */
  title?: string;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Show troubleshooting tips */
  showTips?: boolean;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = "Please check your internet connection and try again. Make sure you're connected to WiFi or mobile data.",
  title = "No Internet Connection",
  isRetrying = false,
  showTips = true,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView contentContainerClassName="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center">
          {/* Icon */}
          <View className="w-20 h-20 rounded-full bg-warning-bg items-center justify-center mb-6">
            <Icon as={WifiOff} className="w-10 h-10 text-warning-icon" />
          </View>

          {/* Title */}
          <Text className="text-heading-xl font-bold text-content-emphasis text-center mb-4">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-body-md text-content-muted text-center mb-8 max-w-xs">
            {message}
          </Text>

          {/* Retry Button */}
          {onRetry && (
            <Button onPress={onRetry} size="lg" className="w-full max-w-xs" disabled={isRetrying}>
              <ButtonIcon as={RefreshCw} className={isRetrying ? "animate-spin" : ""} />
              <ButtonText>{isRetrying ? "Retrying..." : "Try Again"}</ButtonText>
            </Button>
          )}

          {/* Troubleshooting Tips */}
          {showTips && (
            <View className="mt-12 p-4 bg-surface-sunken rounded-xl w-full max-w-xs">
              <Text className="text-body-sm font-semibold text-content-emphasis mb-3">
                Troubleshooting Tips
              </Text>
              <VStack space="sm">
                <HStack space="sm" className="items-start">
                  <Text className="text-content-muted">•</Text>
                  <Text className="text-body-sm text-content-muted flex-1">
                    Check if airplane mode is off
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text className="text-content-muted">•</Text>
                  <Text className="text-body-sm text-content-muted flex-1">
                    Verify WiFi or mobile data is enabled
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text className="text-content-muted">•</Text>
                  <Text className="text-body-sm text-content-muted flex-1">
                    Try restarting your device
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text className="text-content-muted">•</Text>
                  <Text className="text-body-sm text-content-muted flex-1">
                    Move closer to your router
                  </Text>
                </HStack>
              </VStack>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NetworkError;
