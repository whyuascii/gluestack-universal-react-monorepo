"use client";

/**
 * AuthNavbar (Mobile/Native) - Minimal navigation for auth pages
 *
 * Features:
 * - Centered logo
 * - Optional back button
 * - No language switcher on mobile (cleaner UX - language set in device settings)
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@app/components";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react-native";
import { iconColors } from "../../constants/colors";

export interface AuthNavbarProps {
  /** Show back button */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Logo text (single letter) */
  logoText?: string;
  /** Show language switcher - ignored on mobile */
  showLanguageSwitcher?: boolean;
  /** Navigate to home - used on web */
  onNavigateToHome?: () => void;
}

export const AuthNavbar: React.FC<AuthNavbarProps> = ({
  showBack = false,
  onBack,
  logoText = "A",
}) => {
  const { t } = useTranslation("common");

  return (
    <View className="flex-row items-center justify-between py-4 px-5 bg-background-0 border-b border-outline-200">
      {/* Left: Back button or spacer */}
      <View className="flex-1 items-start">
        {showBack && onBack ? (
          <Pressable
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-background-100 items-center justify-center"
          >
            <ArrowLeft size={24} color={iconColors.inactive} />
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {/* Center: Logo */}
      <View className="flex-2 flex-row items-center justify-center gap-3">
        <View className="w-9 h-9 rounded-full bg-primary-500 items-center justify-center">
          <Text className="text-typography-0 font-bold text-lg">{logoText}</Text>
        </View>
        <Text className="text-xl font-bold text-typography-900">{t("app.name")}</Text>
      </View>

      {/* Right: Spacer for balance */}
      <View className="flex-1 items-end">
        <View className="w-10" />
      </View>
    </View>
  );
};

export default AuthNavbar;
