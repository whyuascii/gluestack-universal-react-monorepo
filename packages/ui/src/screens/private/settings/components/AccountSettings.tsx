"use client";

/**
 * AccountSettings - User account management
 *
 * Provides logout functionality. Can be extended for profile settings.
 */

import { LogOut, User } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";

interface AccountSettingsProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  userName,
  userEmail,
  onLogout,
  isLoggingOut = false,
}) => {
  const { t } = useTranslation("settings");

  return (
    <View style={styles.container}>
      {/* User Info Section */}
      {(userName || userEmail) && (
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <User size={24} color="#6b7280" />
          </View>
          <View style={styles.userDetails}>
            {userName && <Text style={styles.userName}>{userName}</Text>}
            {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.title}>{t("account.title")}</Text>
        <Text style={styles.description}>{t("account.description")}</Text>

        {onLogout && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
          >
            {isLoggingOut ? (
              <>
                <ActivityIndicator size="small" color="#dc2626" />
                <Text style={styles.logoutButtonText}>{t("common:loading", "Loading...")}</Text>
              </>
            ) : (
              <>
                <LogOut size={18} color="#dc2626" />
                <Text style={styles.logoutButtonText}>{t("account.logout")}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  userInfo: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutButtonText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default AccountSettings;
