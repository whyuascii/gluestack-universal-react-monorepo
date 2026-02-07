"use client";

/**
 * CreateGroupScreen - Onboarding step for creating first group
 */

import { PrimaryButton } from "@app/components";
import { ArrowLeft, Users } from "lucide-react-native";
import React, { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useAccessibilityAnnounce } from "../../../hooks/useAccessibilityAnnounce";

export interface CreateGroupScreenProps {
  onSubmit: (name: string) => Promise<void>;
  onSuccess: (tenantId: string) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({
  onSubmit,
  onSuccess,
  onSkip,
  onBack,
}) => {
  const { t } = useTranslation("group");
  const { width: screenWidth } = useWindowDimensions();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const announce = useAccessibilityAnnounce();

  // Accessibility IDs
  const baseId = useId();
  const nameInputId = `group-name-${baseId}`;
  const nameErrorId = `${nameInputId}-error`;

  const isSmallScreen = screenWidth < 380;
  const isLargeScreen = screenWidth >= 768;
  const horizontalPadding = isSmallScreen ? 16 : isLargeScreen ? 48 : 24;
  const cardPadding = isSmallScreen ? 20 : isLargeScreen ? 32 : 24;

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError(t("create.validation.tooShort"));
      return;
    }

    if (trimmedName.length > 50) {
      setError(t("create.validation.tooLong"));
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      await onSubmit(trimmedName);
      announce(t("create.success"));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("create.error");
      setError(errorMessage);
      announce(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setSuggestion = (suggestion: string) => {
    setName(suggestion);
    setError(undefined);
  };

  const charCount = name.length;
  const isValid = charCount >= 2 && charCount <= 50;

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
                  <Pressable
                    onPress={onBack}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel={t("create.back")}
                    testID="create-group-back-button"
                  >
                    <ArrowLeft size={20} color="#6b7280" />
                  </Pressable>
                )}
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{t("create.stepIndicator")}</Text>
                </View>
                {onBack && <View style={styles.backButtonPlaceholder} />}
              </View>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Users size={32} color="#dc2626" />
                </View>
              </View>

              {/* Title & Subtitle */}
              <View style={styles.textContainer}>
                <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
                  {t("create.title")}
                </Text>
                <Text style={styles.subtitle}>{t("create.subtitle")}</Text>
              </View>

              {/* Form */}
              <View style={styles.formSection}>
                <Text style={styles.label} nativeID={`${nameInputId}-label`}>
                  {t("create.nameLabel")}
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Users size={18} color="#6b7280" />
                  </View>
                  <TextInput
                    style={styles.input}
                    nativeID={nameInputId}
                    placeholder={t("create.namePlaceholder")}
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setError(undefined);
                    }}
                    maxLength={50}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    accessibilityLabel={t("create.nameLabel")}
                    aria-invalid={!!error}
                    aria-describedby={error ? nameErrorId : undefined}
                    testID="create-group-name-input"
                  />
                </View>

                {error && (
                  <Text
                    style={styles.errorText}
                    nativeID={nameErrorId}
                    role="alert"
                    aria-live="assertive"
                  >
                    {error}
                  </Text>
                )}

                {/* Suggestions */}
                <View style={styles.suggestionsRow}>
                  <Text style={styles.suggestionsLabel}>{t("create.suggestions")}</Text>
                  <Pressable
                    onPress={() => setSuggestion(t("create.suggestion1"))}
                    accessibilityRole="button"
                    accessibilityLabel={t("create.useSuggestion", {
                      name: t("create.suggestion1"),
                    })}
                  >
                    <Text style={styles.suggestionText}>{t("create.suggestion1")}</Text>
                  </Pressable>
                  <Text style={styles.suggestionDot}>•</Text>
                  <Pressable
                    onPress={() => setSuggestion(t("create.suggestion2"))}
                    accessibilityRole="button"
                    accessibilityLabel={t("create.useSuggestion", {
                      name: t("create.suggestion2"),
                    })}
                  >
                    <Text style={styles.suggestionText}>{t("create.suggestion2")}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsSection}>
                <PrimaryButton
                  onPress={handleSubmit}
                  isLoading={loading}
                  isDisabled={!isValid || loading}
                  accessibilityLabel={loading ? t("create.creating") : t("create.submit")}
                  testID="create-group-submit-button"
                >
                  {loading ? t("create.creating") : t("create.submit")}
                </PrimaryButton>

                {onSkip && (
                  <Pressable
                    onPress={onSkip}
                    style={styles.skipButton}
                    accessibilityRole="button"
                    accessibilityLabel={t("create.skip")}
                    testID="create-group-skip-button"
                  >
                    <Text style={styles.skipText}>{t("create.skip")}</Text>
                  </Pressable>
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#111827",
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    marginTop: 8,
    marginLeft: 4,
  },
  suggestionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 12,
    marginLeft: 4,
    gap: 6,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  suggestionText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "500",
  },
  suggestionDot: {
    fontSize: 12,
    color: "#9ca3af",
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

export default CreateGroupScreen;
