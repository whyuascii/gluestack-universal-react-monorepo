"use client";

/**
 * ProfileScreen - User profile management (private, authenticated)
 */

import type { Session } from "@app/auth";
import { User, Mail, Camera, LogOut } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";

export interface ProfileScreenProps {
  session: Session | null;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  session,
  onEditProfile,
  onChangePassword,
  onLogout,
  isLoggingOut = false,
}) => {
  const { t } = useTranslation("common");
  const { width: screenWidth } = useWindowDimensions();

  const isSmallScreen = screenWidth < 380;
  const horizontalPadding = isSmallScreen ? 16 : 24;

  const user = session?.user;
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
          {t("profile.title", "Profile")}
        </Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <TouchableOpacity style={styles.cameraButton} activeOpacity={0.7}>
            <Camera size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <User size={18} color="#6b7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t("profile.name", "Name")}</Text>
            <Text style={styles.infoValue}>{user?.name || "-"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Mail size={18} color="#6b7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t("profile.email", "Email")}</Text>
            <Text style={styles.infoValue}>{user?.email || "-"}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onEditProfile && (
          <TouchableOpacity style={styles.actionButton} onPress={onEditProfile} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>{t("profile.edit", "Edit Profile")}</Text>
          </TouchableOpacity>
        )}
        {onChangePassword && (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onChangePassword}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {t("profile.changePassword", "Change Password")}
            </Text>
          </TouchableOpacity>
        )}
        {onLogout && (
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={onLogout}
            activeOpacity={0.7}
            disabled={isLoggingOut}
          >
            <LogOut size={18} color="#dc2626" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>
              {isLoggingOut ? t("common:loading", "Loading...") : t("profile.logout", "Log Out")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#dc2626",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },
  logoutButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default ProfileScreen;
