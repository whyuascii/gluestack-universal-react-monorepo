"use client";

/**
 * SettingsScreen - User and group settings (private, authenticated)
 *
 * Tabbed interface for notifications, members, group, and account settings.
 * Cross-platform compatible (web + mobile).
 */

import { Bell, Users, Settings, User, CreditCard, Shield } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import {
  NotificationSettings,
  MembersSettings,
  GroupSettings,
  AccountSettings,
  BillingSettings,
  PrivacySettings,
} from "./components";

type SettingsSection = "notifications" | "members" | "group" | "billing" | "privacy" | "account";

export interface SettingsScreenProps {
  /** Current user's ID */
  userId?: string;
  /** Current user's name */
  userName?: string;
  /** Current user's email */
  userEmail?: string;
  /** Active tenant/group name */
  activeTenantName?: string;
  /** Current user's role in the active tenant */
  currentUserRole?: "owner" | "admin" | "member";
  /** Whether the user has a tenant/group */
  hasTenant?: boolean;
  /** Navigate to invite members screen */
  onNavigateToInvite?: () => void;
  /** Called when user successfully leaves group */
  onLeaveGroupSuccess?: () => void;
  /** Logout handler */
  onLogout?: () => void;
  /** Loading state for logout */
  isLoggingOut?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userId,
  userName,
  userEmail,
  activeTenantName,
  currentUserRole = "member",
  hasTenant = true,
  onNavigateToInvite,
  onLeaveGroupSuccess,
  onLogout,
  isLoggingOut = false,
}) => {
  const { t } = useTranslation("settings");
  const { width: screenWidth } = useWindowDimensions();
  const [activeSection, setActiveSection] = useState<SettingsSection>("notifications");

  const isSmallScreen = screenWidth < 380;
  const isLargeScreen = screenWidth >= 768;

  const horizontalPadding = isSmallScreen ? 16 : isLargeScreen ? 32 : 24;

  const sections: {
    key: SettingsSection;
    label: string;
    icon: typeof Bell;
    requiresTenant?: boolean;
  }[] = [
    { key: "notifications", label: t("sections.notifications"), icon: Bell },
    { key: "members", label: t("sections.members"), icon: Users, requiresTenant: true },
    { key: "group", label: t("sections.group"), icon: Settings, requiresTenant: true },
    { key: "billing", label: t("sections.billing"), icon: CreditCard, requiresTenant: true },
    { key: "privacy", label: t("sections.privacy"), icon: Shield },
    { key: "account", label: t("sections.account"), icon: User },
  ];

  const availableSections = sections.filter((s) => !s.requiresTenant || hasTenant);

  const renderContent = () => {
    switch (activeSection) {
      case "notifications":
        return <NotificationSettings />;

      case "members":
        return <MembersSettings currentUserId={userId} onNavigateToInvite={onNavigateToInvite} />;

      case "group":
        return (
          <GroupSettings
            tenantName={activeTenantName}
            currentUserRole={currentUserRole}
            onLeaveSuccess={onLeaveGroupSuccess}
          />
        );

      case "billing":
        return <BillingSettings />;

      case "privacy":
        return <PrivacySettings />;

      case "account":
        return (
          <AccountSettings
            userName={userName}
            userEmail={userEmail}
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: horizontalPadding },
        isLargeScreen && styles.containerLarge,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, isLargeScreen && styles.contentLarge]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>{t("title")}</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {availableSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;
              return (
                <TouchableOpacity
                  key={section.key}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveSection(section.key)}
                  activeOpacity={0.7}
                >
                  <Icon size={18} color={isActive ? "#dc2626" : "#6b7280"} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {section.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>{renderContent()}</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  containerLarge: {
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  contentLarge: {
    maxWidth: 800,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  titleSmall: {
    fontSize: 20,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tabActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#dc2626",
  },
  contentSection: {
    flex: 1,
  },
});

export default SettingsScreen;
