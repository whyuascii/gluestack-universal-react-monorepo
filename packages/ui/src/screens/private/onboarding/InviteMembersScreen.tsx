"use client";

/**
 * InviteMembersScreen - Onboarding step for inviting members
 */

import { PrimaryButton, EmailChipInput } from "@app/components";
import { ArrowLeft, UserPlus, Send } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";

export interface InviteMembersScreenProps {
  tenantName?: string;
  onSubmit: (emails: string[]) => Promise<void>;
  onSuccess: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export const InviteMembersScreen: React.FC<InviteMembersScreenProps> = ({
  tenantName,
  onSubmit,
  onSuccess,
  onSkip,
  onBack,
}) => {
  const { t } = useTranslation("group");
  const { width: screenWidth } = useWindowDimensions();
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const isSmallScreen = screenWidth < 380;
  const isLargeScreen = screenWidth >= 768;
  const horizontalPadding = isSmallScreen ? 16 : isLargeScreen ? 48 : 24;
  const cardPadding = isSmallScreen ? 20 : isLargeScreen ? 32 : 24;

  const handleSubmit = async () => {
    if (emails.length === 0) {
      setError(t("invite.validation.noEmails"));
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      await onSubmit(emails);
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("invite.error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={[styles.card, { padding: cardPadding }]}>
              {/* Header with Back Button */}
              <View style={styles.headerRow}>
                {onBack && (
                  <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
                    <ArrowLeft size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{t("invite.stepIndicator")}</Text>
                </View>
                {onBack && <View style={styles.backButtonPlaceholder} />}
              </View>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <UserPlus size={32} color="#dc2626" />
                </View>
              </View>

              {/* Title & Subtitle */}
              <View style={styles.textContainer}>
                <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
                  {t("invite.title")}
                </Text>
                <Text style={styles.subtitle}>
                  {tenantName
                    ? t("invite.subtitleWithGroup", { groupName: tenantName })
                    : t("invite.subtitle")}
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.formSection}>
                <Text style={styles.label}>{t("invite.emailLabel")}</Text>
                <EmailChipInput
                  emails={emails}
                  onChange={setEmails}
                  placeholder={t("invite.emailPlaceholder")}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
                <Text style={styles.hint}>{t("invite.hint")}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsSection}>
                <PrimaryButton
                  onPress={handleSubmit}
                  isLoading={loading}
                  isDisabled={emails.length === 0 || loading}
                  rightIcon={<Send size={18} color="#ffffff" />}
                >
                  {loading ? t("invite.sending") : t("invite.submit", { count: emails.length })}
                </PrimaryButton>

                {onSkip && (
                  <TouchableOpacity onPress={onSkip} style={styles.skipButton} activeOpacity={0.7}>
                    <Text style={styles.skipText}>{t("invite.skip")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  stepBadge: {
    flex: 1,
    alignItems: "center",
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  titleSmall: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    marginTop: 8,
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
    marginLeft: 4,
  },
  actionsSection: {
    gap: 16,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});

export default InviteMembersScreen;
