import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePaywall } from "../hooks/usePaywall";
import { useRevenueCat } from "../hooks/useRevenueCat";
import { useSubscription } from "../hooks/useSubscription";

interface Package {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
  };
}

// Type for web-specific paywall hook methods
interface WebPaywallHook {
  showPaywall: () => Promise<unknown>;
  showPaywallIfNeeded: (entitlement?: string) => Promise<unknown>;
  dismissPaywall: (result: unknown) => void;
  isPaywallVisible: boolean;
  onPurchaseSuccess?: () => void;
  onPurchaseCancel?: () => void;
  onPurchaseError?: () => void;
}

interface PaywallScreenProps {
  /**
   * Whether the paywall is visible (for modal mode)
   */
  visible?: boolean;

  /**
   * Callback when paywall is dismissed
   */
  onDismiss?: () => void;

  /**
   * Whether to render as a modal (default: true on web, false on native)
   */
  asModal?: boolean;
}

/**
 * PaywallScreen Component
 *
 * Displays subscription packages and handles purchases
 */
export function PaywallScreen({
  visible = true,
  onDismiss,
  asModal = Platform.OS === "web",
}: PaywallScreenProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getOfferings, purchasePackage } = useRevenueCat();
  const paywallHook = usePaywall();
  const { isPremium } = useSubscription();

  // Only use web-specific paywall methods on web platform
  const webHook = Platform.OS === "web" ? (paywallHook as WebPaywallHook) : null;
  const onPurchaseSuccess = webHook?.onPurchaseSuccess;
  const onPurchaseCancel = webHook?.onPurchaseCancel;

  // Load offerings
  useEffect(() => {
    async function loadOfferings() {
      try {
        setIsLoading(true);
        const offerings = await getOfferings();
        const currentOffering =
          Platform.OS === "web"
            ? (offerings as { current: { availablePackages?: Package[] } }).current
            : (offerings as { current: { availablePackages?: Package[] } }).current;

        if (currentOffering?.availablePackages) {
          setPackages(currentOffering.availablePackages);
          // Auto-select first package
          if (currentOffering.availablePackages.length > 0) {
            setSelectedPackage(currentOffering.availablePackages[0]);
          }
        }
      } catch (err) {
        setError("Failed to load subscription plans");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (visible) {
      loadOfferings();
    }
  }, [visible, getOfferings]);

  // Handle purchase
  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setIsPurchasing(true);
      setError(null);
      // Cast to unknown first, then to the expected type
      // Package type from offerings is compatible but TypeScript needs help
      await purchasePackage(selectedPackage as unknown as Parameters<typeof purchasePackage>[0]);

      // Purchase successful
      if (Platform.OS === "web" && onPurchaseSuccess) {
        onPurchaseSuccess();
      }
      onDismiss?.();
    } catch (err) {
      // User cancelled
      const error = err as { userCancelled?: boolean; message?: string };
      if (error.userCancelled) {
        if (Platform.OS === "web" && onPurchaseCancel) {
          onPurchaseCancel();
        }
        return;
      }

      // Purchase error
      setError(error.message || "Purchase failed. Please try again.");
      console.error(error);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle close
  const handleClose = useCallback(() => {
    if (Platform.OS === "web" && onPurchaseCancel) {
      onPurchaseCancel();
    }
    onDismiss?.();
  }, [onPurchaseCancel, onDismiss]);

  // If user is already premium, don't show paywall
  useEffect(() => {
    if (isPremium && visible) {
      handleClose();
    }
  }, [isPremium, visible, handleClose]);

  const content = (
    <View className="flex-1 bg-background-0">
      {/* Header */}
      <View className="p-6 bg-primary-500">
        <Text className="text-2xl font-bold text-white text-center mb-2">Unlock Sample App</Text>
        <Text className="text-white/90 text-center">Get access to all premium features</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Features */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-typography-900 mb-3">Premium Features</Text>
          <FeatureItem text="Unlimited access to all features" />
          <FeatureItem text="Priority customer support" />
          <FeatureItem text="Advanced analytics and insights" />
          <FeatureItem text="Ad-free experience" />
        </View>

        {/* Packages */}
        {isLoading ? (
          <View className="py-8">
            <ActivityIndicator size="large" />
            <Text className="text-center mt-4 text-typography-500">Loading plans...</Text>
          </View>
        ) : packages.length === 0 ? (
          <View className="py-8">
            <Text className="text-center text-typography-600">No subscription plans available</Text>
          </View>
        ) : (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-typography-900 mb-3">Choose Your Plan</Text>
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.identifier}
                package={pkg}
                isSelected={selectedPackage?.identifier === pkg.identifier}
                onSelect={() => setSelectedPackage(pkg)}
              />
            ))}
          </View>
        )}

        {/* Error */}
        {error && (
          <View className="bg-error-50 border border-error-300 rounded-lg p-4 mb-4">
            <Text className="text-error-700">{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="p-6 border-t border-outline-100">
        <Pressable
          onPress={handlePurchase}
          disabled={!selectedPackage || isPurchasing}
          className={`py-4 px-6 rounded-lg mb-3 ${
            !selectedPackage || isPurchasing ? "bg-primary-300" : "bg-primary-500 active:opacity-80"
          }`}
        >
          {isPurchasing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">Subscribe Now</Text>
          )}
        </Pressable>

        <Pressable onPress={handleClose} className="py-3 px-6 active:opacity-60">
          <Text className="text-typography-600 text-center">Maybe Later</Text>
        </Pressable>
      </View>
    </View>
  );

  if (asModal) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        {content}
      </Modal>
    );
  }

  return content;
}

// Feature item component
function FeatureItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center mb-2">
      <View className="w-6 h-6 bg-success-500 rounded-full items-center justify-center mr-3">
        <Text className="text-white font-bold">✓</Text>
      </View>
      <Text className="text-typography-700 flex-1">{text}</Text>
    </View>
  );
}

// Package card component
function PackageCard({
  package: pkg,
  isSelected,
  onSelect,
}: {
  package: Package;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isPopular = pkg.packageType === "ANNUAL" || pkg.packageType === "YEARLY";

  return (
    <Pressable
      onPress={onSelect}
      className={`p-4 rounded-lg mb-3 border-2 ${
        isSelected ? "border-primary-500 bg-primary-50" : "border-outline-200 bg-background-0"
      }`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-typography-900">{pkg.product.title}</Text>
          <Text className="text-typography-600 text-sm">{pkg.product.description}</Text>
        </View>
        {isPopular && (
          <View className="bg-success-500 py-1 px-2 rounded">
            <Text className="text-white text-xs font-semibold">POPULAR</Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-primary-600">{pkg.product.priceString}</Text>
    </Pressable>
  );
}
