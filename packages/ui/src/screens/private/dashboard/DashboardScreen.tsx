"use client";

/**
 * DashboardScreen - Main dashboard (private, authenticated)
 *
 * Shows user dashboard content with integration tests.
 * Navigation is handled by parent layout.
 */

import type { Session } from "@app/auth";
import React, { useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useDashboard, useIntegrationStatus } from "../../../hooks/queries";
import {
  useSendTestEmail,
  useSendTestNotification,
  useTrackTestEvent,
  useTestSubscription,
} from "../../../hooks/mutations";
import { useAccessibilityAnnounce } from "../../../hooks/useAccessibilityAnnounce";

export interface DashboardScreenProps {
  session: Session | null;
}

interface IntegrationCardProps {
  title: string;
  description: string;
  provider: string;
  configured: boolean;
  actionLabel: string;
  loadingLabel: string;
  successLabel: string;
  isLoading: boolean;
  onTest: () => void;
  lastResult?: { success: boolean; message?: string } | null;
  testID?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  title,
  description,
  provider,
  configured,
  actionLabel,
  loadingLabel,
  successLabel,
  isLoading,
  onTest,
  lastResult,
  testID,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <View style={styles.integrationCard} accessibilityLabel={`${title} integration`}>
      <View style={styles.integrationHeader}>
        <View style={styles.integrationInfo}>
          <Text style={styles.integrationTitle}>{title}</Text>
          <Text style={styles.integrationDescription}>{description}</Text>
          <Text style={styles.integrationProvider}>Provider: {provider}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            configured ? styles.statusConnected : styles.statusNotConfigured,
          ]}
          accessibilityLabel={
            configured
              ? t("integrations.posthog.status.connected")
              : t("integrations.posthog.status.notConfigured")
          }
        >
          <Text
            style={[
              styles.statusText,
              configured ? styles.statusTextConnected : styles.statusTextNotConfigured,
            ]}
          >
            {configured
              ? t("integrations.posthog.status.connected")
              : t("integrations.posthog.status.notConfigured")}
          </Text>
        </View>
      </View>

      {configured && (
        <View style={styles.integrationActions}>
          <Pressable
            style={[styles.testButton, isLoading && styles.testButtonDisabled]}
            onPress={onTest}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? loadingLabel : actionLabel}
            accessibilityState={{ disabled: isLoading }}
            testID={testID}
          >
            <Text style={styles.testButtonText}>{isLoading ? loadingLabel : actionLabel}</Text>
          </Pressable>

          {lastResult && (
            <View
              style={[
                styles.resultBadge,
                lastResult.success ? styles.resultSuccess : styles.resultError,
              ]}
              role={lastResult.success ? "status" : "alert"}
              aria-live={lastResult.success ? "polite" : "assertive"}
            >
              <Text
                style={[
                  styles.resultText,
                  lastResult.success ? styles.resultTextSuccess : styles.resultTextError,
                ]}
              >
                {lastResult.success ? successLabel : lastResult.message || "Failed"}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ session }) => {
  const { t } = useTranslation("dashboard");
  const { width: screenWidth } = useWindowDimensions();
  const { data, isLoading, error } = useDashboard(session);
  const { data: integrationStatus } = useIntegrationStatus(session);
  const announce = useAccessibilityAnnounce();

  // Test result states
  const [emailResult, setEmailResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  const [notificationResult, setNotificationResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  const [subscriptionResult, setSubscriptionResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  // Mutations
  const sendTestEmail = useSendTestEmail();
  const sendTestNotification = useSendTestNotification();
  const trackTestEvent = useTrackTestEvent();
  const testSubscription = useTestSubscription();

  const isSmallScreen = screenWidth < 380;
  const horizontalPadding = isSmallScreen ? 16 : 24;

  const userName = session?.user?.name?.split(" ")[0] || "User";

  const handleTestEmail = async () => {
    setEmailResult(null);
    try {
      const result = await sendTestEmail.mutateAsync(undefined);
      setEmailResult(result);
      announce(result.success ? t("integrations.resend.sent") : result.message || "Failed");
    } catch (err) {
      const errorMessage = "Failed to send email";
      setEmailResult({ success: false, message: errorMessage });
      announce(errorMessage);
    }
  };

  const handleTestNotification = async () => {
    setNotificationResult(null);
    try {
      const result = await sendTestNotification.mutateAsync(undefined);
      setNotificationResult(result);
      announce(result.success ? t("integrations.notifications.sent") : result.message || "Failed");
    } catch (err) {
      const errorMessage = "Failed to send notification";
      setNotificationResult({ success: false, message: errorMessage });
      announce(errorMessage);
    }
  };

  const handleTestAnalytics = async () => {
    setAnalyticsResult(null);
    try {
      const result = await trackTestEvent.mutateAsync(undefined);
      setAnalyticsResult(result);
      announce(result.success ? t("integrations.posthog.tracked") : result.message || "Failed");
    } catch (err) {
      const errorMessage = "Failed to track event";
      setAnalyticsResult({ success: false, message: errorMessage });
      announce(errorMessage);
    }
  };

  const handleTestSubscription = async () => {
    setSubscriptionResult(null);
    try {
      const result = await testSubscription.mutateAsync(undefined);
      setSubscriptionResult(result);
      announce(
        result.success ? t("integrations.revenuecat.configured") : result.message || "Failed"
      );
    } catch (err) {
      const errorMessage = "Failed to test subscription";
      setSubscriptionResult({ success: false, message: errorMessage });
      announce(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { paddingHorizontal: horizontalPadding }]}
        accessibilityLabel={t("loading")}
        accessibilityRole="progressbar"
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("loading")}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.container, { paddingHorizontal: horizontalPadding }]}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, isSmallScreen && styles.greetingSmall]}>
          {t("greeting", { name: userName })}
        </Text>
        <Text style={styles.subtitle}>{t("subtitle")}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.memberCount ?? 0}</Text>
          <Text style={styles.statLabel}>{t("stats.members")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.groupCount ?? 0}</Text>
          <Text style={styles.statLabel}>{t("stats.groups")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.eventCount ?? 0}</Text>
          <Text style={styles.statLabel}>{t("stats.events")}</Text>
        </View>
      </View>

      {/* Integrations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("integrations.title")}</Text>
        <Text style={styles.sectionSubtitle}>{t("integrations.subtitle")}</Text>

        {/* Email Integration */}
        <IntegrationCard
          title={t("integrations.resend.title")}
          description={t("integrations.resend.description")}
          provider={integrationStatus?.email?.provider || "Resend"}
          configured={integrationStatus?.email?.configured ?? false}
          actionLabel={t("integrations.resend.action")}
          loadingLabel={t("integrations.resend.sending")}
          successLabel={t("integrations.resend.sent")}
          isLoading={sendTestEmail.isPending}
          onTest={handleTestEmail}
          lastResult={emailResult}
          testID="dashboard-test-email-button"
        />

        {/* Notifications Integration */}
        <IntegrationCard
          title={t("integrations.notifications.title")}
          description={t("integrations.notifications.description")}
          provider={integrationStatus?.notifications?.provider || "Novu"}
          configured={integrationStatus?.notifications?.configured ?? false}
          actionLabel={t("integrations.notifications.action")}
          loadingLabel={t("integrations.notifications.sending")}
          successLabel={t("integrations.notifications.sent")}
          isLoading={sendTestNotification.isPending}
          onTest={handleTestNotification}
          lastResult={notificationResult}
          testID="dashboard-test-notification-button"
        />

        {/* Analytics Integration */}
        <IntegrationCard
          title={t("integrations.posthog.title")}
          description={t("integrations.posthog.description")}
          provider={integrationStatus?.analytics?.provider || "PostHog"}
          configured={integrationStatus?.analytics?.configured ?? false}
          actionLabel={t("integrations.posthog.action")}
          loadingLabel={t("integrations.posthog.tracking")}
          successLabel={t("integrations.posthog.tracked")}
          isLoading={trackTestEvent.isPending}
          onTest={handleTestAnalytics}
          lastResult={analyticsResult}
          testID="dashboard-test-analytics-button"
        />

        {/* Subscriptions Integration */}
        <IntegrationCard
          title={t("integrations.revenuecat.title")}
          description={t("integrations.revenuecat.description")}
          provider={integrationStatus?.subscriptions?.provider || "RevenueCat"}
          configured={integrationStatus?.subscriptions?.configured ?? false}
          actionLabel={t("integrations.revenuecat.action")}
          loadingLabel={t("integrations.revenuecat.testing")}
          successLabel={t("integrations.revenuecat.configured")}
          isLoading={testSubscription.isPending}
          onTest={handleTestSubscription}
          lastResult={subscriptionResult}
          testID="dashboard-test-subscription-button"
        />
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorBanner} role="alert" aria-live="assertive">
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingVertical: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  greetingSmall: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#dc2626",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  integrationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  integrationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  integrationInfo: {
    flex: 1,
    marginRight: 12,
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  integrationProvider: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConnected: {
    backgroundColor: "#dcfce7",
  },
  statusNotConfigured: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextConnected: {
    color: "#16a34a",
  },
  statusTextNotConfigured: {
    color: "#ca8a04",
  },
  integrationActions: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  testButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultSuccess: {
    backgroundColor: "#dcfce7",
  },
  resultError: {
    backgroundColor: "#fef2f2",
  },
  resultText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultTextSuccess: {
    color: "#16a34a",
  },
  resultTextError: {
    color: "#dc2626",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
});

export default DashboardScreen;
