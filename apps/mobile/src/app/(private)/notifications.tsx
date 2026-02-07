import type { Session } from "@app/auth";
import { useSession } from "@app/auth/client/native";
import { Text } from "@app/components";
import { NotificationsScreen } from "@app/ui";
import { useRouter, type Href } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Pressable } from "react-native";

export default function Notifications() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.title}>{t("navigation.notifications")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Notifications content */}
      <NotificationsScreen
        session={session as Session | null}
        onNotificationPress={(notification) => {
          if (notification.deepLink) {
            router.push(notification.deepLink as Href);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
});
