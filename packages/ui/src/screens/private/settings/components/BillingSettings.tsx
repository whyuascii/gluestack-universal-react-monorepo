"use client";

/**
 * BillingSettings - Subscription and billing management
 *
 * Shows current plan, allows upgrade, and manages billing portal access.
 * Uses unified entitlements system for both Polar (web) and RevenueCat (mobile).
 */

import { CreditCard, Crown, ArrowUpRight, AlertTriangle, Check } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { useBillingStatus, useCheckout, useBillingPortal } from "../../../../hooks";
import { useAccessibilityAnnounce } from "../../../../hooks/useAccessibilityAnnounce";

interface BillingSettingsProps {
  /** Callback when checkout URL is generated (for web navigation) */
  onCheckout?: (url: string) => void;
  /** Callback when portal URL is generated (for web navigation) */
  onPortal?: (url: string) => void;
}

export const BillingSettings: React.FC<BillingSettingsProps> = ({ onCheckout, onPortal }) => {
  const { t } = useTranslation("subscriptions");
  const announce = useAccessibilityAnnounce();

  const billingStatus = useBillingStatus();
  const checkout = useCheckout();
  const portal = useBillingPortal();

  // The billing status returns TenantEntitlements directly
  const entitlements = billingStatus.data;
  const subscription = billingStatus.data?.subscription;
  const isPro = entitlements?.tier === "pro";
  const isGracePeriod = subscription?.status === "past_due";

  const handleUpgrade = async () => {
    try {
      const result = await checkout.mutateAsync({ planId: "pro" });
      if (result.checkoutUrl) {
        if (onCheckout) {
          onCheckout(result.checkoutUrl);
        } else {
          // Open in browser
          await Linking.openURL(result.checkoutUrl);
        }
        announce(t("billing.upgradeTitle"));
      }
    } catch {
      announce(t("billing.error"));
    }
  };

  const handlePortal = async () => {
    try {
      const result = await portal.mutateAsync({});
      if (result.portalUrl) {
        if (onPortal) {
          onPortal(result.portalUrl);
        } else {
          // Open in browser
          await Linking.openURL(result.portalUrl);
        }
      }
    } catch {
      announce(t("billing.error"));
    }
  };

  if (billingStatus.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>{t("billing.loading")}</Text>
      </View>
    );
  }

  if (billingStatus.isError) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={24} color="#dc2626" />
        <Text style={styles.errorText}>{t("billing.error")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Current Plan Section */}
      <View style={styles.section}>
        <Text style={styles.title}>{t("billing.currentPlan")}</Text>

        <View style={[styles.planCard, isPro && styles.planCardPro]}>
          <View style={styles.planHeader}>
            <View style={styles.planBadge}>
              {isPro ? (
                <Crown size={20} color="#fbbf24" />
              ) : (
                <CreditCard size={20} color="#6b7280" />
              )}
              <Text style={[styles.planName, isPro && styles.planNamePro]}>
                {isPro ? t("billing.proPlan") : t("billing.freePlan")}
              </Text>
            </View>
            {isPro && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{t("status.active")}</Text>
              </View>
            )}
          </View>

          {/* Features list */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Check size={16} color={isPro ? "#10b981" : "#6b7280"} />
              <Text style={styles.featureText}>
                {isPro
                  ? t("entitlements.unlimitedMembers")
                  : t("entitlements.maxMembers", {
                      count: entitlements?.features?.maxMembers || 5,
                    })}
              </Text>
            </View>
            {isPro && (
              <View style={styles.featureItem}>
                <Check size={16} color="#10b981" />
                <Text style={styles.featureText}>{t("entitlements.features")}</Text>
              </View>
            )}
          </View>

          {/* Grace period warning */}
          {isGracePeriod && (
            <View style={styles.warningBanner}>
              <AlertTriangle size={16} color="#f59e0b" />
              <Text style={styles.warningText}>{t("entitlements.gracePeriod")}</Text>
            </View>
          )}

          {/* Subscription details */}
          {subscription && (
            <View style={styles.subscriptionDetails}>
              {subscription.periodEnd && (
                <Text style={styles.detailText}>
                  {t("billing.nextBillingDate")}:{" "}
                  {new Date(subscription.periodEnd).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        {!isPro ? (
          // Upgrade button for free users
          <View style={styles.upgradeSection}>
            <Text style={styles.upgradeTitle}>{t("billing.upgradeTitle")}</Text>
            <Text style={styles.upgradeDescription}>{t("billing.upgradeDescription")}</Text>

            <Pressable
              style={[styles.upgradeButton, checkout.isPending && styles.buttonDisabled]}
              onPress={handleUpgrade}
              disabled={checkout.isPending}
              accessibilityRole="button"
              accessibilityLabel={t("billing.upgradeCta")}
              accessibilityState={{ disabled: checkout.isPending }}
              testID="billing-upgrade-button"
            >
              {checkout.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Crown size={18} color="#ffffff" />
                  <Text style={styles.upgradeButtonText}>{t("billing.upgradeCta")}</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          // Manage subscription for pro users
          <View style={styles.manageSection}>
            <Text style={styles.manageSectionTitle}>{t("billing.manageSubscription")}</Text>

            <Pressable
              style={[styles.portalButton, portal.isPending && styles.buttonDisabled]}
              onPress={handlePortal}
              disabled={portal.isPending}
              accessibilityRole="button"
              accessibilityLabel={t("billing.billingPortal")}
              accessibilityState={{ disabled: portal.isPending }}
              testID="billing-portal-button"
            >
              {portal.isPending ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <>
                  <CreditCard size={18} color="#dc2626" />
                  <Text style={styles.portalButtonText}>{t("billing.billingPortal")}</Text>
                  <ArrowUpRight size={16} color="#dc2626" />
                </>
              )}
            </Pressable>

            <Text style={styles.portalHint}>{t("billing.updatePayment")}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
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
  planCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  planCardPro: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  planNamePro: {
    color: "#92400e",
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#4b5563",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
  },
  subscriptionDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  detailText: {
    fontSize: 13,
    color: "#6b7280",
  },
  upgradeSection: {
    gap: 12,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  upgradeDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  upgradeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  manageSection: {
    gap: 12,
  },
  manageSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  portalButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  portalButtonText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  portalHint: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default BillingSettings;
