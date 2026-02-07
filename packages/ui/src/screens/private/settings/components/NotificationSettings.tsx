"use client";

/**
 * NotificationSettings - Notification preferences management
 *
 * Toggles for in-app, push, email, and marketing notifications.
 * Uses the notification preferences API to persist changes.
 */

import { Bell, Smartphone, Mail, Megaphone } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Switch } from "@app/components";
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferences,
} from "../../../../hooks";

interface NotificationToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled,
}) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleIcon}>{icon}</View>
    <View style={styles.toggleContent}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: "#e5e7eb", true: "#fecaca" }}
      thumbColor={value ? "#dc2626" : "#f4f3f4"}
    />
  </View>
);

export const NotificationSettings: React.FC = () => {
  const { t } = useTranslation("settings");
  const { data: preferences, isLoading, error } = useNotificationPreferencesQuery();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#dc2626" />
        <Text style={styles.loadingText}>{t("notifications.saving")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("notifications.error")}</Text>
      </View>
    );
  }

  // Default values if preferences don't exist yet
  const prefs = preferences ?? {
    inAppEnabled: true,
    pushEnabled: false,
    emailEnabled: true,
    marketingEmailEnabled: false,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("notifications.title")}</Text>
      <Text style={styles.subtitle}>{t("notifications.subtitle")}</Text>

      <View style={styles.togglesContainer}>
        <NotificationToggle
          icon={<Bell size={20} color="#6b7280" />}
          label={t("notifications.inApp.label")}
          description={t("notifications.inApp.description")}
          value={prefs.inAppEnabled}
          onValueChange={(value) => handleToggle("inAppEnabled", value)}
          disabled={updatePreferences.isPending}
        />

        <View style={styles.divider} />

        <NotificationToggle
          icon={<Smartphone size={20} color="#6b7280" />}
          label={t("notifications.push.label")}
          description={t("notifications.push.description")}
          value={prefs.pushEnabled}
          onValueChange={(value) => handleToggle("pushEnabled", value)}
          disabled={updatePreferences.isPending}
        />

        <View style={styles.divider} />

        <NotificationToggle
          icon={<Mail size={20} color="#6b7280" />}
          label={t("notifications.email.label")}
          description={t("notifications.email.description")}
          value={prefs.emailEnabled}
          onValueChange={(value) => handleToggle("emailEnabled", value)}
          disabled={updatePreferences.isPending}
        />

        <View style={styles.divider} />

        <NotificationToggle
          icon={<Megaphone size={20} color="#6b7280" />}
          label={t("notifications.marketing.label")}
          description={t("notifications.marketing.description")}
          value={prefs.marketingEmailEnabled}
          onValueChange={(value) => handleToggle("marketingEmailEnabled", value)}
          disabled={updatePreferences.isPending}
        />
      </View>

      {updatePreferences.isPending && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#dc2626" />
          <Text style={styles.savingText}>{t("notifications.saving")}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  togglesContainer: {
    gap: 0,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  toggleContent: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    color: "#6b7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 4,
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
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  savingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#6b7280",
  },
});

export default NotificationSettings;
