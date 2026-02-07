import { VStack, HStack, Text, Pressable, Button, ButtonText, Divider } from "@app/components";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { iconColors } from "../constants/colors";

export interface TenantInfo {
  tenantId: string;
  tenantName: string;
  role: "owner" | "admin" | "member";
}

export interface TenantSwitcherProps {
  activeTenantId: string | null;
  tenants: TenantInfo[];
  onSwitch: (tenantId: string) => Promise<void>;
  onCreateNew: () => void;
  onClose?: () => void;
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
  activeTenantId,
  tenants,
  onSwitch,
  onCreateNew,
  onClose,
}) => {
  const { t } = useTranslation("group");
  const [switching, setSwitching] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleSwitch = async (tenantId: string) => {
    if (tenantId === activeTenantId) {
      onClose?.();
      return;
    }

    setSwitching(true);
    setSwitchingId(tenantId);

    try {
      await onSwitch(tenantId);
      onClose?.();
    } catch (error) {
      console.error("Failed to switch tenant:", error);
    } finally {
      setSwitching(false);
      setSwitchingId(null);
    }
  };

  return (
    <View className="bg-background-0 rounded-lg shadow-lg p-4 min-w-[280px]">
      <VStack space="sm">
        {/* Header */}
        <Text className="font-semibold text-lg">{t("switcher.groups")}</Text>

        {/* Tenant list */}
        <VStack space="xs">
          {tenants.map((tenant) => {
            const isActive = tenant.tenantId === activeTenantId;
            const isSwitching = switchingId === tenant.tenantId;

            return (
              <Pressable
                key={tenant.tenantId}
                onPress={() => handleSwitch(tenant.tenantId)}
                disabled={switching}
                className={`p-3 rounded-md ${
                  isActive ? "bg-primary-50" : "hover:bg-background-50"
                }`}
              >
                <HStack space="sm" className="items-center justify-between">
                  <VStack space="xs" className="flex-1">
                    <Text className="font-medium">{tenant.tenantName}</Text>
                    <Text className="text-xs text-typography-400 capitalize">{tenant.role}</Text>
                  </VStack>

                  {isActive && (
                    <View className="flex-row items-center">
                      <Text className="text-xs text-primary-600 mr-1">{t("switcher.current")}</Text>
                      <Check size={16} color={iconColors.active} />
                    </View>
                  )}

                  {isSwitching && (
                    <Text className="text-xs text-typography-400">{t("switcher.switching")}</Text>
                  )}
                </HStack>
              </Pressable>
            );
          })}
        </VStack>

        {/* Divider */}
        <Divider className="my-2" />

        {/* Create new button */}
        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            onCreateNew();
            onClose?.();
          }}
          isDisabled={switching}
        >
          <ButtonText>{t("switcher.createNew")}</ButtonText>
        </Button>
      </VStack>
    </View>
  );
};
