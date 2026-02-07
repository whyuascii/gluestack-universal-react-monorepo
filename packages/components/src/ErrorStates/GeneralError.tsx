/**
 * GeneralError Component
 *
 * Displays a user-friendly error screen with retry and navigation options.
 * Customizable title, message, and actions.
 *
 * @example
 * ```tsx
 * <GeneralError
 *   title="Failed to load"
 *   message="We couldn't load your data"
 *   onRetry={() => refetch()}
 *   onGoHome={() => router.replace("/")}
 * />
 * ```
 */

import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../text";
import { Button, ButtonText, ButtonIcon } from "../button";
import { VStack } from "../vstack";
import { Icon } from "../icon";
import { AlertCircle, RefreshCw, Home } from "lucide-react-native";

export interface GeneralErrorProps {
  /** Error title */
  title?: string;
  /** Error message/description */
  message?: string;
  /** Callback when retry is pressed */
  onRetry?: () => void;
  /** Custom retry button text */
  retryText?: string;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Callback when go home is pressed */
  onGoHome?: () => void;
  /** Whether to show the home button */
  showHomeButton?: boolean;
  /** Custom icon component */
  icon?: React.ComponentType<any>;
  /** Icon color class */
  iconColorClass?: string;
  /** Icon background color class */
  iconBgClass?: string;
  /** Additional details (shown in dev mode) */
  errorDetails?: string;
  /** Component stack (shown in dev mode) */
  componentStack?: string;
  /** Compact mode (smaller spacing, no SafeAreaView) */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

export const GeneralError: React.FC<GeneralErrorProps> = ({
  title = "Something went wrong",
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  retryText = "Try Again",
  isRetrying = false,
  onGoHome,
  showHomeButton = true,
  icon: CustomIcon = AlertCircle,
  iconColorClass = "text-error-icon",
  iconBgClass = "bg-error-bg",
  errorDetails,
  componentStack,
  compact = false,
  className = "",
}) => {
  const showDevDetails = __DEV__ && (errorDetails || componentStack);

  const iconSize = compact ? "w-12 h-12" : "w-20 h-20";
  const iconInnerSize = compact ? "w-6 h-6" : "w-10 h-10";
  const spacing = compact ? "py-6" : "py-12";
  const buttonSize = compact ? "md" : "lg";

  const content = (
    <View className={`flex-1 items-center justify-center px-6 ${spacing} ${className}`}>
      {/* Icon */}
      <View className={`${iconSize} rounded-full items-center justify-center mb-4 ${iconBgClass}`}>
        <Icon as={CustomIcon} className={`${iconInnerSize} ${iconColorClass}`} />
      </View>

      {/* Title */}
      <Text
        className={`${compact ? "text-body-lg" : "text-heading-xl"} font-bold text-content-emphasis text-center mb-2`}
      >
        {title}
      </Text>

      {/* Message */}
      <Text className="text-body-sm text-content-muted text-center mb-6 max-w-xs">{message}</Text>

      {/* Action Buttons */}
      <VStack space="sm" className="w-full max-w-xs">
        {onRetry && (
          <Button onPress={onRetry} size={buttonSize} className="w-full" disabled={isRetrying}>
            <ButtonIcon as={RefreshCw} className={isRetrying ? "animate-spin" : ""} />
            <ButtonText>{isRetrying ? "Retrying..." : retryText}</ButtonText>
          </Button>
        )}

        {showHomeButton && onGoHome && (
          <Button onPress={onGoHome} variant="outline" size={buttonSize} className="w-full">
            <ButtonIcon as={Home} />
            <ButtonText>Go to Home</ButtonText>
          </Button>
        )}
      </VStack>

      {/* Dev-only Error Details */}
      {showDevDetails && (
        <View className="mt-6 p-4 bg-surface-sunken rounded-xl w-full max-w-sm">
          <Text className="text-body-sm font-semibold text-content-emphasis mb-2">
            Error Details (Dev Only)
          </Text>
          {errorDetails && (
            <Text className="text-caption text-error-text font-mono mb-2">{errorDetails}</Text>
          )}
          {componentStack && (
            <Text className="text-caption text-content-muted font-mono" numberOfLines={8}>
              {componentStack}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  // In compact mode, don't wrap with SafeAreaView/ScrollView
  if (compact) {
    return content;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView contentContainerClassName="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GeneralError;
