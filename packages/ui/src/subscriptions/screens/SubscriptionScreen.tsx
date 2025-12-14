import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SubscriptionStatus } from "../components/SubscriptionStatus";
import { usePaywall } from "../hooks/usePaywall";
import { useRevenueCat } from "../hooks/useRevenueCat";
import { useSubscription } from "../hooks/useSubscription";
import { PaywallScreen } from "./PaywallScreen";

/**
 * SubscriptionScreen Component
 *
 * Main screen for managing subscriptions
 * Shows current status, allows upgrades, and provides restore/manage options
 */
export function SubscriptionScreen() {
  const [isRestoring, setIsRestoring] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const { isPremium, customerInfo } = useSubscription();
  const { restorePurchases, presentCustomerCenter, isCustomerCenterAvailable } = useRevenueCat();
  const { showPaywall: showPaywallNative } = usePaywall();

  // Handle restore purchases
  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      await restorePurchases();

      if (Platform.OS === "web") {
        alert("Purchases restored successfully!");
      } else {
        Alert.alert("Success", "Purchases restored successfully!");
      }
    } catch (err) {
      const error = err as { message?: string };
      console.error(error);
      if (Platform.OS === "web") {
        alert(error.message || "Failed to restore purchases");
      } else {
        Alert.alert("Error", error.message || "Failed to restore purchases");
      }
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle manage subscription
  const handleManage = () => {
    if (isCustomerCenterAvailable) {
      // Use native Customer Center on mobile
      presentCustomerCenter();
    } else {
      // On web, direct to external management
      if (Platform.OS === "web") {
        window.open("https://apps.apple.com/account/subscriptions", "_blank");
      }
    }
  };

  // Handle upgrade
  const handleUpgrade = () => {
    if (Platform.OS === "web") {
      setShowPaywall(true);
    } else {
      showPaywallNative();
    }
  };

  return (
    <View className="flex-1 bg-background-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-white border-b border-outline-100">
          <Text className="text-2xl font-bold text-typography-900 mb-2">Subscription</Text>
          <Text className="text-typography-600">Manage your sample subscription</Text>
        </View>

        {/* Status Card */}
        <View className="p-6">
          <SubscriptionStatus
            onManagePress={isPremium ? handleManage : undefined}
            onUpgradePress={!isPremium ? handleUpgrade : undefined}
          />
        </View>

        {/* Actions */}
        <View className="p-6 pt-0">
          {/* Restore Purchases */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-typography-900 mb-2">
              Restore Purchases
            </Text>
            <Text className="text-typography-600 mb-4">
              Already subscribed? Restore your purchases to access premium features.
            </Text>
            <Pressable
              onPress={handleRestore}
              disabled={isRestoring}
              className={`py-3 px-4 rounded-lg border ${
                isRestoring
                  ? "border-outline-200 bg-background-50"
                  : "border-primary-300 bg-white active:opacity-80"
              }`}
            >
              {isRestoring ? (
                <ActivityIndicator />
              ) : (
                <Text className="text-primary-700 text-center font-semibold">
                  Restore Purchases
                </Text>
              )}
            </Pressable>
          </View>

          {/* Subscription Details (if premium) */}
          {isPremium && customerInfo && (
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-lg font-semibold text-typography-900 mb-3">
                Subscription Details
              </Text>

              <DetailRow label="User ID" value={customerInfo.originalAppUserId} />
              <DetailRow
                label="Active Subscriptions"
                value={customerInfo.activeSubscriptions.join(", ") || "None"}
              />
              {customerInfo.originalApplicationVersion && (
                <DetailRow
                  label="Original Version"
                  value={customerInfo.originalApplicationVersion}
                />
              )}
            </View>
          )}

          {/* Support */}
          <View className="bg-white rounded-lg p-4">
            <Text className="text-lg font-semibold text-typography-900 mb-2">Need Help?</Text>
            <Text className="text-typography-600 mb-4">
              Contact our support team if you have any questions about your subscription.
            </Text>
            <Pressable
              onPress={() => {
                // TODO: Add support link
                if (Platform.OS === "web") {
                  alert("Support coming soon!");
                } else {
                  Alert.alert("Support", "Support coming soon!");
                }
              }}
              className="py-3 px-4 rounded-lg border border-outline-300 bg-white active:opacity-80"
            >
              <Text className="text-typography-700 text-center font-semibold">Contact Support</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Paywall Modal (Web only) */}
      {Platform.OS === "web" && (
        <PaywallScreen visible={showPaywall} onDismiss={() => setShowPaywall(false)} />
      )}
    </View>
  );
}

// Detail row component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-outline-100">
      <Text className="text-typography-600">{label}</Text>
      <Text className="text-typography-900 font-medium">{value}</Text>
    </View>
  );
}
