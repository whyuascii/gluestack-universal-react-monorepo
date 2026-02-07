import { useSession } from "@app/auth/client/native";
import { useUnreadCount } from "@app/notifications";
import { ROUTES } from "@app/ui";
import { Tabs, useRouter, usePathname, type Href } from "expo-router";
import { Home, CheckSquare, Users, Settings, Bell } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

type TabName = "dashboard" | "todos" | "group" | "settings";

/**
 * Animated Badge Component
 */
function AnimatedBadge({ count, previousCount }: { count: number; previousCount: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate when count increases
    if (count > previousCount && count > 0) {
      // Reset and animate
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Add a bounce effect
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    }
  }, [count, previousCount, scaleAnim, opacityAnim]);

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        headerStyles.badge,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={headerStyles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </Animated.View>
  );
}

/**
 * Simple Header Component for Mobile
 */
function MobileHeader({
  userName,
  onNotificationPress,
  onProfilePress,
  notificationCount = 0,
  previousCount = 0,
}: {
  userName?: string;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  notificationCount?: number;
  previousCount?: number;
}) {
  const initials = userName?.charAt(0).toUpperCase() || "U";
  const bellShakeAnim = useRef(new Animated.Value(0)).current;

  // Shake the bell when new notifications arrive
  useEffect(() => {
    if (notificationCount > previousCount && notificationCount > 0) {
      Animated.sequence([
        Animated.timing(bellShakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(bellShakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(bellShakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(bellShakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(bellShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [notificationCount, previousCount, bellShakeAnim]);

  const bellRotation = bellShakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.leftSection}>
        <Text style={headerStyles.greeting}>
          {userName ? `Hi, ${userName.split(" ")[0]}` : "Welcome"}
        </Text>
      </View>

      <View style={headerStyles.rightSection}>
        <TouchableOpacity
          style={headerStyles.iconButton}
          onPress={onNotificationPress}
          accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
        >
          <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
            <Bell size={22} color="#374151" />
          </Animated.View>
          <AnimatedBadge count={notificationCount} previousCount={previousCount} />
        </TouchableOpacity>

        <TouchableOpacity
          style={headerStyles.avatar}
          onPress={onProfilePress}
          accessibilityLabel="Profile"
        >
          <Text style={headerStyles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

/**
 * Simple Bottom Tabs Component for Mobile
 */
function MobileBottomTabs({
  activeTab,
  onNavigate,
}: {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
}) {
  const tabs: { name: TabName; label: string; icon: typeof Home }[] = [
    { name: "dashboard", label: "Home", icon: Home },
    { name: "todos", label: "Tasks", icon: CheckSquare },
    { name: "group", label: "Group", icon: Users },
    { name: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <View style={tabStyles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const IconComponent = tab.icon;

        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.tab}
            onPress={() => onNavigate(tab.name)}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <IconComponent
              size={24}
              color={isActive ? "#dc2626" : "#9ca3af"}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingBottom: 20, // Safe area padding for bottom
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9ca3af",
    marginTop: 4,
  },
  labelActive: {
    color: "#dc2626",
    fontWeight: "600",
  },
});

/**
 * Tabs Layout - Main tab navigation for authenticated users
 */
export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Poll for unread count every 5 seconds for real-time updates
  const { data: unreadData } = useUnreadCount({
    enabled: !!session,
    pollingInterval: 5000, // Poll every 5 seconds
  });

  // Track previous count for animation triggers
  const [previousCount, setPreviousCount] = useState(0);
  const currentCount = unreadData?.count ?? 0;

  useEffect(() => {
    // Update previous count after a short delay to allow animation
    const timer = setTimeout(() => {
      setPreviousCount(currentCount);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentCount]);

  // Determine active tab from pathname
  const getActiveTab = (): TabName => {
    if (pathname.includes("/dashboard")) return "dashboard";
    if (pathname.includes("/todos")) return "todos";
    if (pathname.includes("/group")) return "group";
    if (pathname.includes("/settings")) return "settings";
    return "dashboard";
  };

  const handleNavigate = (tab: TabName) => {
    const routes: Record<TabName, string> = {
      dashboard: ROUTES.DASHBOARD.mobile,
      todos: ROUTES.TODOS.mobile,
      group: ROUTES.GROUP.mobile,
      settings: ROUTES.SETTINGS.mobile,
    };
    router.push(routes[tab] as Href);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <MobileHeader
        userName={session?.user?.name}
        notificationCount={currentCount}
        previousCount={previousCount}
        onNotificationPress={() => router.push(ROUTES.NOTIFICATIONS.mobile as Href)}
        onProfilePress={() => router.push(ROUTES.PROFILE.mobile as Href)}
      />

      {/* Tab Content */}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          <Tabs.Screen name="dashboard" />
          <Tabs.Screen name="todos" />
          <Tabs.Screen name="group" />
          <Tabs.Screen name="settings" />
        </Tabs>
      </View>

      {/* Bottom Tabs */}
      <MobileBottomTabs activeTab={getActiveTab()} onNavigate={handleNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
  },
});
