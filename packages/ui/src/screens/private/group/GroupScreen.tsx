"use client";

/**
 * GroupScreen - Group/tenant management (private, authenticated)
 *
 * Shows current group info and members.
 */

import type { Session } from "@app/auth";
import { Users, UserPlus, Settings } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";

export interface GroupScreenProps {
  session: Session | null;
  tenantName?: string;
  tenantId?: string;
  memberCount?: number;
  userRole?: "owner" | "admin" | "member";
  onNavigateToInvite?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToCreateGroup?: () => void;
}

export const GroupScreen: React.FC<GroupScreenProps> = ({
  session,
  tenantName,
  tenantId,
  memberCount = 0,
  userRole = "member",
  onNavigateToInvite,
  onNavigateToSettings,
  onNavigateToCreateGroup,
}) => {
  const { t } = useTranslation("group");
  const { width: screenWidth } = useWindowDimensions();

  const isSmallScreen = screenWidth < 380;
  const horizontalPadding = isSmallScreen ? 16 : 24;

  const hasGroup = !!tenantId;
  const canInvite = userRole === "owner" || userRole === "admin";
  const canManage = userRole === "owner" || userRole === "admin";

  if (!hasGroup) {
    return (
      <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.emptyState}>
          <Users size={48} color="#d1d5db" />
          <Text style={styles.emptyStateTitle}>{t("noGroup.title", "No Group Yet")}</Text>
          <Text style={styles.emptyStateText}>
            {t("noGroup.description", "Create or join a group to get started.")}
          </Text>
          {onNavigateToCreateGroup && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={onNavigateToCreateGroup}
              activeOpacity={0.7}
            >
              <Text style={styles.createButtonText}>
                {t("noGroup.createButton", "Create Group")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
          {t("title", "Group")}
        </Text>
      </View>

      {/* Group Info Card */}
      <View style={styles.groupCard}>
        <View style={styles.groupIcon}>
          <Users size={32} color="#dc2626" />
        </View>
        <Text style={styles.groupName}>{tenantName || t("unnamed", "Unnamed Group")}</Text>
        <Text style={styles.memberCount}>
          {memberCount} {memberCount === 1 ? t("member", "member") : t("members", "members")}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{userRole}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {canInvite && onNavigateToInvite && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onNavigateToInvite}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <UserPlus size={24} color="#dc2626" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{t("actions.invite.title", "Invite Members")}</Text>
              <Text style={styles.actionDescription}>
                {t("actions.invite.description", "Add new people to your group")}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {canManage && onNavigateToSettings && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onNavigateToSettings}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Settings size={24} color="#6b7280" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                {t("actions.settings.title", "Group Settings")}
              </Text>
              <Text style={styles.actionDescription}>
                {t("actions.settings.description", "Manage group preferences")}
              </Text>
            </View>
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  groupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  groupIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textTransform: "capitalize",
  },
  actions: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: "#6b7280",
  },
});

export default GroupScreen;
