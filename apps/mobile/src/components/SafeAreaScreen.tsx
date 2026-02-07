import { Platform, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaScreenProps {
  children: React.ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
  backgroundColor?: string;
}

/**
 * Wrapper component that applies safe area insets to screens.
 * Use this in layouts to automatically handle notch/status bar spacing
 * without requiring individual screens to implement it.
 */
export function SafeAreaScreen({
  children,
  edges = ["top"],
  backgroundColor = "#f9fafb",
}: SafeAreaScreenProps) {
  const insets = useSafeAreaInsets();

  // Only apply safe area padding on native platforms
  if (Platform.OS === "web") {
    return <View style={[styles.container, { backgroundColor }]}>{children}</View>;
  }

  const paddingStyle = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
  };

  return <View style={[styles.container, { backgroundColor }, paddingStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
