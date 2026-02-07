"use client";

/**
 * MembersSettings - Group member management
 *
 * Lists members, allows role changes (admin/owner), and member removal.
 * Respects RBAC - only owners/admins can manage members.
 */

import { UserPlus, MoreVertical, Shield, ShieldCheck, Crown, Trash2 } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Menu,
  MenuItem,
  MenuItemLabel,
} from "@app/components";
import { useGroupMembers, useUpdateMemberRole, useRemoveMember } from "../../../../hooks";

interface MembersSettingsProps {
  currentUserId?: string;
  onNavigateToInvite?: () => void;
}

// Helper for cross-platform confirm dialog
const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string,
  cancelText: string
) => {
  if (Platform.OS === "web") {
    // For web, use native confirm
    const confirmed = (globalThis as unknown as { confirm?: (msg: string) => boolean }).confirm?.(
      `${title}\n\n${message}`
    );
    if (confirmed) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: "cancel" },
      { text: confirmText, style: "destructive", onPress: onConfirm },
    ]);
  }
};

// Helper for cross-platform alert
const showAlertDialog = (message: string) => {
  if (Platform.OS === "web") {
    (globalThis as unknown as { alert?: (msg: string) => void }).alert?.(message);
  } else {
    Alert.alert(message);
  }
};

export const MembersSettings: React.FC<MembersSettingsProps> = ({
  currentUserId,
  onNavigateToInvite,
}) => {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useGroupMembers();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const canManageMembers = data?.currentUserRole === "owner" || data?.currentUserRole === "admin";
  const isOwner = data?.currentUserRole === "owner";

  const handleRoleChange = (memberId: string, memberName: string, newRole: "admin" | "member") => {
    const roleLabel = t(`members.roles.${newRole}`);
    showConfirmDialog(
      t("members.confirmRoleChange.title"),
      t("members.confirmRoleChange.message", { name: memberName, role: roleLabel }),
      () => {
        updateRole.mutate({ memberId, role: newRole });
      },
      t("members.confirmRoleChange.confirm"),
      t("members.confirmRoleChange.cancel")
    );
  };

  const handleRemoveMember = (memberId: string, memberName: string, memberUserId: string) => {
    if (memberUserId === currentUserId) {
      showAlertDialog(t("members.errors.cannotRemoveSelf"));
      return;
    }

    showConfirmDialog(
      t("members.confirmRemove.title"),
      t("members.confirmRemove.message", { name: memberName }),
      () => {
        removeMember.mutate({ memberId });
      },
      t("members.confirmRemove.confirm"),
      t("members.confirmRemove.cancel")
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown size={14} color="#eab308" />;
      case "admin":
        return <ShieldCheck size={14} color="#3b82f6" />;
      default:
        return <Shield size={14} color="#6b7280" />;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#dc2626" />
        <Text style={styles.loadingText}>{t("members.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("members.errors.removeFailed")}</Text>
      </View>
    );
  }

  const members = data?.members ?? [];
  const memberCount = members.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("members.title")}</Text>
          <Text style={styles.subtitle}>
            {memberCount === 1
              ? t("members.count", { count: memberCount })
              : t("members.count_plural", { count: memberCount })}
          </Text>
        </View>
        {canManageMembers && onNavigateToInvite && (
          <TouchableOpacity style={styles.inviteButton} onPress={onNavigateToInvite}>
            <UserPlus size={18} color="#ffffff" />
            <Text style={styles.inviteButtonText}>{t("members.invite")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.membersList}>
        {members.map((member, index) => {
          const isCurrentUser = member.userId === currentUserId;
          const isMemberOwner = member.role === "owner";
          const canManageThisMember = canManageMembers && !isMemberOwner && !isCurrentUser;

          return (
            <View key={member.id}>
              <View style={styles.memberRow}>
                <Avatar size="md">
                  {member.image ? (
                    <AvatarImage source={{ uri: member.image }} />
                  ) : (
                    <AvatarFallbackText>{member.name}</AvatarFallbackText>
                  )}
                </Avatar>

                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>
                      {member.name}
                      {isCurrentUser && <Text style={styles.youBadge}> {t("members.you")}</Text>}
                    </Text>
                  </View>
                  <View style={styles.memberMeta}>
                    {getRoleIcon(member.role)}
                    <Text style={styles.memberRole}>{t(`members.roles.${member.role}`)}</Text>
                  </View>
                </View>

                {canManageThisMember && (
                  <Menu
                    placement="bottom left"
                    trigger={({ ...triggerProps }) => (
                      <TouchableOpacity {...triggerProps} style={styles.menuTrigger}>
                        <MoreVertical size={20} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  >
                    {/* Role change options */}
                    {isOwner && member.role === "member" && (
                      <MenuItem
                        key="make-admin"
                        onPress={() => handleRoleChange(member.id, member.name, "admin")}
                      >
                        <ShieldCheck size={16} color="#3b82f6" />
                        <MenuItemLabel>{t("members.actions.makeAdmin")}</MenuItemLabel>
                      </MenuItem>
                    )}
                    {isOwner && member.role === "admin" && (
                      <MenuItem
                        key="make-member"
                        onPress={() => handleRoleChange(member.id, member.name, "member")}
                      >
                        <Shield size={16} color="#6b7280" />
                        <MenuItemLabel>{t("members.actions.makeMember")}</MenuItemLabel>
                      </MenuItem>
                    )}
                    {/* Remove option */}
                    <MenuItem
                      key="remove"
                      onPress={() => handleRemoveMember(member.id, member.name, member.userId)}
                    >
                      <Trash2 size={16} color="#dc2626" />
                      <MenuItemLabel style={{ color: "#dc2626" }}>
                        {t("members.actions.remove")}
                      </MenuItemLabel>
                    </MenuItem>
                  </Menu>
                )}
              </View>
              {index < members.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}

        {members.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t("members.empty")}</Text>
            {onNavigateToInvite && (
              <TouchableOpacity style={styles.inviteEmptyButton} onPress={onNavigateToInvite}>
                <Text style={styles.inviteEmptyButtonText}>{t("members.inviteMore")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {(updateRole.isPending || removeMember.isPending) && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color="#dc2626" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  inviteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  membersList: {
    gap: 0,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  youBadge: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "400",
  },
  memberMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  memberRole: {
    fontSize: 13,
    color: "#6b7280",
  },
  menuTrigger: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 40,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  inviteEmptyButton: {
    backgroundColor: "#fef2f2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  inviteEmptyButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
});

export default MembersSettings;
