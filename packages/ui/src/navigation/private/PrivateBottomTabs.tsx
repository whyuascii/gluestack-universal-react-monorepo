"use client";

/**
 * PrivateBottomTabs - Bottom tab navigation for authenticated mobile pages
 *
 * Features:
 * - 4 main tabs: Dashboard, Todos, Groups, Settings
 * - Active state highlighting
 * - Icon + label
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import { View, Pressable, Platform } from "react-native";
import { Text } from "@app/components";
import { useTranslation } from "react-i18next";
import { Home, ListTodo, Users, Settings } from "lucide-react-native";
import type { NavRoute } from "../types";
import { iconColors } from "../../constants/colors";

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ icon, label, isActive, onPress }) => (
  <Pressable onPress={onPress} className="flex-1 items-center justify-center py-1 gap-0.5">
    {icon}
    <Text
      className={`text-[11px] font-medium mt-0.5 ${
        isActive ? "text-primary-500" : "text-typography-500"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

export interface PrivateBottomTabsProps {
  /** Current active tab */
  activeTab?: NavRoute;
  /** Navigation callbacks */
  onNavigateToDashboard?: () => void;
  onNavigateToTodos?: () => void;
  onNavigateToGroup?: () => void;
  onNavigateToSettings?: () => void;
}

export const PrivateBottomTabs: React.FC<PrivateBottomTabsProps> = ({
  activeTab,
  onNavigateToDashboard,
  onNavigateToTodos,
  onNavigateToGroup,
  onNavigateToSettings,
}) => {
  const { t } = useTranslation("common");

  const tabs: {
    key: NavRoute;
    icon: (isActive: boolean) => React.ReactNode;
    label: string;
    onPress?: () => void;
  }[] = [
    {
      key: "dashboard",
      icon: (isActive) => (
        <Home size={22} color={isActive ? iconColors.active : iconColors.inactive} />
      ),
      label: t("navigation.dashboard"),
      onPress: onNavigateToDashboard,
    },
    {
      key: "todos",
      icon: (isActive) => (
        <ListTodo size={22} color={isActive ? iconColors.active : iconColors.inactive} />
      ),
      label: t("navigation.todos"),
      onPress: onNavigateToTodos,
    },
    {
      key: "group",
      icon: (isActive) => (
        <Users size={22} color={isActive ? iconColors.active : iconColors.inactive} />
      ),
      label: t("navigation.groups"),
      onPress: onNavigateToGroup,
    },
    {
      key: "settings",
      icon: (isActive) => (
        <Settings size={22} color={isActive ? iconColors.active : iconColors.inactive} />
      ),
      label: t("navigation.settings"),
      onPress: onNavigateToSettings,
    },
  ];

  return (
    <View
      className="flex-row bg-background-0 border-t border-outline-200 px-2 pt-2"
      style={{ paddingBottom: Platform.OS === "ios" ? 20 : 8 }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TabItem
            key={tab.key}
            icon={tab.icon(isActive)}
            label={tab.label}
            isActive={isActive}
            onPress={() => tab.onPress?.()}
          />
        );
      })}
    </View>
  );
};

export default PrivateBottomTabs;
