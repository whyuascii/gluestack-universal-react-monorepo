/**
 * Example Usage of RevenueCat Integration
 *
 * This file demonstrates various ways to use the RevenueCat integration.
 * Copy any of these examples into your app screens.
 */

import React, { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { PremiumGate } from "./components/PremiumGate";
import { SubscriptionStatus } from "./components/SubscriptionStatus";
import { usePaywall } from "./hooks/usePaywall";
import { useSubscription } from "./hooks/useSubscription";
import { PaywallScreen } from "./screens/PaywallScreen";

/**
 * Example 1: Simple Premium Feature Gate
 */
export function Example1_PremiumFeature() {
  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-4">Premium Feature</Text>

      <PremiumGate
        showPaywall={true} // Auto-show paywall if not premium
        loadingFallback={<Text>Checking subscription...</Text>}
      >
        <View className="bg-primary-50 p-4 rounded-lg">
          <Text className="text-lg text-primary-900">🎉 This is a premium feature!</Text>
          <Text className="text-typography-600 mt-2">You have access to all premium features.</Text>
        </View>
      </PremiumGate>
    </View>
  );
}

/**
 * Example 2: Manual Paywall Presentation
 */
export function Example2_ManualPaywall() {
  const { isPremium } = useSubscription();
  const { showPaywall } = usePaywall();
  const [showWebPaywall, setShowWebPaywall] = useState(false);

  const handleUpgrade = async () => {
    // On native, this shows the built-in RevenueCat paywall
    // On web, we need to use the PaywallScreen component
    if (Platform.OS === "web") {
      setShowWebPaywall(true);
    } else {
      const result = await showPaywall();
      if (result === "PURCHASED") {
        alert("Thank you for subscribing!");
      }
    }
  };

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-4">Subscription Status</Text>

      {isPremium ? (
        <View className="bg-success-50 p-4 rounded-lg mb-4">
          <Text className="text-success-900 font-semibold">✓ You have Premium</Text>
        </View>
      ) : (
        <View className="bg-warning-50 p-4 rounded-lg mb-4">
          <Text className="text-warning-900 font-semibold">⚠ Free Plan</Text>
          <Pressable
            onPress={handleUpgrade}
            className="bg-primary-500 py-3 px-4 rounded-lg mt-3 active:opacity-80"
          >
            <Text className="text-white text-center font-semibold">Upgrade to Premium</Text>
          </Pressable>
        </View>
      )}

      {/* Web paywall modal */}
      {Platform.OS === "web" && (
        <PaywallScreen visible={showWebPaywall} onDismiss={() => setShowWebPaywall(false)} />
      )}
    </View>
  );
}

/**
 * Example 3: Feature with Custom Fallback
 */
export function Example3_CustomFallback() {
  const { showPaywall } = usePaywall();

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-4">Advanced Analytics</Text>

      <PremiumGate
        fallback={
          <View className="bg-background-50 p-6 rounded-lg border border-outline-200">
            <Text className="text-xl font-semibold text-typography-900 mb-2">Premium Feature</Text>
            <Text className="text-typography-600 mb-4">
              Advanced analytics are available for premium subscribers only.
            </Text>
            <Pressable
              onPress={() => showPaywall()}
              className="bg-primary-500 py-3 px-4 rounded-lg active:opacity-80"
            >
              <Text className="text-white text-center font-semibold">Unlock Now</Text>
            </Pressable>
          </View>
        }
      >
        <View className="bg-white p-4 rounded-lg border border-outline-200">
          <Text className="text-lg font-semibold mb-2">Analytics Dashboard</Text>
          <Text className="text-typography-600">📊 Daily Active Users: 1,234</Text>
          <Text className="text-typography-600">📈 Conversion Rate: 12.5%</Text>
          <Text className="text-typography-600">💰 Revenue: $5,678</Text>
        </View>
      </PremiumGate>
    </View>
  );
}

/**
 * Example 4: Subscription Details Screen
 */
export function Example4_SubscriptionDetails() {
  const {
    isPremium,
    isLoading,
    hasMonthly,
    hasYearly,
    expirationDate,
    willRenew,
    activeSubscriptions,
  } = useSubscription();

  return (
    <ScrollView className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-6">Subscription Details</Text>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {/* Status Card */}
          <View className="bg-white p-4 rounded-lg border border-outline-200 mb-4">
            <Text className="text-lg font-semibold mb-2">Current Plan</Text>
            <Text className={isPremium ? "text-success-600" : "text-typography-600"}>
              {isPremium ? "✓ Premium Active" : "Free Plan"}
            </Text>
          </View>

          {/* Subscription Type */}
          {isPremium && (
            <View className="bg-white p-4 rounded-lg border border-outline-200 mb-4">
              <Text className="text-lg font-semibold mb-2">Plan Type</Text>
              <Text className="text-typography-700">
                {hasYearly
                  ? "Yearly Subscription"
                  : hasMonthly
                    ? "Monthly Subscription"
                    : "Premium"}
              </Text>
            </View>
          )}

          {/* Expiration */}
          {expirationDate && (
            <View className="bg-white p-4 rounded-lg border border-outline-200 mb-4">
              <Text className="text-lg font-semibold mb-2">
                {willRenew ? "Renewal Date" : "Expiration Date"}
              </Text>
              <Text className="text-typography-700">{expirationDate.toLocaleDateString()}</Text>
            </View>
          )}

          {/* Active Subscriptions */}
          <View className="bg-white p-4 rounded-lg border border-outline-200 mb-4">
            <Text className="text-lg font-semibold mb-2">Active Subscriptions</Text>
            <Text className="text-typography-700">
              {activeSubscriptions.length > 0 ? activeSubscriptions.join(", ") : "None"}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

/**
 * Example 5: Settings Screen with Subscription Status
 */
export function Example5_SettingsScreen() {
  // isPremium can be used for conditional rendering if needed
  // const { isPremium } = useSubscription();

  return (
    <ScrollView className="flex-1 bg-background-50">
      {/* Other Settings */}
      <View className="p-6">
        <Text className="text-2xl font-bold mb-6">Settings</Text>

        {/* Account Section */}
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-lg font-semibold mb-2">Account</Text>
          <Pressable className="py-2">
            <Text className="text-typography-700">Profile Settings</Text>
          </Pressable>
          <Pressable className="py-2">
            <Text className="text-typography-700">Privacy</Text>
          </Pressable>
        </View>

        {/* Subscription Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-3">Subscription</Text>
          <SubscriptionStatus
            onManagePress={() => {
              // Navigate to subscription management
              // eslint-disable-next-line no-console
              console.log("Navigate to /subscription");
            }}
            onUpgradePress={() => {
              // Show paywall
              // eslint-disable-next-line no-console
              console.log("Show paywall");
            }}
          />
        </View>

        {/* Other Settings */}
        <View className="bg-white p-4 rounded-lg">
          <Text className="text-lg font-semibold mb-2">Preferences</Text>
          <Pressable className="py-2">
            <Text className="text-typography-700">Notifications</Text>
          </Pressable>
          <Pressable className="py-2">
            <Text className="text-typography-700">Language</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
