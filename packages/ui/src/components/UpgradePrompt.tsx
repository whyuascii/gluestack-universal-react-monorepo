/**
 * UpgradePrompt Component
 *
 * Prompts users to upgrade when they hit plan limits or try to access premium features.
 * Can be rendered inline or as a modal overlay.
 */

import { VStack, HStack, Text, Button, ButtonText, Icon, Pressable } from "@app/components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useCheckout } from "../hooks/mutations";

export interface UpgradePromptProps {
  /**
   * Type of limit reached
   */
  type: "member_limit" | "feature_limit" | "generic";
  /**
   * Callback when upgrade is initiated (for navigation)
   */
  onUpgrade?: (checkoutUrl: string) => void;
  /**
   * Callback when user dismisses the prompt
   */
  onDismiss?: () => void;
  /**
   * Whether to show as a full-screen overlay
   */
  variant?: "inline" | "overlay";
  /**
   * Custom title (optional, uses i18n default otherwise)
   */
  title?: string;
  /**
   * Custom description (optional, uses i18n default otherwise)
   */
  description?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  type,
  onUpgrade,
  onDismiss,
  variant = "inline",
  title,
  description,
}) => {
  const { t } = useTranslation("subscriptions");
  const checkout = useCheckout();

  const handleUpgrade = async () => {
    try {
      const result = await checkout.mutateAsync({ planId: "pro" });
      if (result.checkoutUrl) {
        onUpgrade?.(result.checkoutUrl);
      }
    } catch {
      // Error handled by mutation
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "member_limit":
        return t("upgrade.memberLimit");
      case "feature_limit":
        return t("upgrade.featureLimit");
      default:
        return t("upgrade.title");
    }
  };

  const displayTitle = title || getDefaultTitle();
  const displayDescription = description || t("billing.upgradeDescription");

  const content = (
    <VStack
      space="md"
      className={`p-6 rounded-xl ${
        variant === "overlay"
          ? "bg-background-0 shadow-lg max-w-md w-full"
          : "bg-warning-50 border border-warning-200"
      }`}
    >
      <VStack space="sm">
        <Text className="text-lg font-semibold text-typography-900">{displayTitle}</Text>
        <Text className="text-sm text-typography-600">{displayDescription}</Text>
      </VStack>

      <HStack space="sm" className="justify-end">
        {onDismiss && (
          <Button variant="outline" onPress={onDismiss}>
            <ButtonText>{t("paywall.maybeLater")}</ButtonText>
          </Button>
        )}
        <Button onPress={handleUpgrade} disabled={checkout.isPending} className="bg-primary-600">
          <ButtonText className="text-typography-0">
            {checkout.isPending ? "..." : t("upgrade.cta")}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  );

  if (variant === "overlay") {
    return (
      <Pressable
        onPress={onDismiss}
        className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <Pressable onPress={(e) => e.stopPropagation()}>{content}</Pressable>
      </Pressable>
    );
  }

  return content;
};

/**
 * Hook to check if an upgrade prompt should be shown
 */
export function useUpgradePromptNeeded(params: {
  currentMemberCount?: number;
  maxMembers?: number;
  requiredFeature?: string;
  enabledFeatures?: string[];
}): { needed: boolean; type: UpgradePromptProps["type"] } {
  const { currentMemberCount, maxMembers, requiredFeature, enabledFeatures } = params;

  // Check member limit
  if (currentMemberCount !== undefined && maxMembers !== undefined) {
    if (currentMemberCount >= maxMembers) {
      return { needed: true, type: "member_limit" };
    }
  }

  // Check feature limit
  if (requiredFeature && enabledFeatures) {
    if (!enabledFeatures.includes(requiredFeature)) {
      return { needed: true, type: "feature_limit" };
    }
  }

  return { needed: false, type: "generic" };
}
