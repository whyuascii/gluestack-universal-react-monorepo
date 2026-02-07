/**
 * PrimaryButton Component
 *
 * A high-quality, accessible button using NativeWind theming.
 * Supports solid/outline variants, loading states, and icons.
 *
 * Uses semantic theme tokens from @app/tailwind-config for consistency.
 */

import React, { useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Platform } from "react-native";

export interface PrimaryButtonProps {
  /** Press handler */
  onPress: () => void;
  /** Button content (text or children) */
  children: React.ReactNode;
  /** Loading state - shows spinner and disables interaction */
  isLoading?: boolean;
  /** Disabled state */
  isDisabled?: boolean;
  /** Visual variant */
  variant?: "solid" | "outline" | "ghost";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Test ID for testing */
  testID?: string;
  /** Additional className for customization */
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  children,
  isLoading = false,
  isDisabled = false,
  variant = "solid",
  size = "md",
  rightIcon,
  leftIcon,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  className = "",
}) => {
  const isButtonDisabled = isDisabled || isLoading;

  // Derive accessibility label from children if not provided
  const derivedLabel = accessibilityLabel ?? (typeof children === "string" ? children : undefined);

  // Handle keyboard events for web accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (Platform.OS === "web" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        if (!isButtonDisabled) {
          onPress();
        }
      }
    },
    [isButtonDisabled, onPress]
  );

  // Size classes
  const sizeClasses = {
    sm: "min-h-[40px] px-4 py-2 rounded-xl",
    md: "min-h-[52px] px-6 py-3.5 rounded-[26px]",
    lg: "min-h-[60px] px-8 py-4 rounded-[30px]",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Variant classes using semantic tokens
  const variantClasses = {
    solid: "bg-primary-500 active:bg-primary-600",
    outline: "bg-transparent border-2 border-primary-500 active:bg-primary-50",
    ghost: "bg-transparent active:bg-primary-50",
  };

  const textVariantClasses = {
    solid: "text-white",
    outline: "text-primary-500",
    ghost: "text-primary-500",
  };

  // Disabled state classes
  const disabledClasses = isButtonDisabled ? "opacity-50" : "";

  // Width class
  const widthClass = fullWidth ? "w-full" : "";

  // Combine all classes
  const buttonClasses = [
    "justify-center items-center",
    "transition-all duration-fast",
    "focus:outline-none",
    Platform.OS === "web"
      ? "focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
      : "",
    sizeClasses[size],
    variantClasses[variant],
    disabledClasses,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const textClasses = ["font-semibold", textSizeClasses[size], textVariantClasses[variant]].join(
    " "
  );

  // Spinner color based on variant
  const spinnerColor = variant === "solid" ? "#FFFFFF" : "#F97066";

  return (
    <Pressable
      onPress={onPress}
      disabled={isButtonDisabled}
      accessibilityRole="button"
      accessibilityLabel={derivedLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isButtonDisabled,
        busy: isLoading,
      }}
      testID={testID}
      {...(Platform.OS === "web" && { onKeyDown: handleKeyDown })}
      className={buttonClasses}
    >
      <View className="flex-row items-center justify-center gap-2">
        {/* Loading spinner */}
        {isLoading && (
          <ActivityIndicator size="small" color={spinnerColor} accessibilityLabel="Loading" />
        )}

        {/* Left icon */}
        {leftIcon && !isLoading && (
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {leftIcon}
          </View>
        )}

        {/* Button text */}
        <Text
          className={textClasses}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {children}
        </Text>

        {/* Right icon */}
        {rightIcon && !isLoading && (
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {rightIcon}
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default PrimaryButton;
