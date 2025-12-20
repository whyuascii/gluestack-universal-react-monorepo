import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSubscription } from "../hooks/useSubscription";

interface SubscriptionStatusProps {
  /**
   * Callback when user presses "Manage Subscription"
   */
  onManagePress?: () => void;

  /**
   * Callback when user presses "Upgrade to Premium"
   */
  onUpgradePress?: () => void;

  /**
   * Custom class name for styling
   */
  className?: string;
}

/**
 * SubscriptionStatus Component
 *
 * Displays current subscription status with action buttons
 */
export function SubscriptionStatus({
  onManagePress,
  onUpgradePress,
  className = "",
}: SubscriptionStatusProps) {
  const { isPremium, isLoading, hasMonthly, hasYearly, expirationDate, willRenew } =
    useSubscription();

  if (isLoading) {
    return (
      <View className={`p-4 ${className}`}>
        <ActivityIndicator />
        <Text className="text-center mt-2 text-typography-500">Loading subscription status...</Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View className={`p-4 bg-background-50 rounded-lg ${className}`}>
        <Text className="text-lg font-semibold text-typography-900 mb-2">Free Plan</Text>
        <Text className="text-typography-600 mb-4">
          Upgrade to Nest Quest to unlock all features
        </Text>
        {onUpgradePress && (
          <Pressable
            onPress={onUpgradePress}
            className="bg-primary-500 py-3 px-4 rounded-lg active:opacity-80"
          >
            <Text className="text-white text-center font-semibold">Upgrade to Premium</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // User has premium
  const planType = hasYearly ? "Yearly Plan" : hasMonthly ? "Monthly Plan" : "Premium Plan";

  const expirationText = expirationDate
    ? willRenew
      ? `Renews on ${expirationDate.toLocaleDateString()}`
      : `Expires on ${expirationDate.toLocaleDateString()}`
    : "Active";

  return (
    <View className={`p-4 bg-primary-50 rounded-lg ${className}`}>
      <View className="flex-row items-center mb-2">
        <Text className="text-lg font-semibold text-primary-900 flex-1">{planType}</Text>
        <View className="bg-primary-500 py-1 px-3 rounded-full">
          <Text className="text-white text-xs font-semibold">ACTIVE</Text>
        </View>
      </View>

      <Text className="text-typography-600 mb-4">{expirationText}</Text>

      {onManagePress && (
        <Pressable
          onPress={onManagePress}
          className="bg-white border border-primary-300 py-3 px-4 rounded-lg active:opacity-80"
        >
          <Text className="text-primary-700 text-center font-semibold">Manage Subscription</Text>
        </Pressable>
      )}
    </View>
  );
}
