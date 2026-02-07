"use client";

/**
 * PrivacySettings - Analytics consent management
 *
 * Allows users to control their analytics data collection level:
 * - Disabled: No analytics data collected
 * - Anonymous: Anonymous usage data without personal identifiers
 * - Enabled: Full personalized analytics
 */

import { Shield, Eye, EyeOff, Check } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import type { AnalyticsConsent } from "@app/core-contract";
import { useAnalyticsConsent, useUpdateAnalyticsConsent } from "../../../../hooks";

interface ConsentOption {
  value: AnalyticsConsent;
  icon: typeof Shield;
  titleKey: string;
  descriptionKey: string;
}

const CONSENT_OPTIONS: ConsentOption[] = [
  {
    value: "disabled",
    icon: EyeOff,
    titleKey: "privacy.levels.disabled.title",
    descriptionKey: "privacy.levels.disabled.description",
  },
  {
    value: "anonymous",
    icon: Eye,
    titleKey: "privacy.levels.anonymous.title",
    descriptionKey: "privacy.levels.anonymous.description",
  },
  {
    value: "enabled",
    icon: Shield,
    titleKey: "privacy.levels.enabled.title",
    descriptionKey: "privacy.levels.enabled.description",
  },
];

export const PrivacySettings: React.FC = () => {
  const { t } = useTranslation("settings");
  const { data: consentData, isLoading } = useAnalyticsConsent();
  const updateConsent = useUpdateAnalyticsConsent();

  const [selectedConsent, setSelectedConsent] = useState<AnalyticsConsent>("anonymous");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Sync local state with server data
  useEffect(() => {
    if (consentData?.consent) {
      setSelectedConsent(consentData.consent);
    }
  }, [consentData?.consent]);

  const handleConsentChange = async (newConsent: AnalyticsConsent) => {
    if (newConsent === selectedConsent || saveStatus === "saving") return;

    setSelectedConsent(newConsent);
    setSaveStatus("saving");

    updateConsent.mutate(
      { consent: newConsent },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        },
        onError: () => {
          // Revert on error
          if (consentData?.consent) {
            setSelectedConsent(consentData.consent);
          }
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 3000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Shield size={20} color="#dc2626" />
          <Text style={styles.title}>{t("privacy.title")}</Text>
        </View>
        <Text style={styles.description}>{t("privacy.description")}</Text>

        <Text style={styles.subtitle}>{t("privacy.consentLevel")}</Text>
        <Text style={styles.subtitleDescription}>{t("privacy.consentDescription")}</Text>

        <View style={styles.optionsContainer}>
          {CONSENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedConsent === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleConsentChange(option.value)}
                activeOpacity={0.7}
                disabled={saveStatus === "saving"}
              >
                <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                  <Icon size={20} color={isSelected ? "#dc2626" : "#6b7280"} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {t(option.titleKey)}
                  </Text>
                  <Text style={styles.optionDescription}>{t(option.descriptionKey)}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color="#dc2626" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Status indicator */}
        {saveStatus !== "idle" && (
          <View style={styles.statusContainer}>
            {saveStatus === "saving" && (
              <>
                <ActivityIndicator size="small" color="#6b7280" />
                <Text style={styles.statusText}>{t("privacy.saving")}</Text>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check size={16} color="#16a34a" />
                <Text style={[styles.statusText, styles.statusSuccess]}>{t("privacy.saved")}</Text>
              </>
            )}
            {saveStatus === "error" && (
              <Text style={[styles.statusText, styles.statusError]}>{t("privacy.error")}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subtitleDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  optionSelected: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconSelected: {
    backgroundColor: "#fecaca",
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  optionTitleSelected: {
    color: "#dc2626",
  },
  optionDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  statusText: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusSuccess: {
    color: "#16a34a",
  },
  statusError: {
    color: "#dc2626",
  },
});

export default PrivacySettings;
