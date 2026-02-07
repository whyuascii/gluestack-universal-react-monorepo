"use client";

/**
 * GroupSettings - Group/tenant settings management
 *
 * Allows renaming the group and leaving the group.
 * Respects RBAC - only owners/admins can rename.
 */

import { AlertTriangle, LogOut } from "lucide-react-native";
import React, { useState, useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useUpdateTenant, useLeaveGroup } from "../../../../hooks";
import { useAccessibilityAnnounce } from "../../../../hooks/useAccessibilityAnnounce";

interface GroupSettingsProps {
  tenantName?: string;
  currentUserRole?: "owner" | "admin" | "member";
  onLeaveSuccess?: () => void;
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

export const GroupSettings: React.FC<GroupSettingsProps> = ({
  tenantName = "",
  currentUserRole = "member",
  onLeaveSuccess,
}) => {
  const { t } = useTranslation("settings");
  const [name, setName] = useState(tenantName);
  const [hasChanges, setHasChanges] = useState(false);
  const updateTenant = useUpdateTenant();
  const leaveGroup = useLeaveGroup();
  const announce = useAccessibilityAnnounce();

  // Accessibility IDs
  const baseId = useId();
  const nameInputId = `group-name-${baseId}`;

  const canEdit = currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = currentUserRole === "owner";

  useEffect(() => {
    setName(tenantName);
  }, [tenantName]);

  useEffect(() => {
    setHasChanges(name.trim() !== tenantName && name.trim().length > 0);
  }, [name, tenantName]);

  const handleSave = () => {
    if (!hasChanges || !canEdit) return;

    updateTenant.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setHasChanges(false);
          announce(t("group.saved"));
        },
        onError: () => {
          announce(t("group.error"));
        },
      }
    );
  };

  const showLeaveConfirmation = () => {
    showConfirmDialog(
      t("group.leaveGroup.title"),
      t("group.leaveGroup.message", { groupName: tenantName }),
      handleLeaveGroup,
      t("group.leaveGroup.confirm"),
      t("group.leaveGroup.cancel")
    );
  };

  const handleLeaveGroup = () => {
    leaveGroup.mutate(undefined, {
      onSuccess: () => {
        announce(t("group.leaveGroup.success"));
        onLeaveSuccess?.();
      },
      onError: () => {
        announce(t("group.leaveGroup.error"));
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Group Name Section */}
      <View style={styles.section}>
        <Text style={styles.title}>{t("group.title")}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label} nativeID={`${nameInputId}-label`}>
            {t("group.nameLabel")}
          </Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            nativeID={nameInputId}
            value={name}
            onChangeText={setName}
            placeholder={t("group.namePlaceholder")}
            placeholderTextColor="#9ca3af"
            editable={canEdit && !updateTenant.isPending}
            maxLength={100}
            returnKeyType="done"
            onSubmitEditing={handleSave}
            accessibilityLabel={t("group.nameLabel")}
            testID="group-settings-name-input"
          />
          {!canEdit && <Text style={styles.hintText}>{t("members.subtitle")}</Text>}
        </View>

        {canEdit && (
          <Pressable
            style={[
              styles.saveButton,
              (!hasChanges || updateTenant.isPending) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || updateTenant.isPending}
            accessibilityRole="button"
            accessibilityLabel={updateTenant.isPending ? t("group.saving") : t("group.save")}
            accessibilityState={{ disabled: !hasChanges || updateTenant.isPending }}
            testID="group-settings-save-button"
          >
            {updateTenant.isPending ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.saveButtonText}>{t("group.saving")}</Text>
              </>
            ) : (
              <Text style={styles.saveButtonText}>{t("group.save")}</Text>
            )}
          </Pressable>
        )}

        {updateTenant.isSuccess && (
          <Text style={styles.successText} role="status" aria-live="polite">
            {t("group.saved")}
          </Text>
        )}

        {updateTenant.isError && (
          <Text style={styles.errorText} role="alert" aria-live="assertive">
            {t("group.error")}
          </Text>
        )}
      </View>

      {/* Danger Zone - Leave Group */}
      {!isOwner && (
        <View style={styles.dangerSection}>
          <View style={styles.dangerHeader}>
            <AlertTriangle size={18} color="#dc2626" />
            <Text style={styles.dangerTitle}>{t("group.dangerZone")}</Text>
          </View>

          <Text style={styles.dangerDescription}>
            {t("group.leaveGroup.message", { groupName: tenantName })}
          </Text>

          <Pressable
            style={[styles.leaveButton, leaveGroup.isPending && styles.leaveButtonDisabled]}
            onPress={showLeaveConfirmation}
            disabled={leaveGroup.isPending}
            accessibilityRole="button"
            accessibilityLabel={
              leaveGroup.isPending ? t("group.leaveGroup.leaving") : t("group.leaveGroup.button")
            }
            accessibilityState={{ disabled: leaveGroup.isPending }}
            testID="group-settings-leave-button"
          >
            {leaveGroup.isPending ? (
              <>
                <ActivityIndicator size="small" color="#dc2626" />
                <Text style={styles.leaveButtonText}>{t("group.leaveGroup.leaving")}</Text>
              </>
            ) : (
              <>
                <LogOut size={18} color="#dc2626" />
                <Text style={styles.leaveButtonText}>{t("group.leaveGroup.button")}</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {isOwner && (
        <View style={styles.ownerNote}>
          <AlertTriangle size={16} color="#92400e" />
          <Text style={styles.ownerNoteText}>{t("group.leaveGroup.ownerWarning")}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
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
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
  hintText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  successText: {
    fontSize: 13,
    color: "#059669",
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    marginTop: 12,
  },
  dangerSection: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  dangerDescription: {
    fontSize: 14,
    color: "#7f1d1d",
    marginBottom: 16,
    lineHeight: 20,
  },
  leaveButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  leaveButtonDisabled: {
    opacity: 0.6,
  },
  leaveButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  ownerNote: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fcd34d",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  ownerNoteText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
});

export default GroupSettings;
